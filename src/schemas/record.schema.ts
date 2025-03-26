import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RecordFormat, RecordCategory } from '../common/enums/record.enum';

@Schema({ timestamps: true })
export class Record extends Document {
  @Prop({ required: true, index: true })
  artist: string;

  @Prop({ required: true, index: true })
  album: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  qty: number;

  @Prop({ enum: RecordFormat, required: true, index: true })
  format: RecordFormat;

  @Prop({ enum: RecordCategory, required: true, index: true })
  category: RecordCategory;

  @Prop({ default: Date.now })
  created: Date;

  @Prop({ default: Date.now })
  lastModified: Date;

  @Prop({ required: false, index: true })
  mbid?: string;
  
  @Prop({ type: [{ title: String, duration: String, position: Number }], default: [] })
  trackList?: Array<{ title: string; duration: string; position: number }>;
}

export const RecordSchema = SchemaFactory.createForClass(Record);

// Create a compound index for the unique identifier (artist + album + format)
RecordSchema.index({ artist: 1, album: 1, format: 1 }, { unique: true });

// Create a text index for efficient text search
RecordSchema.index(
  { artist: 'text', album: 'text', category: 'text' },
  { weights: { artist: 3, album: 2, category: 1 }, name: 'text_search_index' }
);
