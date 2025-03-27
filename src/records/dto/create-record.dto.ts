import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsInt,
  IsEnum,
  IsOptional,
  ValidateNested,
  Matches,
} from "class-validator";
import { RecordFormat, RecordCategory } from "../../common/enums/record.enum";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

class TrackDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
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

export class CreateRecordRequestDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  artist: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  album: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  qty: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(RecordFormat)
  format: RecordFormat;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(RecordCategory)
  category: RecordCategory;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
    message: "Invalid MBID format",
  })
  mbid?: string;

  @ApiProperty()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TrackDto)
  trackList?: Array<{ title: string; duration: string; position: number }>;
}
