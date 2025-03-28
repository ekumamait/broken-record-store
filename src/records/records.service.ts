import { Injectable, HttpStatus } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Record } from "../schemas/record.schema";
import { CreateRecordRequestDTO } from "./dto/create-record.dto";
import { UpdateRecordRequestDTO } from "./dto/update-record.dto";
import { ApiResponse } from "../common/utils/api-response.util";
import { FilterRecordDto } from "./dto/filter-record.dto";
import { PaginatedResponse } from "../common/utils/paginated-response.util";
import { CacheService } from "../cache/cache.service";
import { MusicBrainzService } from "../musicbrainz/musicbrainz.service";
import { MESSAGES } from "../common/constants/messages.constant";
import { CACHE_CONSTANTS } from "../common/constants/cache.constants";
import { UserDto } from "../authentication/dto/user.dto";
import { UserRole } from "../common/enums/user.enum";

@Injectable()
export class RecordsService {
  constructor(
    @InjectModel("Record") private readonly recordModel: Model<Record>,
    private readonly cacheService: CacheService,
    private readonly musicBrainzService: MusicBrainzService,
  ) {}

  async invalidateRecordsCache(): Promise<void> {
    await this.cacheService.invalidateByPattern(
      CACHE_CONSTANTS.KEYS.RECORDS_LIST,
    );
  }

  async invalidateRecordCache(id: string): Promise<void> {
    await this.cacheService.invalidateByPattern(
      `${CACHE_CONSTANTS.KEYS.RECORDS_DETAIL}:*${id}*`,
    );
  }

  private async validateMbid(mbid: string): Promise<boolean> {
    try {
      const trackList = await this.musicBrainzService.getAlbumDetails(mbid);
      return Array.isArray(trackList) && trackList.length > 0;
    } catch (error) {
      return false;
    }
  }

