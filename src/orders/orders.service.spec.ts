import { Test, TestingModule } from "@nestjs/testing";
import { OrdersService } from "./orders.service";
import { getModelToken } from "@nestjs/mongoose";
import { CacheService } from "../cache/cache.service";
import { CreateOrderRequestDTO } from "./dto/create-order.dto";
import { HttpStatus } from "@nestjs/common";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { UserRole } from "../common/enums/user.enum";

describe("OrdersService", () => {
  let service: OrdersService;
  let recordModel: any;
  let orderModel: any;
  let cacheService: CacheService;

  const mockUser = {
    email: "johndoe@email.com",
    role: UserRole.USER,
  };

  const mockAdmin = {
    email: "admin@email.com",
    role: UserRole.ADMIN,
  };

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
        { provide: getModelToken("Record"), useValue: recordModel },
        { provide: getModelToken("Order"), useValue: orderModel },
        { provide: CacheService, useValue: cacheService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create an order successfully", async () => {
      const createOrderDto: CreateOrderRequestDTO = {
        recordId: "record123",
        email: mockUser.email,
        quantity: 2,
      };

      const mockRecord = {
        _id: "record123",
        qty: 10,
        price: 20,
        save: jest.fn(),
      };
      recordModel.findById.mockResolvedValue(mockRecord);
      orderModel.create.mockResolvedValue({
        ...createOrderDto,
        totalPrice: 40,
      });

      const result = await service.create(createOrderDto);

      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.data.totalPrice).toBe(40);
      expect(mockRecord.save).toHaveBeenCalled();
    });

    it("should return not found if record does not exist", async () => {
      recordModel.findById.mockResolvedValue(null);

      const result = await service.create({
        recordId: "invalid",
        quantity: 2,
        email: mockUser.email,
      });

      expect(result.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe("findAll", () => {
    it("should return paginated orders for user", async () => {
      orderModel.countDocuments.mockResolvedValue(10);
      orderModel.exec.mockResolvedValue([{ _id: "order1" }]);

      const result = await service.findAll(mockUser, 1, 10);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data.items.length).toBe(1);
    });

    it("should return all orders for admin", async () => {
      orderModel.countDocuments.mockResolvedValue(20);
      orderModel.exec.mockResolvedValue([{ _id: "order1" }, { _id: "order2" }]);

      const result = await service.findAll(mockAdmin, 1, 10);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data.items.length).toBe(2);
    });
  });

  describe("findOne", () => {
    it("should return an order for its owner", async () => {
      orderModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          _id: "order1",
          email: mockUser.email,
        }),
      });

      const result = await service.findOne(mockUser, "order1");

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data._id).toBe("order1");
    });

    it("should return not found if order does not exist", async () => {
      orderModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findOne(mockUser, "invalid");

      expect(result.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe("update", () => {
    it("should update an order for its owner", async () => {
      const mockOrder = {
        _id: "order1",
        quantity: 2,
        recordId: "record1",
        email: mockUser.email,
        save: jest.fn(),
      };
      const mockRecord = {
        _id: "record1",
        qty: 10,
        price: 20,
        save: jest.fn(),
      };
      orderModel.findById.mockResolvedValue(mockOrder);
      recordModel.findById.mockResolvedValue(mockRecord);

      const updateDto: UpdateOrderDto = {
        quantity: 3,
        email: mockUser.email,
      };

      const result = await service.update(mockUser, "order1", updateDto);

      expect(result.status).toBe(HttpStatus.OK);
      expect(mockOrder.save).toHaveBeenCalled();
    });

    it("should return not found if order does not exist", async () => {
      orderModel.findById.mockResolvedValue(null);

      const result = await service.update(mockUser, "invalid", {
        quantity: 2,
        email: mockUser.email,
      });

      expect(result.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe("remove", () => {
    it("should delete an order for its owner", async () => {
      const mockOrder = {
        _id: "order1",
        quantity: 2,
        recordId: "record1",
        email: mockUser.email,
      };
      const mockRecord = {
        _id: "record1",
        qty: 10,
        save: jest.fn(),
      };

      orderModel.findById.mockResolvedValue(mockOrder);
      recordModel.findById.mockResolvedValue(mockRecord);
      orderModel.findByIdAndDelete.mockResolvedValue(null);

      const result = await service.remove(mockUser, "order1");

      expect(result.status).toBe(HttpStatus.OK);
      expect(mockRecord.save).toHaveBeenCalled();
    });

    it("should return not found if order does not exist", async () => {
      orderModel.findById.mockResolvedValue(null);

      const result = await service.remove(mockUser, "invalid");

      expect(result.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
