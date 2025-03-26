import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

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
    const store = this.cacheManager.stores as any;
    if (store && store.client && typeof store.client.flushAll === 'function') {
      await store.client.flushAll();
    } else {
      console.warn('Unable to reset cache: Redis client not accessible');
    }
  }

  async invalidateByPattern(pattern: string): Promise<void> {
    const store = this.cacheManager.stores as any;
    if (store && store.client) {
      const keys = await store.client.keys(pattern);
      if (keys && keys.length > 0) {
        await store.client.del(keys);
      }
    } else {
      console.warn(`Unable to invalidate cache by pattern '${pattern}': Redis client not accessible`);
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