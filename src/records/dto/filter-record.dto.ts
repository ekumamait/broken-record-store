import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RecordFormat, RecordCategory } from '../../common/enums/record.enum';
import { Type } from 'class-transformer';

export class FilterRecordDto {
  @ApiProperty({
    description: 'Search query (searches across artist, album, category)',
    required: false,
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({
    description: 'Filter by artist name',
    required: false,
  })
  @IsOptional()
  @IsString()
  artist?: string;

  @ApiProperty({
    description: 'Filter by album name',
    required: false,
  })
  @IsOptional()
  @IsString()
  album?: string;

  @ApiProperty({
    description: 'Filter by record format (Vinyl, CD, etc.)',
    required: false,
    enum: RecordFormat,
  })
  @IsOptional()
  @IsEnum(RecordFormat)
  format?: RecordFormat;

  @ApiProperty({
    description: 'Filter by record category (e.g., Rock, Jazz)',
    required: false,
    enum: RecordCategory,
  })
  @IsOptional()
  @IsEnum(RecordCategory)
  category?: RecordCategory;

  @ApiProperty({
    description: 'Page number (starts from 1)',
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Sort field (e.g., price, artist, album)',
    required: false,
    default: 'artist'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'artist';

  @ApiProperty({
    description: 'Sort direction (asc or desc)',
    required: false,
    default: 'asc'
  })
  @IsOptional()
  @IsString()
  sortDirection?: 'asc' | 'desc' = 'asc';
} 