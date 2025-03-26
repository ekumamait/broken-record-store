import {
    IsString,
    IsNumber,
    Min,
    Max,
    IsInt,
    IsEnum,
    IsOptional,
  } from 'class-validator';
  import { ApiProperty } from '@nestjs/swagger';
  import { RecordFormat, RecordCategory } from '../../common/enums/record.enum';
  
  export class UpdateRecordRequestDTO {
    @IsString()
    @IsOptional()
    artist?: string;
  
    @IsString()
    @IsOptional()
    album?: string;
  
    @IsNumber()
    @Min(0)
    @Max(10000)
    @IsOptional()
    price?: number;
  
    @IsInt()
    @Min(0)
    @Max(100)
    @IsOptional()
    qty?: number;
  
    @IsEnum(RecordFormat)
    @IsOptional()
    format?: RecordFormat;
  
    @IsEnum(RecordCategory)
    @IsOptional()
    category?: RecordCategory;
  
    @IsOptional()
    mbid?: string;
  
    @IsOptional()
    trackList?: Array<{ title: string; duration: string; position: number }>;
  }
  