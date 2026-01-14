import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AIService } from '../ai/ai.service';
import { ContentService } from '../content/content.service';
import { Gateway } from '../websocket/gateway';

@Processor('content-generation')
export class ContentProcessor extends WorkerHost {
  constructor(
    private aiService: AIService,
    private contentService: ContentService,
    private gateway: Gateway,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { prompt, type, userId, contentId } = job.data;

    try {
      // 1. Generate content
      const generatedBody = await this.aiService.generateContent(prompt, type);
      
      // 2. Perform sentiment analysis (secondary AI feature)
      // const sentiment = await this.aiService.analyzeSentiment(generatedBody);

      // 3. Update database
      await this.contentService.update(contentId, {
        body: generatedBody,
        status: 'completed',
        // sentimentScore: sentiment.score,
        // sentimentLabel: sentiment.label,
      });

      // 4. Notify user via WebSocket
      this.gateway.server.to(userId).emit('content-generated', {
        contentId,
        status: 'completed',
        body: generatedBody,
      });

      return { status: 'success' };
    } catch (error) {
      console.error('Job failed:', error);
      await this.contentService.update(contentId, { status: 'failed' });
      this.gateway.server.to(userId).emit('content-generated', {
        contentId,
        status: 'failed',
      });
      throw error;
    }
  }
}
