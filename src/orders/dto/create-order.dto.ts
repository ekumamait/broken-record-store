import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateOrderRequestDTO {
  @IsString()
  @IsNotEmpty()
  recordId: string;

  @IsInt()
  @Min(1)
  quantity: number;
} 