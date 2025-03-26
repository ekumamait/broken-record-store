import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getModelToken } from '@nestjs/mongoose';
import { CacheService } from '../cache/cache.service';
import { CreateOrderRequestDTO } from './dto/create-order.dto';
import { HttpStatus } from '@nestjs/common';
import { UpdateOrderDto } from './dto/update-order.dto';

describe('OrdersService', () => {
  let service: OrdersService;
  let recordModel: any;
  let orderModel: any;
  let cacheService: CacheService;

  beforeEach(async () => {
    recordModel = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    orderModel = {
      create: jest.fn(),
      findById: jest.fn(),
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn(),
      countDocuments: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    cacheService = {
      invalidateByPattern: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken('Record'), useValue: recordModel },
        { provide: getModelToken('Order'), useValue: orderModel },
        { provide: CacheService, useValue: cacheService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      const createOrderDto: CreateOrderRequestDTO = {
        recordId: 'record123',
        quantity: 2,
      };

      const mockRecord = { _id: 'record123', qty: 10, price: 20, save: jest.fn() };
      recordModel.findById.mockResolvedValue(mockRecord);
      orderModel.create.mockResolvedValue({ ...createOrderDto, totalPrice: 40 });

      const result = await service.create(createOrderDto);

      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.data.totalPrice).toBe(40);
      expect(mockRecord.save).toHaveBeenCalled();
    });

    it('should return not found if record does not exist', async () => {
      recordModel.findById.mockResolvedValue(null);

      const result = await service.create({ recordId: 'invalid', quantity: 2 });

      expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return error if not enough stock', async () => {
      recordModel.findById.mockResolvedValue({ qty: 1 });

      const result = await service.create({ recordId: 'record123', quantity: 2 });

      expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      orderModel.countDocuments.mockResolvedValue(10);
      orderModel.exec.mockResolvedValue([{ _id: 'order1' }]);

      const result = await service.findAll(1, 10);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.data.items.length).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return an order', async () => {
      orderModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ _id: 'order1' }),
      });

      const result = await service.findOne('order1');

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.data._id).toBe('order1');
    });

    it('should return not found if order does not exist', async () => {
      orderModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findOne('invalid');

      expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      const mockOrder = { _id: 'order1', quantity: 2, recordId: 'record1', save: jest.fn() };
      const mockRecord = { _id: 'record1', qty: 10, price: 20, save: jest.fn() };
      orderModel.findById.mockResolvedValue(mockOrder);
      recordModel.findById.mockResolvedValue(mockRecord);

      const updateDto: UpdateOrderDto = { quantity: 3 };
      const result = await service.update('order1', updateDto);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(mockOrder.save).toHaveBeenCalled();
    });

    it('should return not found if order does not exist', async () => {
      orderModel.findById.mockResolvedValue(null);

      const result = await service.update('invalid', { quantity: 2 });

      expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('remove', () => {
    it('should delete an order', async () => {
      const mockOrder = { _id: 'order1', quantity: 2, recordId: 'record1' };
      const mockRecord = { _id: 'record1', qty: 10, save: jest.fn() };
      orderModel.findById.mockResolvedValue(mockOrder);
      recordModel.findById.mockResolvedValue(mockRecord);
      orderModel.findByIdAndDelete.mockResolvedValue(null);

      const result = await service.remove('order1');

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(mockRecord.save).toHaveBeenCalled();
    });

    it('should return not found if order does not exist', async () => {
      orderModel.findById.mockResolvedValue(null);

      const result = await service.remove('invalid');

      expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
