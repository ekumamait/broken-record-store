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
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateRecordRequestDTO } from './dto/create-record.dto';
import { RecordCategory, RecordFormat } from '../common/enums/record.enum';
import { UpdateRecordRequestDTO } from './dto/update-record.dto';
import { RecordsService } from './records.service';
import { ApiResponse } from '../common/utils/api-response.util';

@ApiTags('Records')
@Controller({ path: 'records', version: '1' })
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  async create(@Body() request: CreateRecordRequestDTO): Promise<ApiResponse<Record>> {
    return await this.recordsService.createRecord(request);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRecordDto: UpdateRecordRequestDTO,
  ): Promise<ApiResponse<Record>> {
    return await this.recordsService.updateRecord(id, updateRecordDto);
  }

  @Get()
  @ApiQuery({
    name: 'q',
    required: false,
    description:
      'Search query (search across multiple fields like artist, album, category, etc.)',
    type: String,
  })
  @ApiQuery({
    name: 'artist',
    required: false,
    description: 'Filter by artist name',
    type: String,
  })
  @ApiQuery({
    name: 'album',
    required: false,
    description: 'Filter by album name',
    type: String,
  })
  @ApiQuery({
    name: 'format',
    required: false,
    description: 'Filter by record format (Vinyl, CD, etc.)',
    enum: RecordFormat,
    type: String,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by record category (e.g., Rock, Jazz)',
    enum: RecordCategory,
    type: String,
  })
  async findAll(
    @Query('q') q?: string,
    @Query('artist') artist?: string,
    @Query('album') album?: string,
    @Query('format') format?: RecordFormat,
    @Query('category') category?: RecordCategory,
  ): Promise<ApiResponse<Record[]>> {
    return await this.recordsService.findAllRecords(q, artist, album, format, category);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<Record>> {
    return await this.recordsService.findOneRecord(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<any>> {
    return await this.recordsService.removeRecord(id);
  }
}


