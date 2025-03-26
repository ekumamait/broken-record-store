import { Injectable, HttpStatus } from '@nestjs/common';
import { CreateOrderRequestDTO } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Record } from '../schemas/record.schema';
import { Order } from '../schemas/order.schema';
import { ApiResponse } from '../common/utils/api-response.util';
import { CacheService } from '../cache/cache.service';
import { PaginatedResponse } from '../common/utils/paginated-response.util';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel('Record') private readonly recordModel: Model<Record>,
    @InjectModel('Order') private readonly orderModel: Model<Order>,
    private readonly cacheService: CacheService,
  ) {}

  async invalidateOrdersCache(): Promise<void> {
    await this.cacheService.invalidateByPattern('orders:list:*');
  }

  async invalidateOrderCache(id: string): Promise<void> {
    await this.cacheService.invalidateByPattern(`orders:detail:*${id}*`);
  }

  async create(createOrderDto: CreateOrderRequestDTO): Promise<ApiResponse<Order>> {
    try {
      // Find the record
      const record = await this.recordModel.findById(createOrderDto.recordId);
      if (!record) {
        return ApiResponse.notFound(`Record with ID ${createOrderDto.recordId} not found`);
      }

      // Check if there's enough quantity in stock
      if (record.qty < createOrderDto.quantity) {
        return ApiResponse.error(
          `Not enough records in stock. Requested: ${createOrderDto.quantity}, Available: ${record.qty}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Calculate total price
      const totalPrice = record.price * createOrderDto.quantity;

      // Create the order
      const newOrder = await this.orderModel.create({
        ...createOrderDto,
        totalPrice,
      });

      // Update record quantity
      record.qty -= createOrderDto.quantity;
      await record.save();

      return ApiResponse.created(newOrder, 'Order created successfully');
    } catch (error) {
      return ApiResponse.error('Error creating order', HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async findAll(page = 1, limit = 10): Promise<ApiResponse<PaginatedResponse<Order>>> {
    try {
      // Execute count query and find query in parallel
      const [total, orders] = await Promise.all([
        this.orderModel.countDocuments(),
        this.orderModel
          .find()
          .sort({ created: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate('recordId', 'artist album format price')
          .lean()
          .exec()
      ]);

      // Create paginated response
      const paginatedResponse = new PaginatedResponse<Order>(
        orders,
        total,
        page,
        limit
      );

      return ApiResponse.success(paginatedResponse, 'Orders retrieved successfully');
    } catch (error) {
      return ApiResponse.error('Error retrieving orders', HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async findOne(id: string): Promise<ApiResponse<Order>> {
    try {
      const order = await this.orderModel
        .findById(id)
        .populate('recordId', 'artist album format price')
        .lean()
        .exec();

      if (!order) {
        return ApiResponse.notFound(`Order with ID ${id} not found`);
      }

      return ApiResponse.success(order, 'Order retrieved successfully');
    } catch (error) {
      return ApiResponse.error('Error retrieving order', HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<ApiResponse<Order>> {
    try {
      const order = await this.orderModel.findById(id);
      if (!order) {
        return ApiResponse.notFound(`Order with ID ${id} not found`);
      }

      // If quantity is being updated, check stock and adjust record quantity
      if (updateOrderDto.quantity && updateOrderDto.quantity !== order.quantity) {
        const record = await this.recordModel.findById(order.recordId);
        if (!record) {
          return ApiResponse.notFound(`Record associated with this order not found`);
        }

        // Calculate the difference in quantity
        const quantityDifference = updateOrderDto.quantity - order.quantity;

        // Check if there's enough stock for an increase
        if (quantityDifference > 0 && record.qty < quantityDifference) {
          return ApiResponse.error(
            `Not enough records in stock. Additional needed: ${quantityDifference}, Available: ${record.qty}`,
            HttpStatus.BAD_REQUEST
          );
        }

        // Update record quantity
        record.qty -= quantityDifference;
        await record.save();

        // Update total price
        updateOrderDto.totalPrice = record.price * updateOrderDto.quantity;
      }

      // Update the order
      Object.assign(order, updateOrderDto);
      const updated = await order.save();

      return ApiResponse.success(updated, 'Order updated successfully');
    } catch (error) {
      return ApiResponse.error('Error updating order', HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async remove(id: string): Promise<ApiResponse<any>> {
    try {
      const order = await this.orderModel.findById(id);
      if (!order) {
        return ApiResponse.notFound(`Order with ID ${id} not found`);
      }

      // If the order is being deleted, return the quantity to the record
      const record = await this.recordModel.findById(order.recordId);
      if (record) {
        record.qty += order.quantity;
        await record.save();
      }

      // Delete the order
      await this.orderModel.findByIdAndDelete(id);

      return ApiResponse.success(null, 'Order deleted successfully');
    } catch (error) {
      return ApiResponse.error('Error deleting order', HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }
}
