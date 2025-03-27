import { Test, TestingModule } from "@nestjs/testing";
import { CacheInterceptor } from "./cache.interceptor";
import { CacheService } from "./cache.service";
import { Reflector } from "@nestjs/core";
import { CallHandler, ExecutionContext } from "@nestjs/common";
import { Observable, of, firstValueFrom } from "rxjs";
import { CACHE_CONSTANTS } from "../common/constants/cache.constants";

describe("CacheInterceptor", () => {
  let interceptor: CacheInterceptor;
  let cacheService: Partial<CacheService>;
  let reflector: Partial<Reflector>;

  beforeEach(async () => {
    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
      generateKey: jest.fn(),
    };

    reflector = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheInterceptor,
        {
          provide: CacheService,
          useValue: cacheService,
        },
        {
          provide: Reflector,
          useValue: reflector,
        },
      ],
    }).compile();

    interceptor = module.get<CacheInterceptor>(CacheInterceptor);
  });

  it("should be defined", () => {
    expect(interceptor).toBeDefined();
  });

  describe("intercept", () => {
    let context: ExecutionContext;
    let next: CallHandler;

    beforeEach(() => {
      context = {
        switchToHttp: () => ({
          getRequest: () => ({
            query: { page: 1 },
            params: { id: 1 },
          }),
        }),
        getHandler: () => ({}),
      } as ExecutionContext;

      next = {
        handle: () => of({ data: "test" }),
      };
    });

    it("should return cached data if available", async () => {
      const cachedData = { data: "cached" };
      (reflector.get as jest.Mock).mockReturnValue("test-prefix");
      (cacheService.get as jest.Mock).mockResolvedValue(cachedData);
      (cacheService.generateKey as jest.Mock).mockReturnValue("test-key");

      const result$ = await interceptor.intercept(context, next);
      const result = await firstValueFrom(result$ as Observable<any>);

      expect(result).toEqual(cachedData);
      expect(cacheService.get).toHaveBeenCalledWith("test-key");
    });

    it("should cache data if not available", async () => {
      const responseData = { data: "test" };
      (reflector.get as jest.Mock)
        .mockReturnValueOnce("test-prefix")
        .mockReturnValueOnce(300);
      (cacheService.get as jest.Mock).mockResolvedValue(null);
      (cacheService.generateKey as jest.Mock).mockReturnValue("test-key");

      const result$ = await interceptor.intercept(context, next);
      const result = await firstValueFrom(result$ as Observable<any>);

      expect(result).toEqual(responseData);
      expect(cacheService.set).toHaveBeenCalledWith(
        "test-key",
        responseData,
        300,
      );
    });
  });
});
