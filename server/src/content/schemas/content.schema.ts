import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Content extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ required: true })
  type: string; // e.g., 'Blog Post Outline', 'Product Description', 'Social Media Caption'

  @Prop({ required: true })
  userId: string;

  @Prop({ default: 'completed' })
  status: string; // 'pending', 'processing', 'completed', 'failed'

  @Prop()
  jobId?: string;

  @Prop({ default: 0 })
  sentimentScore?: number;

  @Prop()
  sentimentLabel?: string;
}

export const ContentSchema = SchemaFactory.createForClass(Content);
