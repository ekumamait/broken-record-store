import {
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
  IsMongoId,
  IsEmail,
  IsNotEmpty,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class UpdateOrderDto {
  @ApiProperty()
  @IsOptional()
  @IsMongoId()
  recordId?: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  totalPrice?: number;

  @ApiProperty()
  @IsOptional()
  @IsEnum(["pending", "completed", "cancelled"])
  status?: string;
}