  async createRecord(
    user: UserDto,
    createRecordDto: CreateRecordRequestDTO,
  ): Promise<ApiResponse<Record>> {
    try {
      if (!this.checkRecordAccess(user.role)) {
        return ApiResponse.error(
          MESSAGES.ERROR.UNAUTHORIZED,
          HttpStatus.UNAUTHORIZED,
        );
      }
      const existingRecord = await this.recordModel.findOne({
        artist: createRecordDto.artist,
        album: createRecordDto.album,
        format: createRecordDto.format,
      });

      if (existingRecord) {
        return ApiResponse.error(
          MESSAGES.ERROR.RECORDS.DUPLICATE,
          HttpStatus.CONFLICT,
        );
      }
      const recordData = { ...createRecordDto };
      if (createRecordDto.mbid) {
        const isValidMbid = await this.validateMbid(createRecordDto.mbid);
        if (!isValidMbid) {
          return ApiResponse.error(
            MESSAGES.ERROR.RECORDS.MBID_NOT_FOUND(createRecordDto.mbid),
            HttpStatus.BAD_REQUEST,
          );
        }

        try {
          const trackList = await this.musicBrainzService.getAlbumDetails(
            createRecordDto.mbid,
          );
          if (trackList && trackList.length > 0) {
            recordData.trackList = trackList;
          }
        } catch (error) {
          return ApiResponse.error(
            `${MESSAGES.ERROR.RECORDS.MUSICBRAINZ_FETCH_ERROR} ${createRecordDto.mbid}: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
            error,
          );
        }
      }
      const newRecord = await this.recordModel.create(recordData);
      if (!newRecord) {
        return ApiResponse.error(MESSAGES.ERROR.RECORDS.CREATE_ERROR);
      }
      return ApiResponse.created(newRecord, MESSAGES.SUCCESS.RECORDS.CREATED);
    } catch (error) {
      return ApiResponse.error(
        MESSAGES.ERROR.RECORDS.CREATE_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  async updateRecord(
    user: UserDto,
    id: string,
    updateRecordDto: UpdateRecordRequestDTO,
  ): Promise<ApiResponse<Record>> {
    try {
      if (!this.checkRecordAccess(user.role)) {
        return ApiResponse.error(
          MESSAGES.ERROR.UNAUTHORIZED,
          HttpStatus.UNAUTHORIZED,
        );
      }
      const record = await this.recordModel.findById(id);
      if (!record) {
        return ApiResponse.notFound(
          MESSAGES.ERROR.RECORDS.RECORD_NOT_FOUND(id),
        );
      }
      if (updateRecordDto.mbid && updateRecordDto.mbid !== record.mbid) {
        try {
          const trackList = await this.musicBrainzService.getAlbumDetails(
            updateRecordDto.mbid,
          );
          if (trackList && trackList.length > 0) {
            updateRecordDto.trackList = trackList;
          }
        } catch (error) {
          return ApiResponse.error(
            `${MESSAGES.ERROR.RECORDS.MUSICBRAINZ_FETCH_ERROR} ${updateRecordDto.mbid}: ${error.message}`,
          );
        }
      }

      if (
        updateRecordDto.artist ||
        updateRecordDto.album ||
        updateRecordDto.format
      ) {
        const potentialDuplicate = await this.recordModel.findOne({
          artist: updateRecordDto.artist || record.artist,
          album: updateRecordDto.album || record.album,
          format: updateRecordDto.format || record.format,
          _id: { $ne: id },
        });

        if (potentialDuplicate) {
          return ApiResponse.error(
            MESSAGES.ERROR.RECORDS.UPDATE_DUPLICATE,
            HttpStatus.CONFLICT,
          );
        }
      }

      Object.assign(record, updateRecordDto);

      const updated = await record.save();
      if (!updated) {
        return ApiResponse.error(MESSAGES.ERROR.RECORDS.UPDATE_ERROR);
      }

      return ApiResponse.success(record, MESSAGES.SUCCESS.RECORDS.UPDATED);
    } catch (error) {
      return ApiResponse.error(
        MESSAGES.ERROR.RECORDS.UPDATE_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  async findAllRecords(
    filterDto: FilterRecordDto,
  ): Promise<ApiResponse<PaginatedResponse<Record>>> {
    try {
      const {
        q,
        artist,
        album,
        format,
        category,
        page = 1,
        limit = 10,
        sortBy = "artist",
        sortDirection = "asc",
      } = filterDto;

      const filter: any = {};

      if (q) {
        if (await this.hasTextIndex()) {
          filter.$text = { $search: q };
        } else {
          filter.$or = [
            { artist: { $regex: q, $options: "i" } },
            { album: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } },
          ];
        }
      }

      if (artist) filter.artist = { $regex: artist, $options: "i" };
      if (album) filter.album = { $regex: album, $options: "i" };
      if (format) filter.format = format;
      if (category) filter.category = category;

      const sort: any = {};
      sort[sortBy] = sortDirection === "asc" ? 1 : -1;

      const [total, records] = await Promise.all([
        this.recordModel.countDocuments(filter),
        this.recordModel
          .find(filter)
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean()
          .exec(),
      ]);

      const paginatedResponse = new PaginatedResponse<Record>(
        records,
        total,
        page,
        limit,
      );
      return ApiResponse.success(
        paginatedResponse,
        MESSAGES.SUCCESS.RECORDS.LIST_RETRIEVED,
      );
    } catch (error) {
      return ApiResponse.error(
        MESSAGES.ERROR.RECORDS.LIST_RETRIEVE_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  private async hasTextIndex(): Promise<boolean> {
    try {
      const indexes = await this.recordModel.collection.indexes();
      return indexes.some((index) => index.textIndexVersion);
    } catch {
      return false;
    }
  }

  async findOneRecord(id: string): Promise<ApiResponse<Record>> {
    try {
      const record = await this.recordModel.findById(id).lean().exec();
      if (!record) {
        return ApiResponse.notFound(
          MESSAGES.ERROR.RECORDS.RECORD_NOT_FOUND(id),
        );
      }
      return ApiResponse.success(record, MESSAGES.SUCCESS.RECORDS.RETRIEVED);
    } catch (error) {
      return ApiResponse.error(
        MESSAGES.ERROR.RECORDS.RETRIEVE_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  async removeRecord(user: UserDto, id: string): Promise<ApiResponse<any>> {
    try {
      if (!this.checkRecordAccess(user.role)) {
        return ApiResponse.error(
          MESSAGES.ERROR.UNAUTHORIZED,
          HttpStatus.UNAUTHORIZED,
        );
      }
      const result = await this.recordModel.findByIdAndDelete(id).exec();
      if (!result) {
        return ApiResponse.notFound(
          MESSAGES.ERROR.RECORDS.RECORD_NOT_FOUND(id),
        );
      }
      return ApiResponse.success(result, MESSAGES.SUCCESS.RECORDS.DELETED);
    } catch (error) {
      return ApiResponse.error(
        MESSAGES.ERROR.RECORDS.DELETE_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  private checkRecordAccess(userRole: UserRole): boolean {
    return userRole === UserRole.ADMIN;
  }
}
