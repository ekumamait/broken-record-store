import { Injectable, InternalServerErrorException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Record } from '../schemas/record.schema';
import { CreateRecordRequestDTO } from './dto/create-record.dto';
import { UpdateRecordRequestDTO } from './dto/update-record.dto';
import { RecordCategory, RecordFormat } from '../common/enums/record.enum';
import { ApiResponse } from 'src/common/utils/api-response.util';

@Injectable()
export class RecordsService {
  constructor(
    @InjectModel('Record') private readonly recordModel: Model<Record>,
  ) {}

  async createRecord(createRecordDto: CreateRecordRequestDTO): Promise<ApiResponse<Record>> {
    const newRecord = await this.recordModel.create({
      ...createRecordDto
    });

    if (!newRecord) {
      return ApiResponse.error('Failed to create record');
    }
    return ApiResponse.created(newRecord, 'Record created successfully');
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
    q?: string,
    artist?: string,
    album?: string,
    format?: RecordFormat,
    category?: RecordCategory,
  ): Promise<ApiResponse<Record[]>> {
    try {
      const allRecords = await this.recordModel.find().exec();

      const filteredRecords = allRecords.filter((record) => {
        let match = true;

        if (q) {
          match =
            match &&
            (record.artist.includes(q) ||
              record.album.includes(q) ||
              record.category.includes(q));
        }

        if (artist) {
          match = match && record.artist.includes(artist);
        }

        if (album) {
          match = match && record.album.includes(album);
        }

        if (format) {
          match = match && record.format === format;
        }

        if (category) {
          match = match && record.category === category;
        }

        return match;
      });

      return ApiResponse.success(filteredRecords, 'Records retrieved successfully');
    } catch (error) {
      return ApiResponse.error('Error retrieving records', HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async findOneRecord(id: string): Promise<ApiResponse<Record>> {
    try {
      const record = await this.recordModel.findById(id).exec();
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
