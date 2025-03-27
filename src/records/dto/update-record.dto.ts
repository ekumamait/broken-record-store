import {
  IsString,
  IsNumber,
  Min,
  Max,
  IsInt,
  IsEnum,
  IsOptional,
  ValidateNested,
} from "class-validator";
import { RecordFormat, RecordCategory } from "../../common/enums/record.enum";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

class TrackDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  duration: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  position: number;
}

export class UpdateRecordRequestDTO {
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
  @IsNumber()
  @Min(0.01)
  @Max(10000)
  @Type(() => Number)
  price?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  qty?: number;

  @ApiProperty()
  @IsEnum(RecordFormat)
  @IsOptional()
  format?: RecordFormat;

  @ApiProperty()
  @IsEnum(RecordCategory)
  @IsOptional()
  category?: RecordCategory;

  @ApiProperty()
  @IsOptional()
  @IsString()
  mbid?: string;

  @ApiProperty()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TrackDto)
  trackList?: Array<{ title: string; duration: string; position: number }>;
}
