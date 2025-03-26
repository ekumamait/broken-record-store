import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { AppConfig } from '../app.config';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: AppConfig.redis_host,
            port: AppConfig.redis_port,
          },
          ttl: 300,
        }),
      }),
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {} 