import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course } from './entities/course.entity';
import { CourseModule } from './entities/course-module.entity';
import { Lesson } from './entities/lesson.entity';
import { CourseEnrollment } from './entities/course-enrollment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseModule, Lesson, CourseEnrollment])],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [TypeOrmModule],
})
export class CoursesModule {}
