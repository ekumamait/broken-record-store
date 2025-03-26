import { PartialType } from '@nestjs/swagger';
import { CreateOrderRequestDTO } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderRequestDTO) {}
