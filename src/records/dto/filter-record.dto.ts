import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { RecordFormat, RecordCategory } from "../../common/enums/record.enum";
import { Type } from "class-transformer";

export class FilterRecordDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  artist?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  album?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(RecordFormat)
  format?: RecordFormat;

  @ApiProperty()
  @IsOptional()
  @IsEnum(RecordCategory)
  category?: RecordCategory;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty()
  @IsOptional()
  @IsString()
  sortBy?: string = "artist";

  @ApiProperty()
  @IsOptional()
  @IsString()
  sortDirection?: "asc" | "desc" = "asc";
}
