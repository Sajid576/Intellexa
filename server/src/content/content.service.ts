import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Content } from './schemas/content.schema';
import { AIService } from '../ai/ai.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(Content.name) private contentModel: Model<Content>,
    private aiService: AIService,
    @InjectQueue('comment-analysis') private commentQueue: Queue,
  ) {}

  async create(data: Partial<Content>): Promise<Content> {
    const createdContent = new this.contentModel(data);
    return createdContent.save();
  }

  async findAll(userId: string, search?: string): Promise<Content[]> {
    const query = { userId };
    if (search) {
      query['title'] = { $regex: search, $options: 'i' };
    }
    return this.contentModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string, userId?: string): Promise<Content> {
    const query = { _id: id };
    if (userId) {
      query['userId'] = userId;
    }
    const content = await this.contentModel.findOne(query).exec();
    if (!content) throw new NotFoundException('Content not found or access denied');
    return content;
  }

  async update(id: string, data: Partial<Content>): Promise<Content> {
    const updatedContent = await this.contentModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updatedContent) throw new NotFoundException('Content not found');
    return updatedContent;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.contentModel.findOneAndDelete({ _id: id, userId }).exec();
    if (!result) throw new NotFoundException('Content not found or access denied');
  }

  async addComment(contentId: string, name: string, body: string): Promise<Content> {
    const content = await this.contentModel.findById(contentId).exec();
    if (!content) throw new NotFoundException('Content not found');

    const commentId = new Types.ObjectId();
    content.comments.push({
      _id: commentId as any,
      name,
      body,
      sentimentScore: 0,
      sentimentLabel: 'Analyzing...',
      createdAt: new Date(),
    });

    const savedContent = await content.save();

    await this.commentQueue.add('analyze', {
      contentId,
      commentId: commentId.toString(),
      body,
    });

    return savedContent;
  }

  async updateCommentSentiment(
    contentId: string,
    commentId: string,
    sentiment: { score: number; label: string },
  ) {
    return this.contentModel.updateOne(
      { _id: contentId, 'comments._id': commentId },
      {
        $set: {
          'comments.$.sentimentScore': sentiment.score,
          'comments.$.sentimentLabel': sentiment.label,
        },
      },
    );
  }
}
