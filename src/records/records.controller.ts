import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { Record } from '../schemas/record.schema';
import { ApiTags } from '@nestjs/swagger';
import { CreateRecordRequestDTO } from './dto/create-record.dto';
import { RecordCategory, RecordFormat } from '../common/enums/record.enum';
import { UpdateRecordRequestDTO } from './dto/update-record.dto';
import { RecordsService } from './records.service';
import { ApiResponse } from '../common/utils/api-response.util';
import { FilterRecordDto } from './dto/filter-record.dto';
import { PaginatedResponse } from '../common/utils/paginated-response.util';
import { UseCache } from '../cache/cache.decorator';

@ApiTags('Records')
@Controller({ path: 'records', version: '1' })
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  async create(@Body() request: CreateRecordRequestDTO): Promise<ApiResponse<Record>> {
    const result = await this.recordsService.createRecord(request);
    await this.recordsService.invalidateRecordsCache();
    return result;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRecordDto: UpdateRecordRequestDTO,
  ): Promise<ApiResponse<Record>> {
    const result = await this.recordsService.updateRecord(id, updateRecordDto);
    await this.recordsService.invalidateRecordsCache();
    await this.recordsService.invalidateRecordCache(id);
    return result;
  }

  @Get()
  @UseCache({ keyPrefix: 'records:list', ttl: 300 })
  async findAll(
    @Query() filterDto: FilterRecordDto
  ): Promise<ApiResponse<PaginatedResponse<Record>>> {
    return await this.recordsService.findAllRecords(filterDto);
  }

  @Get(':id')
  @UseCache({ keyPrefix: 'records:detail', ttl: 600 })
  async findOne(@Param('id') id: string): Promise<ApiResponse<Record>> {
    return await this.recordsService.findOneRecord(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<any>> {
    const result = await this.recordsService.removeRecord(id);
    await this.recordsService.invalidateRecordsCache();
    await this.recordsService.invalidateRecordCache(id);
    return result;
  }
}


