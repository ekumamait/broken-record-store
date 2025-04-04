import { Module, Global } from "@nestjs/common";
import { CacheService } from "./cache.service";
import Redis from "ioredis";
import { AppConfig } from "../app.config";

const redisProvider = {
  provide: AppConfig.redis_client,
  useFactory: () => {
    return new Redis({
      host: AppConfig.redis_host,
      port: AppConfig.redis_port,
    });
  },
};

@Global()
@Module({
  providers: [redisProvider, CacheService],
  exports: [redisProvider, CacheService],
})
export class CacheModule {}
