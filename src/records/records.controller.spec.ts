import { Test, TestingModule } from "@nestjs/testing";
import { RecordsController } from "./records.controller";
import { RecordsService } from "./records.service";
import { CreateRecordRequestDTO } from "./dto/create-record.dto";
import { Record } from "../schemas/record.schema";
import { RecordCategory, RecordFormat } from "../common/enums/record.enum";
import { CacheService } from "../cache/cache.service";
import { ApiResponse } from "../common/utils/api-response.util";
import { FilterRecordDto } from "./dto/filter-record.dto";
import { PaginatedResponse } from "../common/utils/paginated-response.util";
import { UserRole } from "../common/enums/user.enum";
import { UpdateRecordRequestDTO } from "./dto/update-record.dto";
import { CacheInterceptor } from "../cache/cache.interceptor";
import { CacheModule } from "../cache/cache.module";
import { Reflector } from "@nestjs/core";

xdescribe("RecordController", () => {
  let recordsController: RecordsController;
  let recordsService: RecordsService;
  let cacheService: CacheService;

  const mockRecord: Record = {
    _id: "1",
    artist: "Test",
    album: "Test Record",
    price: 100,
    qty: 10,
    format: RecordFormat.VINYL,
    category: RecordCategory.ALTERNATIVE,
  } as unknown as Record;

  const mockRequest = {
    user: {
      email: "johndoe@mail.com",
      role: UserRole.USER,
    },
  };

  const mockAdminRequest = {
    user: {
      email: "peterpan@mail.com",
      role: UserRole.ADMIN,
    },
  };

  beforeAll(() => {
    process.env.NODE_ENV = "test";
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule],
      controllers: [RecordsController],
      providers: [
        {
          provide: RecordsService,
          useValue: {
            createRecord: jest.fn(),
            findAllRecords: jest.fn(),
            findOneRecord: jest.fn(),
            updateRecord: jest.fn(),
            removeRecord: jest.fn(),
            invalidateRecordsCache: jest.fn(),
            invalidateRecordCache: jest.fn(),
          },
        },
        {
          provide: "REDIS_CLIENT",
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue("OK"),
            del: jest.fn().mockResolvedValue(1),
            flushall: jest.fn().mockResolvedValue("OK"),
            keys: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined),
            invalidateByPattern: jest.fn().mockResolvedValue(undefined),
            generateKey: jest
              .fn()
              .mockImplementation(
                (prefix, params) => `${prefix}:${JSON.stringify(params)}`,
              ),
          },
        },
        Reflector,
      ],
    }).compile();

    recordsController = module.get<RecordsController>(RecordsController);
    recordsService = module.get<RecordsService>(RecordsService);
    cacheService = module.get<CacheService>(CacheService);
  });

  describe("create", () => {
    it("should create a new record when admin", async () => {
      const createRecordDto: CreateRecordRequestDTO = {
        artist: "Test",
        album: "Test Record",
        price: 100,
        qty: 10,
        format: RecordFormat.VINYL,
        category: RecordCategory.ALTERNATIVE,
      };

      const expectedResponse = ApiResponse.created(mockRecord);
      jest
        .spyOn(recordsService, "createRecord")
        .mockResolvedValue(expectedResponse);

      const result = await recordsController.create(
        mockAdminRequest,
        createRecordDto,
      );

      expect(result).toEqual(expectedResponse);
      expect(recordsService.createRecord).toHaveBeenCalledWith(
        mockAdminRequest.user,
        createRecordDto,
      );
    });

    it("should not allow non-admin users to create records", async () => {
      const createRecordDto: CreateRecordRequestDTO = {
        artist: "Test",
        album: "Test Record",
        price: 100,
        qty: 10,
        format: RecordFormat.VINYL,
        category: RecordCategory.ALTERNATIVE,
      };

      jest
        .spyOn(recordsService, "createRecord")
        .mockRejectedValue(new Error("Unauthorized"));

      await expect(
        recordsController.create(mockRequest, createRecordDto),
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("findAll", () => {
    it("should return paginated records", async () => {
      const filterDto: FilterRecordDto = {
        page: 1,
        limit: 10,
      };

      const paginatedResponse = new PaginatedResponse([mockRecord], 1, 1, 10);
      const expectedResponse = ApiResponse.success(paginatedResponse);

      jest
        .spyOn(recordsService, "findAllRecords")
        .mockResolvedValue(expectedResponse);

      const result = await recordsController.findAll(filterDto);

      expect(result).toEqual(expectedResponse);
      expect(recordsService.findAllRecords).toHaveBeenCalledWith(filterDto);
    });
  });

  describe("findOne", () => {
    it("should return a single record", async () => {
      const expectedResponse = ApiResponse.success(mockRecord);
      jest
        .spyOn(recordsService, "findOneRecord")
        .mockResolvedValue(expectedResponse);

      const result = await recordsController.findOne("1");

      expect(result).toEqual(expectedResponse);
      expect(recordsService.findOneRecord).toHaveBeenCalledWith("1");
    });
  });

  describe("update", () => {
    it("should update a record when admin", async () => {
      const updateDto: UpdateRecordRequestDTO = {
        price: 150,
        qty: 20,
      };

      const expectedResponse = ApiResponse.success(mockRecord);
      jest
        .spyOn(recordsService, "updateRecord")
        .mockResolvedValue(expectedResponse);

      const result = await recordsController.update(
        mockAdminRequest,
        "1",
        updateDto,
      );

      expect(result).toEqual(expectedResponse);
      expect(recordsService.updateRecord).toHaveBeenCalledWith(
        mockAdminRequest.user,
        "1",
        updateDto,
      );
    });

    it("should not allow non-admin users to update records", async () => {
      const updateDto: UpdateRecordRequestDTO = {
        price: 150,
        qty: 20,
      };

      jest
        .spyOn(recordsService, "updateRecord")
        .mockRejectedValue(new Error("Unauthorized"));

      await expect(
        recordsController.update(mockRequest, "1", updateDto),
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("remove", () => {
    it("should remove a record when admin", async () => {
      const expectedResponse = ApiResponse.success(
        null,
        "Record deleted successfully",
      );
      jest
        .spyOn(recordsService, "removeRecord")
        .mockResolvedValue(expectedResponse);

      const result = await recordsController.remove(mockAdminRequest, "1");

      expect(result).toEqual(expectedResponse);
      expect(recordsService.removeRecord).toHaveBeenCalledWith(
        mockAdminRequest.user,
        "1",
      );
    });

    it("should not allow non-admin users to remove records", async () => {
      jest
        .spyOn(recordsService, "removeRecord")
        .mockRejectedValue(new Error("Unauthorized"));

      await expect(recordsController.remove(mockRequest, "1")).rejects.toThrow(
        "Unauthorized",
      );
    });
  });
});
