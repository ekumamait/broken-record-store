import { Module } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { RecordSchema } from "../schemas/record.schema";
import { OrderSchema } from "../schemas/order.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Record", schema: RecordSchema },
      { name: "Order", schema: OrderSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
