import { Injectable, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async delete(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    try {
      const store = (this.cacheManager as any).stores[0];
      if (store?.client?.flushAll) {
        await store.client.flushAll();
      }
    } catch (error) {
      throw error;
    }
  }

  async invalidateByPattern(pattern: string): Promise<void> {
    try {
      const store = (this.cacheManager as any).stores[0];
      if (store?.client?.keys) {
        const keys = await store.client.keys(pattern);
        if (Array.isArray(keys) && keys.length > 0) {
          await Promise.all(keys.map((key) => this.cacheManager.del(key)));
        }
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
}
