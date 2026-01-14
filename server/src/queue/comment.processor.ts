import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AIService } from '../ai/ai.service';
import { ContentService } from '../content/content.service';

@Processor('comment-analysis')
export class CommentProcessor extends WorkerHost {
  constructor(
    private aiService: AIService,
    private contentService: ContentService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { contentId, commentId, body } = job.data;

    try {
      console.log(`Analyzing sentiment for comment ${commentId} on content ${contentId}`);
      
      const sentiment = await this.aiService.analyzeSentiment(body);

      await this.contentService.updateCommentSentiment(contentId, commentId, {
        score: sentiment.score,
        label: sentiment.label,
      });

      console.log(`Successfully analyzed comment ${commentId}`);
      return { status: 'success' };
    } catch (error) {
      console.error(`Failed to analyze comment ${commentId}:`, error);
      // We could update the status to "Failed" but current schema doesn't have a status for comments
      // For now, it will just stay as "Analyzing..." or we could set it to "Error"
      await this.contentService.updateCommentSentiment(contentId, commentId, {
        score: 0,
        label: 'Error',
      });
      throw error;
    }
  }
}
