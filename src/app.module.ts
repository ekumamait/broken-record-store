import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfig } from './app.config';
import { RecordsModule } from './records/records.module';
import { OrdersModule } from './orders/orders.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from './cache/cache.module';
import { CacheInterceptor } from './cache/cache.interceptor';

@Module({
  imports: [
    MongooseModule.forRoot(AppConfig.mongoUrl),
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 10,
    }]),
    CacheModule,
    RecordsModule,
    OrdersModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    }
  ],
})
export class AppModule {}
