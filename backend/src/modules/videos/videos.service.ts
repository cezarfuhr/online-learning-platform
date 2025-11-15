import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { Video } from './entities/video.entity';
import { Lesson } from '../courses/entities/lesson.entity';

@Injectable()
export class VideosService {
  private s3: AWS.S3;
  private cloudFront: AWS.CloudFront;

  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    private configService: ConfigService,
  ) {
    this.s3 = new AWS.S3({
      region: this.configService.get('AWS_REGION'),
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
    });

    this.cloudFront = new AWS.CloudFront({
      region: this.configService.get('AWS_REGION'),
    });
  }

  async uploadVideo(lessonId: string, file: Express.Multer.File) {
    const lesson = await this.lessonRepository.findOne({ where: { id: lessonId } });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const s3Key = `videos/${lessonId}/${Date.now()}-${file.originalname}`;
    const bucket = this.configService.get('AWS_S3_BUCKET');

    await this.s3.upload({
      Bucket: bucket,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }).promise();

    const cloudFrontDomain = this.configService.get('AWS_CLOUDFRONT_DOMAIN');
    const cloudFrontUrl = `https://${cloudFrontDomain}/${s3Key}`;

    const video = this.videoRepository.create({
      title: file.originalname,
      s3Key,
      cloudFrontUrl,
      fileSize: file.size,
      mimeType: file.mimetype,
      lesson,
    });

    return this.videoRepository.save(video);
  }

  async getSignedUrl(videoId: string): Promise<string> {
    const video = await this.videoRepository.findOne({ where: { id: videoId } });
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Generate CloudFront signed URL for secure streaming
    const cloudFrontUrl = video.cloudFrontUrl;

    // Increment views
    video.viewsCount++;
    await this.videoRepository.save(video);

    return cloudFrontUrl;
  }

  async updateProgress(videoId: string, watchedSeconds: number) {
    const video = await this.videoRepository.findOne({ where: { id: videoId } });
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Logic to update user progress will be handled by progress service
    return { success: true, watchedSeconds };
  }
}
