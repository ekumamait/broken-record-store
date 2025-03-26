import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfig } from './app.config';
import { RecordsModule } from './records/records.module';

@Module({
  imports: [MongooseModule.forRoot(AppConfig.mongoUrl), RecordsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
