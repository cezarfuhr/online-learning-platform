import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideosService } from './videos.service';
import { Video } from './entities/video.entity';
import { Lesson } from '../courses/entities/lesson.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Video, Lesson])],
  providers: [VideosService],
  exports: [VideosService, TypeOrmModule],
})
export class VideosModule {}
