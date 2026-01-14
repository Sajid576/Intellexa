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

  @Prop({
    type: [
      {
        name: { type: String, required: true },
        body: { type: String, required: true },
        sentimentScore: { type: Number },
        sentimentLabel: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  comments: {
    _id?: any;
    name: string;
    body: string;
    sentimentScore: number;
    sentimentLabel: string;
    createdAt: Date;
  }[];
}

export const ContentSchema = SchemaFactory.createForClass(Content);
