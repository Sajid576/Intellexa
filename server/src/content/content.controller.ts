import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    @InjectQueue('content-generation') private contentQueue: Queue,
  ) {}

  @Post('generate')
  async generate(@Body() data: { prompt: string; type: string; title: string }, @Request() req) {
    // 1. Create a pending record in the database
    const content = await this.contentService.create({
      title: data.title,
      type: data.type,
      userId: req.user.userId,
      status: 'pending',
      body: 'Processing...',
    });

    // 2. Add to queue with 1-minute delay
    const job = await this.contentQueue.add(
      'generate',
      {
        prompt: data.prompt,
        type: data.type,
        userId: req.user.userId,
        contentId: content._id,
      },
      { delay: 60000 }, // 1 minute delay as requested
    );

    return {
      message: 'Job successfully queued',
      jobId: job.id,
      contentId: content._id,
      expectedDelay: '60 seconds',
    };
  }

  @Get()
  findAll(@Request() req, @Query('search') search: string) {
    return this.contentService.findAll(req.user.userId, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.contentService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contentService.remove(id);
  }
}
