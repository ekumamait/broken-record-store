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
import { ApiOperation, ApiQuery, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { CreateRecordRequestDTO } from './dto/create-record.dto';
import { RecordCategory, RecordFormat } from '../common/enums/record.enum';
import { UpdateRecordRequestDTO } from './dto/update-record.dto';
import { RecordsService } from './records.service';
import { ApiResponse } from '../common/utils/api-response.util';

@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new record' })
  @SwaggerResponse({ status: 201, description: 'Record successfully created' })
  @SwaggerResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() request: CreateRecordRequestDTO): Promise<ApiResponse<Record>> {
    return await this.recordsService.create(request);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing record' })
  @SwaggerResponse({ status: 200, description: 'Record updated successfully' })
  @SwaggerResponse({ status: 404, description: 'Record not found' })
  @SwaggerResponse({ status: 500, description: 'Internal server error' })
  async update(
    @Param('id') id: string,
    @Body() updateRecordDto: UpdateRecordRequestDTO,
  ): Promise<ApiResponse<Record>> {
    return await this.recordsService.update(id, updateRecordDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all records with optional filters' })
  @SwaggerResponse({
    status: 200,
    description: 'List of records',
  })
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
    return await this.recordsService.findAll(q, artist, album, format, category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a record by ID' })
  @SwaggerResponse({ status: 200, description: 'Record found' })
  @SwaggerResponse({ status: 404, description: 'Record not found' })
  async findOne(@Param('id') id: string): Promise<ApiResponse<Record>> {
    return await this.recordsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a record' })
  @SwaggerResponse({ status: 200, description: 'Record deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Record not found' })
  async remove(@Param('id') id: string): Promise<ApiResponse<any>> {
    return await this.recordsService.remove(id);
  }
}


