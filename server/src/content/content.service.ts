import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content } from './schemas/content.schema';

@Injectable()
export class ContentService {
  constructor(@InjectModel(Content.name) private contentModel: Model<Content>) {}

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

  async findOne(id: string): Promise<Content> {
    const content = await this.contentModel.findById(id).exec();
    if (!content) throw new NotFoundException('Content not found');
    return content;
  }

  async update(id: string, data: Partial<Content>): Promise<Content> {
    const updatedContent = await this.contentModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updatedContent) throw new NotFoundException('Content not found');
    return updatedContent;
  }

  async remove(id: string): Promise<void> {
    const result = await this.contentModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Content not found');
  }
}
