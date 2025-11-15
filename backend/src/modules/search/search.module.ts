import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Course } from '../courses/entities/course.entity';
import { CourseCategory } from '../courses/entities/course-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseCategory])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
