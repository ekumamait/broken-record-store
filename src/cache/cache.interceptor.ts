import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";
import { Reflector } from "@nestjs/core";
import { CacheService } from "./cache.service";
import { CACHE_CONSTANTS } from "../common/constants/cache.constants";

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
      CACHE_CONSTANTS.METADATA.KEY,
      context.getHandler(),
    );
    const ttl = this.reflector.get(
      CACHE_CONSTANTS.METADATA.TTL,
      context.getHandler(),
    );

    if (!keyPrefix) {
      return next.handle();
    }

    const cacheKey = this.cacheService.generateKey(keyPrefix, {
      ...request.query,
      ...request.params,
    });

    const cachedData = await this.cacheService.get(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheService.set(cacheKey, data, ttl);
      }),
    );
  }
}
