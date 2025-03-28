import {
  Controller,
  Request,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { Record } from "../schemas/record.schema";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../authentication/guards/jwt.guard";

import { CreateRecordRequestDTO } from "./dto/create-record.dto";
import { RolesGuard } from "../authentication/guards/roles.guard";
import { UpdateRecordRequestDTO } from "./dto/update-record.dto";
import { RecordsService } from "./records.service";
import { ApiResponse } from "../common/utils/api-response.util";
import { FilterRecordDto } from "./dto/filter-record.dto";
import { PaginatedResponse } from "../common/utils/paginated-response.util";
import { UseCache } from "../cache/cache.decorator";
import { CACHE_CONSTANTS } from "../common/constants/cache.constants";

@ApiTags("Records")
@Controller({ path: "records", version: "1" })
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(
    @Request() req,
    @Body() createRecordRequestDTO: CreateRecordRequestDTO,
  ): Promise<ApiResponse<Record>> {
    const result = await this.recordsService.createRecord(
      req.user,
      createRecordRequestDTO,
    );
    await this.recordsService.invalidateRecordsCache();
    return result;
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Request() req,
    @Param("id") id: string,
    @Body() updateRecordDto: UpdateRecordRequestDTO,
  ): Promise<ApiResponse<Record>> {
    const result = await this.recordsService.updateRecord(
      req.user,
      id,
      updateRecordDto,
    );
    await this.recordsService.invalidateRecordsCache();
    await this.recordsService.invalidateRecordCache(id);
    return result;
  }

  @Get()
  @UseCache({ keyPrefix: CACHE_CONSTANTS.KEYS.RECORDS_LIST, ttl: 300 })
  async findAll(
    @Query() filterDto: FilterRecordDto,
  ): Promise<ApiResponse<PaginatedResponse<Record>>> {
    return await this.recordsService.findAllRecords(filterDto);
  }

  @Get(":id")
  @UseCache({ keyPrefix: CACHE_CONSTANTS.KEYS.RECORDS_DETAIL, ttl: 600 })
  async findOne(@Param("id") id: string): Promise<ApiResponse<Record>> {
    return await this.recordsService.findOneRecord(id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(
    @Request() req,
    @Param("id") id: string,
  ): Promise<ApiResponse<any>> {
    const result = await this.recordsService.removeRecord(req.user, id);
    await this.recordsService.invalidateRecordsCache();
    await this.recordsService.invalidateRecordCache(id);
    return result;
  }
}
