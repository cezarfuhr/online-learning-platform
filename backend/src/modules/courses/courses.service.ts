import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CourseEnrollment, EnrollmentStatus } from './entities/course-enrollment.entity';
import { User } from '../users/entities/user.entity';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseEnrollment)
    private enrollmentRepository: Repository<CourseEnrollment>,
  ) {}

  async create(createCourseDto: CreateCourseDto, instructor: User): Promise<Course> {
    const course = this.courseRepository.create({
      ...createCourseDto,
      instructor,
    });

    return this.courseRepository.save(course);
  }

  async findAll(page = 1, limit = 10) {
    const [courses, total] = await this.courseRepository.findAndCount({
      where: { isPublished: true },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['instructor'],
      order: { createdAt: 'DESC' },
    });

    return {
      data: courses,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['instructor', 'modules', 'modules.lessons'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async enroll(courseId: string, user: User): Promise<CourseEnrollment> {
    const course = await this.findOne(courseId);

    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: { user: { id: user.id }, course: { id: courseId } },
    });

    if (existingEnrollment) {
      throw new ForbiddenException('Already enrolled in this course');
    }

    const enrollment = this.enrollmentRepository.create({
      user,
      course,
      status: EnrollmentStatus.ACTIVE,
    });

    course.studentsCount++;
    await this.courseRepository.save(course);

    return this.enrollmentRepository.save(enrollment);
  }

  async getEnrolledCourses(userId: string) {
    const enrollments = await this.enrollmentRepository.find({
      where: { user: { id: userId } },
      relations: ['course', 'course.instructor'],
    });

    return enrollments;
  }

  async updateProgress(enrollmentId: string, progress: number) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    enrollment.progress = progress;
    enrollment.lastAccessedAt = new Date();

    if (progress >= 100) {
      enrollment.status = EnrollmentStatus.COMPLETED;
      enrollment.completedAt = new Date();
    }

    return this.enrollmentRepository.save(enrollment);
  }
}
