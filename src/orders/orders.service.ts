import { BadRequestException, Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { CreateOrderRequestDTO } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Record } from 'src/schemas/record.schema';
import { Order } from 'src/schemas/order.schema';
import { ApiResponse } from 'src/common/utils/api-response.util';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel('Record') private readonly recordModel: Model<Record>,
    @InjectModel('Order') private readonly orderModel: Model<Order>,
  ) {}

  async createOrder(createOrderDto: CreateOrderRequestDTO): Promise<ApiResponse<Order>> {
    try {
      const { recordId, quantity } = createOrderDto;
      
      const record = await this.recordModel.findById(recordId);
      if (!record) {
        return ApiResponse.notFound('Record not found');
      }

      if (record.qty < quantity) {
        return ApiResponse.badRequest('Insufficient stock');
      }

      const totalPrice = record.price * quantity;

      const session = await this.orderModel.db.startSession();
      session.startTransaction();

      try {
        const order = await this.orderModel.create([{
          recordId,
          quantity,
          totalPrice,
          status: 'pending',
        }], { session });

        record.qty -= quantity;
        await record.save({ session });

        await session.commitTransaction();
        return ApiResponse.created(order[0], 'Order created successfully');
      } catch (error) {
        await session.abortTransaction();
        return ApiResponse.error('Failed to create order', HttpStatus.INTERNAL_SERVER_ERROR, error);
      } finally {
        session.endSession();
      }
    } catch (error) {
      return ApiResponse.error('Error processing order', HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async findAll(): Promise<ApiResponse<Order[]>> {
    try {
      const orders = await this.orderModel.find().exec();
      return ApiResponse.success(orders, 'Orders retrieved successfully');
    } catch (error) {
      return ApiResponse.error('Error retrieving orders', HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async findOne(id: string): Promise<ApiResponse<Order>> {
    try {
      const order = await this.orderModel.findById(id).exec();
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

      // If changing quantity, we need to update record stock
      if (updateOrderDto.quantity && updateOrderDto.quantity !== order.quantity) {
        const record = await this.recordModel.findById(order.recordId);
        if (!record) {
          return ApiResponse.notFound('Associated record not found');
        }

        // Calculate stock difference
        const quantityDifference = updateOrderDto.quantity - order.quantity;
        
        // Check if we have enough stock for an increase
        if (quantityDifference > 0 && record.qty < quantityDifference) {
          return ApiResponse.badRequest('Insufficient stock for quantity increase');
        }

        const session = await this.orderModel.db.startSession();
        session.startTransaction();

        try {
          // Update record stock
          record.qty -= quantityDifference;
          await record.save({ session });

          // Update order
          Object.assign(order, updateOrderDto);
          if (updateOrderDto.quantity) {
            order.totalPrice = record.price * updateOrderDto.quantity;
          }
          
          await order.save({ session });
          await session.commitTransaction();
        } catch (error) {
          await session.abortTransaction();
          return ApiResponse.error('Failed to update order', HttpStatus.INTERNAL_SERVER_ERROR, error);
        } finally {
          session.endSession();
        }
      } else {
        // Simple update without quantity change
        Object.assign(order, updateOrderDto);
        await order.save();
      }

      return ApiResponse.success(order, 'Order updated successfully');
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

      // If order is not cancelled, return stock to inventory
      if (order.status !== 'cancelled') {
        const record = await this.recordModel.findById(order.recordId);
        if (record) {
          const session = await this.orderModel.db.startSession();
          session.startTransaction();

          try {
            // Return stock to inventory
            record.qty += order.quantity;
            await record.save({ session });

            // Delete the order
            await this.orderModel.findByIdAndDelete(id, { session });
            
            await session.commitTransaction();
          } catch (error) {
            await session.abortTransaction();
            return ApiResponse.error('Failed to delete order', HttpStatus.INTERNAL_SERVER_ERROR, error);
          } finally {
            session.endSession();
          }
        }
      } else {
        // If order is already cancelled, just delete it
        await this.orderModel.findByIdAndDelete(id);
      }

      return ApiResponse.success(null, 'Order deleted successfully');
    } catch (error) {
      return ApiResponse.error('Error deleting order', HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }
}
