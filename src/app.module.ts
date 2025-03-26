import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfig } from './app.config';
import { RecordsModule } from './records/records.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    MongooseModule.forRoot(AppConfig.mongoUrl), 
    RecordsModule,
    OrdersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
