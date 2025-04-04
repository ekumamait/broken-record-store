import { Inject, Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { FilterRecordDto } from "../records/dto/filter-record.dto";
import { CACHE_CONSTANTS } from "../common/constants/cache.constants";
import { AppConfig } from "../app.config";

@Injectable()
export class CacheService {
  constructor(
    @Inject(AppConfig.redis_client) private readonly redisClient: Redis,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redisClient.get(key);
      if (value) {
        return JSON.parse(value);
      } else {
        return null;
      }
    } catch (error) {
      return error;
    }
  }

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      await this.redisClient.set(key, JSON.stringify(value), "EX", ttl);
    } catch (error) {
      return error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      return error;
    }
  }

  async reset(): Promise<void> {
    try {
      await this.redisClient.flushall();
    } catch (error) {
      return error;
    }
  }

  async invalidateByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redisClient.keys(`${pattern}*`);
      if (keys.length > 0) {
        await Promise.all(keys.map((key) => this.redisClient.del(key)));
      }
    } catch (error) {
      throw error;
    }
  }

  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        if (params[key] !== undefined && params[key] !== null) {
          result[key] = params[key];
        }
        return result;
      }, {});

    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }

  generateRecordListKey(filterDto: FilterRecordDto): string {
    const key = `${CACHE_CONSTANTS.KEYS.RECORDS_LIST}:${JSON.stringify({
      ...(filterDto.q && { q: filterDto.q }),
      ...(filterDto.artist && { artist: filterDto.artist }),
      ...(filterDto.album && { album: filterDto.album }),
      ...(filterDto.format && { format: filterDto.format }),
      ...(filterDto.category && { category: filterDto.category }),
      page: filterDto.page || 1,
      limit: filterDto.limit || 10,
      sortBy: filterDto.sortBy || "artist",
      sortDirection: filterDto.sortDirection || "asc",
    })}`;
    return key;
  }
}
