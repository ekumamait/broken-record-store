import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderRequestDTO } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiTags} from '@nestjs/swagger';
import { ApiResponse } from 'src/common/utils/api-response.util';
import { Order } from 'src/schemas/order.schema';

@ApiTags('Orders')
@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderRequestDTO): Promise<ApiResponse<Order>> {
    return await this.ordersService.createOrder(createOrderDto);
  }

  @Get()
  async findAll(): Promise<ApiResponse<Order[]>> {
    return await this.ordersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<Order>> {
    return await this.ordersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateOrderDto: UpdateOrderDto
  ): Promise<ApiResponse<Order>> {
    return await this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<any>> {
    return await this.ordersService.remove(id);
  }
}
