import {
  Controller,
  Request,
  UseGuards,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { JwtAuthGuard } from "../authentication/guards/jwt.guard";
import { RolesGuard } from "../authentication/guards/roles.guard";
import { CreateOrderRequestDTO } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { ApiTags } from "@nestjs/swagger";
import { ApiResponse } from "../common/utils/api-response.util";
import { Order } from "../schemas/order.schema";
import { UseCache } from "../cache/cache.decorator";
import { PaginatedResponse } from "../common/utils/paginated-response.util";
import { CACHE_CONSTANTS } from "../common/constants/cache.constants";

@ApiTags("Orders")
@Controller({ path: "orders", version: "1" })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(
    @Request() req,
    @Body() createOrderDto: CreateOrderRequestDTO,
  ): Promise<ApiResponse<Order>> {
    createOrderDto.email = req.user.email;
    const result = await this.ordersService.create(createOrderDto);
    await this.ordersService.invalidateOrdersCache();
    return result;
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseCache({ keyPrefix: CACHE_CONSTANTS.KEYS.ORDERS_LIST, ttl: 300 })
  async findAll(
    @Request() req,
    @Query("page") page = 1,
    @Query("limit") limit = 10,
  ): Promise<ApiResponse<PaginatedResponse<Order>>> {
    return await this.ordersService.findAll(req.user, +page, +limit);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseCache({ keyPrefix: CACHE_CONSTANTS.KEYS.ORDERS_DETAIL, ttl: 300 })
  async findOne(
    @Request() req,
    @Param("id") id: string,
  ): Promise<ApiResponse<Order>> {
    return await this.ordersService.findOne(req.user, id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Request() req,
    @Param("id") id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<ApiResponse<Order>> {
    const result = await this.ordersService.update(
      req.user,
      id,
      updateOrderDto,
    );
    await this.ordersService.invalidateOrdersCache();
    await this.ordersService.invalidateOrderCache(id);
    return result;
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(
    @Request() req,
    @Param("id") id: string,
  ): Promise<ApiResponse<any>> {
    const result = await this.ordersService.remove(req.user, id);
    await this.ordersService.invalidateOrdersCache();
    await this.ordersService.invalidateOrderCache(id);
    return result;
  }
}
