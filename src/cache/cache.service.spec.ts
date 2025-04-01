import { Test, TestingModule } from "@nestjs/testing";
import { CacheService } from "./cache.service";
import Redis from "ioredis";
import { AppConfig } from "../app.config";

const mockRedisClient = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue("OK"),
  del: jest.fn().mockResolvedValue(1),
  flushall: jest.fn().mockResolvedValue("OK"),
  keys: jest.fn().mockResolvedValue([]),
  scan: jest.fn().mockResolvedValue([0, []]),
};

xdescribe("CacheService", () => {
  let service: CacheService;
  let redisClient: jest.Mocked<Redis>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: AppConfig.redis_client,
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    redisClient = module.get(AppConfig.redis_client);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("get", () => {
    it("should return parsed data when cache exists", async () => {
      const mockData = { id: 1, name: "test" };
      redisClient.get.mockResolvedValueOnce(JSON.stringify(mockData));

      const result = await service.get("test-key");
      expect(result).toEqual(mockData);
      expect(redisClient.get).toHaveBeenCalledWith("test-key");
    });

    it("should return null when cache does not exist", async () => {
      redisClient.get.mockResolvedValueOnce(null);

      const result = await service.get("test-key");
      expect(result).toBeNull();
    });
  });

  describe("set", () => {
    it("should set cache with correct TTL", async () => {
      const testData = { id: 1, name: "test" };
      const ttl = 300;

      await service.set("test-key", testData, ttl);

      expect(redisClient.set).toHaveBeenCalledWith(
        "test-key",
        JSON.stringify(testData),
        "EX",
        ttl,
      );
    });
  });

  describe("delete", () => {
    it("should delete cache key", async () => {
      await service.delete("test-key");
      expect(redisClient.del).toHaveBeenCalledWith("test-key");
    });
  });

  describe("invalidateByPattern", () => {
    it("should delete all keys matching pattern", async () => {
      const matchingKeys = ["key1", "key2"];
      redisClient.keys.mockResolvedValueOnce(matchingKeys);

      await service.invalidateByPattern("test");

      expect(redisClient.keys).toHaveBeenCalledWith("test*");
      expect(redisClient.del).toHaveBeenCalledTimes(matchingKeys.length);
    });
  });
});
