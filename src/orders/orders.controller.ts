import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderRequestDTO } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../common/utils/api-response.util';
import { Order } from '../schemas/order.schema';
import { UseCache } from '../cache/cache.decorator';
import { PaginatedResponse } from '../common/utils/paginated-response.util';

@ApiTags('Orders')
@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderRequestDTO): Promise<ApiResponse<Order>> {
    const result = await this.ordersService.create(createOrderDto);
    await this.ordersService.invalidateOrdersCache();
    return result;
  }

  @Get()
  @UseCache({ keyPrefix: 'orders:list', ttl: 300 })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ): Promise<ApiResponse<PaginatedResponse<Order>>> {
    return await this.ordersService.findAll(+page, +limit);
  }

  @Get(':id')
  @UseCache({ keyPrefix: 'orders:detail', ttl: 300 })
  async findOne(@Param('id') id: string): Promise<ApiResponse<Order>> {
    return await this.ordersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto
  ): Promise<ApiResponse<Order>> {
    const result = await this.ordersService.update(id, updateOrderDto);
    await this.ordersService.invalidateOrdersCache();
    await this.ordersService.invalidateOrderCache(id);
    return result;
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<any>> {
    const result = await this.ordersService.remove(id);
    await this.ordersService.invalidateOrdersCache();
    await this.ordersService.invalidateOrderCache(id);
    return result;
  }
}
