import {
  IsString,
  IsNotEmpty,
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
  @IsNotEmpty()
  title: string;

  @IsString()
  duration: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  position: number;
}

export class CreateRecordRequestDTO {
  @IsNotEmpty()
  @IsString()
  artist: string;

  @IsNotEmpty()
  @IsString()
  album: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  qty: number;

  @IsNotEmpty()
  @IsEnum(RecordFormat)
  format: RecordFormat;

  @IsNotEmpty()
  @IsEnum(RecordCategory)
  category: RecordCategory;

  @IsOptional()
  @IsString()
  mbid?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TrackDto)
  trackList?: Array<{ title: string; duration: string; position: number }>;
}
