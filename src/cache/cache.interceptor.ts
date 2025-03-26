import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CacheService } from './cache.service';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from './cache.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private cacheService: CacheService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const keyPrefix = this.reflector.get(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );
    const ttl = this.reflector.get(CACHE_TTL_METADATA, context.getHandler());

    if (!keyPrefix) {
      return next.handle();
    }

    // Generate cache key from request query params and route params
    const cacheKey = this.cacheService.generateKey(keyPrefix, {
      ...request.query,
      ...request.params,
    });

    // Try to get from cache
    const cachedData = await this.cacheService.get(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    // If not in cache, execute handler and cache the result
    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheService.set(cacheKey, data, ttl);
      }),
    );
  }
} 