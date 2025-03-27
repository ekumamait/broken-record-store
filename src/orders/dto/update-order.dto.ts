import { IsOptional, IsNumber, Min, IsEnum, IsMongoId } from "class-validator";
import { Type } from "class-transformer";

export class UpdateOrderDto {
  @IsOptional()
  @IsMongoId()
  recordId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  totalPrice?: number;

  @IsOptional()
  @IsEnum(["pending", "completed", "cancelled"])
  status?: string;
}
