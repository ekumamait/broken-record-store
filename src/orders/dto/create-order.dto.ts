import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsEmail,
  IsOptional,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderRequestDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  recordId: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;
}
