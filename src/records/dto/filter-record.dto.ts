import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { RecordFormat, RecordCategory } from "../../common/enums/record.enum";
import { Type } from "class-transformer";

export class FilterRecordDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  artist?: string;

  @IsOptional()
  @IsString()
  album?: string;

  @IsOptional()
  @IsEnum(RecordFormat)
  format?: RecordFormat;

  @IsOptional()
  @IsEnum(RecordCategory)
  category?: RecordCategory;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = "artist";

  @IsOptional()
  @IsString()
  sortDirection?: "asc" | "desc" = "asc";
}
