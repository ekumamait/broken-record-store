import { Module } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { RecordSchema } from "../schemas/record.schema";
import { OrderSchema } from "../schemas/order.schema";
import { CacheModule } from "../cache/cache.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Record", schema: RecordSchema },
      { name: "Order", schema: OrderSchema },
    ]),
    CacheModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
