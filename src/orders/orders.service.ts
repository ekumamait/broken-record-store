import { Injectable, HttpStatus } from "@nestjs/common";
import { CreateOrderRequestDTO } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Record } from "../schemas/record.schema";
import { Order } from "../schemas/order.schema";
import { ApiResponse } from "../common/utils/api-response.util";
import { CacheService } from "../cache/cache.service";
import { PaginatedResponse } from "../common/utils/paginated-response.util";
import { MESSAGES } from "../common/constants/messages.constant";
import { CACHE_CONSTANTS } from "../common/constants/cache.constants";

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel("Record") private readonly recordModel: Model<Record>,
    @InjectModel("Order") private readonly orderModel: Model<Order>,
    private readonly cacheService: CacheService,
  ) {}

  async invalidateOrdersCache(): Promise<void> {
    await this.cacheService.invalidateByPattern(
      CACHE_CONSTANTS.KEYS.ORDERS_LIST,
    );
  }

  async invalidateOrderCache(id: string): Promise<void> {
    await this.cacheService.invalidateByPattern(
      `${CACHE_CONSTANTS.KEYS.ORDERS_DETAIL}:*${id}*`,
    );
  }

  async create(
    createOrderDto: CreateOrderRequestDTO,
  ): Promise<ApiResponse<Order>> {
    try {
      const record = await this.recordModel.findById(createOrderDto.recordId);
      if (!record) {
        return ApiResponse.notFound(
          MESSAGES.ERROR.RECORDS.RECORD_NOT_FOUND(createOrderDto.recordId),
        );
      }
      if (record.qty < createOrderDto.quantity) {
        return ApiResponse.error(
          `${MESSAGES.ERROR.ORDERS.INSUFFICIENT_STOCK}: ${createOrderDto.quantity}, Available: ${record.qty}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      const totalPrice = record.price * createOrderDto.quantity;
      const newOrder = await this.orderModel.create({
        ...createOrderDto,
        totalPrice,
      });
      record.qty -= createOrderDto.quantity;
      await record.save();

      return ApiResponse.created(newOrder, MESSAGES.SUCCESS.ORDERS.CREATED);
    } catch (error) {
      return ApiResponse.error(
        MESSAGES.ERROR.ORDERS.CREATE_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<ApiResponse<PaginatedResponse<Order>>> {
    try {
      // Execute count query and find query in parallel
      const [total, orders] = await Promise.all([
        this.orderModel.countDocuments(),
        this.orderModel
          .find()
          .sort({ created: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate("recordId", "artist album format price")
          .lean()
          .exec(),
      ]);
      const paginatedResponse = new PaginatedResponse<Order>(
        orders,
        total,
        page,
        limit,
      );
      return ApiResponse.success(
        paginatedResponse,
        MESSAGES.SUCCESS.ORDERS.LIST_RETRIEVED,
      );
    } catch (error) {
      return ApiResponse.error(
        MESSAGES.ERROR.ORDERS.LIST_RETRIEVE_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  async findOne(id: string): Promise<ApiResponse<Order>> {
    try {
      const order = await this.orderModel
        .findById(id)
        .populate("recordId", "artist album format price")
        .lean()
        .exec();

      if (!order) {
        return ApiResponse.notFound(MESSAGES.ERROR.ORDERS.ORDER_NOT_FOUND(id));
      }
      return ApiResponse.success(order, MESSAGES.SUCCESS.ORDERS.RETRIEVED);
    } catch (error) {
      return ApiResponse.error(
        MESSAGES.ERROR.ORDERS.RETRIEVE_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<ApiResponse<Order>> {
    try {
      const order = await this.orderModel.findById(id);
      if (!order) {
        return ApiResponse.notFound(MESSAGES.ERROR.ORDERS.ORDER_NOT_FOUND(id));
      }
      if (
        updateOrderDto.quantity &&
        updateOrderDto.quantity !== order.quantity
      ) {
        const record = await this.recordModel.findById(order.recordId);
        if (!record) {
          return ApiResponse.notFound(
            MESSAGES.ERROR.RECORDS.ASSOCIATE_NOT_FOUND,
          );
        }

        // Calculate the difference in quantity
        const quantityDifference = updateOrderDto.quantity - order.quantity;

        // Check if there's enough stock for an increase
        if (quantityDifference > 0 && record.qty < quantityDifference) {
          return ApiResponse.error(
            `${MESSAGES.ERROR.ORDERS.INSUFFICIENT_STOCK}: ${quantityDifference}, Available: ${record.qty}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        // Update record quantity
        record.qty -= quantityDifference;
        await record.save();

        // Update total price
        updateOrderDto.totalPrice = record.price * updateOrderDto.quantity;
      }
      Object.assign(order, updateOrderDto);
      const updated = await order.save();
      return ApiResponse.success(updated, MESSAGES.SUCCESS.ORDERS.UPDATED);
    } catch (error) {
      return ApiResponse.error(
        MESSAGES.ERROR.ORDERS.UPDATE_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  async remove(id: string): Promise<ApiResponse<any>> {
    try {
      const order = await this.orderModel.findById(id);
      if (!order) {
        return ApiResponse.notFound(MESSAGES.ERROR.ORDERS.ORDER_NOT_FOUND(id));
      }
      // If the order is being deleted, return the quantity to the record
      const record = await this.recordModel.findById(order.recordId);
      if (record) {
        record.qty += order.quantity;
        await record.save();
      }
      await this.orderModel.findByIdAndDelete(id);
      return ApiResponse.success(null, MESSAGES.SUCCESS.ORDERS.DELETED);
    } catch (error) {
      return ApiResponse.error(
        MESSAGES.ERROR.ORDERS.DELETE_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }
}
