import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { Content, ContentSchema } from './schemas/content.schema';
import { AIModule } from '../ai/ai.module';
import { ContentProcessor } from '../queue/content.processor';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }]),
    BullModule.registerQueue({
      name: 'content-generation',
    }),
    AIModule,
    WebsocketModule,
  ],
  controllers: [ContentController],
  providers: [ContentService, ContentProcessor],
  exports: [ContentService],
})
export class ContentModule {}
