import { Module } from "@nestjs/common";
import { RecordsService } from "./records.service";
import { RecordsController } from "./records.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { RecordSchema } from "../schemas/record.schema";
import { MusicBrainzModule } from "../musicbrainz/musicbrainz.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Record", schema: RecordSchema }]),
    MusicBrainzModule,
  ],
  controllers: [RecordsController],
  providers: [RecordsService],
  exports: [RecordsService],
})
export class RecordsModule {}
