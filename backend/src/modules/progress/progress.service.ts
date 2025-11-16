import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonProgress } from './entities/lesson-progress.entity';
import { CourseEnrollment } from '../courses/entities/course-enrollment.entity';
import { User } from '../users/entities/user.entity';
import { Lesson } from '../courses/entities/lesson.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(LessonProgress)
    private progressRepository: Repository<LessonProgress>,
    @InjectRepository(CourseEnrollment)
    private enrollmentRepository: Repository<CourseEnrollment>,
  ) {}

  async updateLessonProgress(
    userId: string,
    lessonId: string,
    watchedSeconds: number,
    isCompleted: boolean,
  ) {
    let progress = await this.progressRepository.findOne({
      where: { user: { id: userId }, lesson: { id: lessonId } },
    });

    if (!progress) {
      progress = this.progressRepository.create({
        user: { id: userId },
        lesson: { id: lessonId },
      });
    }

    progress.watchedSeconds = watchedSeconds;
    progress.isCompleted = isCompleted;
    progress.lastAccessedAt = new Date();

    if (isCompleted && !progress.completedAt) {
      progress.completedAt = new Date();
      progress.progressPercentage = 100;
    }

    await this.progressRepository.save(progress);

    // Update course progress
    await this.updateCourseProgress(userId, lessonId);

    return progress;
  }

  private async updateCourseProgress(userId: string, lessonId: string) {
    const lesson = await this.progressRepository
      .createQueryBuilder('progress')
      .leftJoinAndSelect('progress.lesson', 'lesson')
      .leftJoinAndSelect('lesson.module', 'module')
      .leftJoinAndSelect('module.course', 'course')
      .where('progress.user.id = :userId', { userId })
      .andWhere('lesson.id = :lessonId', { lessonId })
      .getOne();

    if (!lesson) return;

    // Get all lessons in the course
    const courseId = (lesson.lesson as any).module.course.id;

    const totalLessons = await this.progressRepository
      .createQueryBuilder('progress')
      .leftJoin('progress.lesson', 'lesson')
      .leftJoin('lesson.module', 'module')
      .where('module.course.id = :courseId', { courseId })
      .getCount();

    const completedLessons = await this.progressRepository
      .createQueryBuilder('progress')
      .leftJoin('progress.lesson', 'lesson')
      .leftJoin('lesson.module', 'module')
      .where('module.course.id = :courseId', { courseId })
      .andWhere('progress.user.id = :userId', { userId })
      .andWhere('progress.isCompleted = :completed', { completed: true })
      .getCount();

    const progressPercentage = (completedLessons / totalLessons) * 100;

    const enrollment = await this.enrollmentRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });

    if (enrollment) {
      enrollment.progress = progressPercentage;
      await this.enrollmentRepository.save(enrollment);
    }
  }

  async getCourseProgress(userId: string, courseId: string) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
      relations: ['course', 'course.modules', 'course.modules.lessons'],
    });

    if (!enrollment) {
      return null;
    }

    const lessonProgress = await this.progressRepository.find({
      where: { user: { id: userId } },
    });

    return {
      enrollment,
      lessonProgress,
      completionPercentage: enrollment.progress,
    };
  }

  async getDashboard(userId: string) {
    const enrollments = await this.enrollmentRepository.find({
      where: { user: { id: userId } },
      relations: ['course'],
      order: { lastAccessedAt: 'DESC' },
    });

    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.progress >= 100).length;
    const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;

    return {
      totalCourses,
      completedCourses,
      inProgressCourses,
      enrollments,
    };
  }
}
