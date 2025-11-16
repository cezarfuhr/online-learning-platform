import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressService } from './progress.service';
import { LessonProgress } from './entities/lesson-progress.entity';
import { CourseEnrollment } from '../courses/entities/course-enrollment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LessonProgress, CourseEnrollment])],
  providers: [ProgressService],
  exports: [ProgressService, TypeOrmModule],
})
export class ProgressModule {}
