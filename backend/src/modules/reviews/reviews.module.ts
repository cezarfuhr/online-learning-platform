import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { ReviewHelpful } from './entities/review-helpful.entity';
import { Course } from '../courses/entities/course.entity';
import { CourseEnrollment } from '../courses/entities/course-enrollment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, ReviewHelpful, Course, CourseEnrollment])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
