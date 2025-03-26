import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsInt,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { RecordFormat, RecordCategory } from '../../common/enums/record.enum';

export class CreateRecordRequestDTO {
  @IsString()
  @IsNotEmpty()
  artist: string;

  @IsString()
  @IsNotEmpty()
  album: string;

  @IsNumber()
  @Min(0)
  @Max(10000)
  price: number;

  @IsInt()
  @Min(0)
  @Max(100)
  qty: number;

  @IsEnum(RecordFormat)
  @IsNotEmpty()
  format: RecordFormat;

  @IsEnum(RecordCategory)
  @IsNotEmpty()
  category: RecordCategory;

  @IsOptional()
  mbid?: string;
}
