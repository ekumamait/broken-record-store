import { Test, TestingModule } from "@nestjs/testing";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { CacheService } from "./cache.service";

describe("CacheService", () => {
  let service: CacheService;
  let cacheManager: any;

  beforeEach(async () => {
    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
      store: {
        keys: jest.fn(),
        client: {
          keys: jest.fn().mockResolvedValue([]),
          del: jest.fn().mockResolvedValue(undefined),
          flushAll: jest.fn().mockResolvedValue(undefined),
        },
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("get", () => {
    it("should call cacheManager.get with correct key", async () => {
      const key = "test-key";
      const value = { data: "test" };
      cacheManager.get.mockResolvedValue(value);

      const result = await service.get(key);

      expect(cacheManager.get).toHaveBeenCalledWith(key);
      expect(result).toEqual(value);
    });
  });

  describe("set", () => {
    it("should call cacheManager.set with correct parameters", async () => {
      const key = "test-key";
      const value = { data: "test" };
      const ttl = 300;

      await service.set(key, value, ttl);

      expect(cacheManager.set).toHaveBeenCalledWith(key, value, ttl);
    });
  });

  describe("delete", () => {
    it("should call cacheManager.del with correct key", async () => {
      const key = "test-key";

      await service.delete(key);

      expect(cacheManager.del).toHaveBeenCalledWith(key);
    });
  });

  describe("generateKey", () => {
    it("should generate correct cache key", () => {
      const prefix = "test";
      const params = { id: 1, name: "test" };

      const result = service.generateKey(prefix, params);

      expect(result).toBe('test:{"id":1,"name":"test"}');
    });

    it("should skip undefined and null values", () => {
      const prefix = "test";
      const params = { id: 1, name: null, age: undefined };

      const result = service.generateKey(prefix, params);

      expect(result).toBe('test:{"id":1}');
    });
  });
});
