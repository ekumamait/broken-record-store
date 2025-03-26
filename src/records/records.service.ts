import { Injectable, InternalServerErrorException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Record } from '../schemas/record.schema';
import { CreateRecordRequestDTO } from './dto/create-record.dto';
import { UpdateRecordRequestDTO } from './dto/update-record.dto';
import { ApiResponse } from 'src/common/utils/api-response.util';
import { FilterRecordDto } from './dto/filter-record.dto';
import { PaginatedResponse } from '../common/utils/paginated-response.util';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class RecordsService {
  constructor(
    @InjectModel('Record') private readonly recordModel: Model<Record>,
    private readonly cacheService: CacheService,
  ) {}

  async invalidateRecordsCache(): Promise<void> {
    await this.cacheService.invalidateByPattern('records:list:*');
  }

  async invalidateRecordCache(id: string): Promise<void> {
    await this.cacheService.invalidateByPattern(`records:detail:*${id}*`);
  }

  async createRecord(createRecordDto: CreateRecordRequestDTO): Promise<ApiResponse<Record>> {
    try {
      const newRecord = await this.recordModel.create({
        ...createRecordDto
      });

      if (!newRecord) {
        return ApiResponse.error('Failed to create record');
      }
      
      return ApiResponse.created(newRecord, 'Record created successfully');
    } catch (error) {
      return ApiResponse.error('Error creating record', HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async updateRecord(id: string, updateRecordDto: UpdateRecordRequestDTO): Promise<ApiResponse<Record>> {
    try {
      const record = await this.recordModel.findById(id);
      if (!record) {
        return ApiResponse.notFound(`Record with ID ${id} not found`);
      }

      Object.assign(record, updateRecordDto);

      const updated = await record.save();
      if (!updated) {
        return ApiResponse.error('Failed to update record');
      }
      
      return ApiResponse.success(record, 'Record updated successfully');
    } catch (error) {
      return ApiResponse.error('Error updating record', HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async findAllRecords(
    filterDto: FilterRecordDto
  ): Promise<ApiResponse<PaginatedResponse<Record>>> {
    try {
      const { q, artist, album, format, category, page = 1, limit = 10, sortBy = 'artist', sortDirection = 'asc' } = filterDto;
      
      // Build the filter object
      const filter: any = {};
      
      if (q) {
        // Using $text search if you have a text index set up
        if (this.hasTextIndex()) {
          filter.$text = { $search: q };
        } else {
          // Fallback to regex if no text index
          filter.$or = [
            { artist: { $regex: q, $options: 'i' } },
            { album: { $regex: q, $options: 'i' } },
            { category: { $regex: q, $options: 'i' } }
          ];
        }
      }
      
      if (artist) filter.artist = { $regex: artist, $options: 'i' };
      if (album) filter.album = { $regex: album, $options: 'i' };
      if (format) filter.format = format;
      if (category) filter.category = category;
      
      // Create sort object
      const sort: any = {};
      sort[sortBy] = sortDirection === 'asc' ? 1 : -1;
      
      // Execute count query and find query in parallel
      const [total, records] = await Promise.all([
        this.recordModel.countDocuments(filter),
        this.recordModel
          .find(filter)
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean()
          .exec()
      ]);
      
      // Create paginated response
      const paginatedResponse = new PaginatedResponse<Record>(
        records,
        total,
        page,
        limit
      );
      
      return ApiResponse.success(paginatedResponse, 'Records retrieved successfully');
    } catch (error) {
      return ApiResponse.error('Error retrieving records', HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  // Helper method to check if text index exists
  private async hasTextIndex(): Promise<boolean> {
    try {
      const indexes = await this.recordModel.collection.indexes();
      return indexes.some(index => index.textIndexVersion);
    } catch {
      return false;
    }
  }

  async findOneRecord(id: string): Promise<ApiResponse<Record>> {
    try {
      const record = await this.recordModel.findById(id).lean().exec();
      if (!record) {
        return ApiResponse.notFound(`Record with ID ${id} not found`);
      }
      
      return ApiResponse.success(record, 'Record retrieved successfully');
    } catch (error) {
      return ApiResponse.error('Error retrieving record', HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async removeRecord(id: string): Promise<ApiResponse<any>> {
    try {
      const result = await this.recordModel.findByIdAndDelete(id).exec();
      if (!result) {
        return ApiResponse.notFound(`Record with ID ${id} not found`);
      }
      
      return ApiResponse.success(result, 'Record deleted successfully');
    } catch (error) {
      return ApiResponse.error('Error deleting record', HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }
}
