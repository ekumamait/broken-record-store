import {
    IsString,
    IsNumber,
    Min,
    Max,
    IsInt,
    IsEnum,
    IsOptional,
    ValidateNested,
  } from 'class-validator';
  import { RecordFormat, RecordCategory } from '../../common/enums/record.enum';
  import { Type } from 'class-transformer';
  
  class TrackDto {
    @IsString()
    title: string;
  
    @IsString()
    duration: string;
  
    @IsInt()
    @Min(1)
    @Type(() => Number)
    position: number;
  }
  
  export class UpdateRecordRequestDTO {
    @IsOptional()
    @IsString()
    artist?: string;
  
    @IsOptional()
    @IsString()
    album?: string;
  
    @IsOptional()
    @IsNumber()
    @Min(0.01)
    @Max(10000)
    @Type(() => Number)
    price?: number;
  
    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    @Type(() => Number)
    qty?: number;
  
    @IsEnum(RecordFormat)
    @IsOptional()
    format?: RecordFormat;

    @IsEnum(RecordCategory)
    @IsOptional()
    category?: RecordCategory;
  
    @IsOptional()
    @IsString()
    mbid?: string;
  
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => TrackDto)
    trackList?: Array<{ title: string; duration: string; position: number }>;
  }
  