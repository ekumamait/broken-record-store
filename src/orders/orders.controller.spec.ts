import { Test, TestingModule } from "@nestjs/testing";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { CreateOrderRequestDTO } from "./dto/create-order.dto";
import { ApiResponse } from "../common/utils/api-response.util";
import { PaginatedResponse } from "../common/utils/paginated-response.util";
import { Types } from "mongoose";
import { Order } from "../schemas/order.schema";
import { UserRole } from "../common/enums/user.enum";

describe("OrdersController", () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockOrder: Order = {
    _id: "1",
    email: "johndoe@mail.com",
    recordId: new Types.ObjectId("67e3e30a810d696976b8f05f"),
    quantity: 2,
    totalPrice: 40,
    status: "pending",
    created: new Date(),
    lastModified: new Date(),
  } as unknown as Order;

  const mockRequest = {
    user: {
      email: "johndoe@mail.com",
      role: UserRole.USER,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            invalidateOrdersCache: jest.fn(),
            invalidateOrderCache: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  describe("create", () => {
    it("should create an order", async () => {
      const createOrderDto: CreateOrderRequestDTO = {
        recordId: "123",
        email: "johndoe@mail.com",
        quantity: 2,
      };

      const expectedResponse = ApiResponse.created(mockOrder);
      jest.spyOn(service, "create").mockResolvedValue(expectedResponse);
      jest.spyOn(service, "invalidateOrdersCache").mockResolvedValue();

      const result = await controller.create(mockRequest, createOrderDto);

      expect(result).toEqual(expectedResponse);
      expect(service.create).toHaveBeenCalledWith({
        ...createOrderDto,
        email: mockRequest.user.email,
      });
      expect(service.invalidateOrdersCache).toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("should return paginated orders", async () => {
      const paginatedResponse = new PaginatedResponse([mockOrder], 1, 1, 10);

      const expectedResponse = ApiResponse.success(paginatedResponse);
      jest.spyOn(service, "findAll").mockResolvedValue(expectedResponse);

      const result = await controller.findAll(mockRequest, 1, 10);

      expect(result).toEqual(expectedResponse);
      expect(service.findAll).toHaveBeenCalledWith(mockRequest.user, 1, 10);
    });
  });

  describe("findOne", () => {
    it("should return a single order", async () => {
      const expectedResponse = ApiResponse.success(mockOrder);
      jest.spyOn(service, "findOne").mockResolvedValue(expectedResponse);

      const result = await controller.findOne(mockRequest, "1");

      expect(result).toEqual(expectedResponse);
      expect(service.findOne).toHaveBeenCalledWith(mockRequest.user, "1");
    });
  });

  describe("remove", () => {
    it("should delete an order", async () => {
      const expectedResponse = ApiResponse.success(
        null,
        "Order deleted successfully",
      );
      jest.spyOn(service, "remove").mockResolvedValue(expectedResponse);
      jest.spyOn(service, "invalidateOrdersCache").mockResolvedValue();
      jest.spyOn(service, "invalidateOrderCache").mockResolvedValue();

      const result = await controller.remove(mockRequest, "1");

      expect(result).toEqual(expectedResponse);
      expect(service.remove).toHaveBeenCalledWith(mockRequest.user, "1");
      expect(service.invalidateOrdersCache).toHaveBeenCalled();
      expect(service.invalidateOrderCache).toHaveBeenCalledWith("1");
    });
  });

  describe("access control", () => {
    it("should allow admin to access any order", async () => {
      const adminRequest = {
        user: {
          email: "admin@example.com",
          role: UserRole.ADMIN,
        },
      };

      const expectedResponse = ApiResponse.success(mockOrder);
      jest.spyOn(service, "findOne").mockResolvedValue(expectedResponse);

      const result = await controller.findOne(adminRequest, "1");

      expect(result).toEqual(expectedResponse);
      expect(service.findOne).toHaveBeenCalledWith(adminRequest.user, "1");
    });
  });
});
