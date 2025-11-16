import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { Course } from '../courses/entities/course.entity';
import { CourseEnrollment } from '../courses/entities/course-enrollment.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { LessonProgress } from '../progress/entities/lesson-progress.entity';
import { QuizAttempt } from '../quizzes/entities/quiz-attempt.entity';
import { Review } from '../reviews/entities/review.entity';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseEnrollment)
    private enrollmentRepository: Repository<CourseEnrollment>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(LessonProgress)
    private progressRepository: Repository<LessonProgress>,
    @InjectRepository(QuizAttempt)
    private quizAttemptRepository: Repository<QuizAttempt>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async getInstructorDashboard(instructorId: string, dateRange?: DateRange) {
    const courses = await this.getInstructorCourses(instructorId);
    const courseIds = courses.map(c => c.id);

    const [
      totalRevenue,
      totalStudents,
      totalEnrollments,
      avgCompletionRate,
      avgRating,
      recentEnrollments,
      topCourses,
      revenueOverTime,
    ] = await Promise.all([
      this.getTotalRevenue(instructorId, dateRange),
      this.getTotalStudents(courseIds),
      this.getTotalEnrollments(courseIds, dateRange),
      this.getAvgCompletionRate(courseIds),
      this.getAvgRating(courseIds),
      this.getRecentEnrollments(courseIds, 10),
      this.getTopCourses(instructorId, 5),
      this.getRevenueOverTime(instructorId, dateRange),
    ]);

    return {
      overview: {
        totalRevenue,
        totalStudents,
        totalEnrollments,
        avgCompletionRate,
        avgRating,
        totalCourses: courses.length,
      },
      recentEnrollments,
      topCourses,
      revenueOverTime,
    };
  }

  async getCourseAnalytics(courseId: string, dateRange?: DateRange) {
    const [
      enrollmentStats,
      completionStats,
      quizPerformance,
      studentEngagement,
      revenueStats,
      reviewStats,
    ] = await Promise.all([
      this.getEnrollmentStats(courseId, dateRange),
      this.getCompletionStats(courseId),
      this.getQuizPerformance(courseId),
      this.getStudentEngagement(courseId, dateRange),
      this.getCourseRevenue(courseId, dateRange),
      this.getCourseReviewStats(courseId),
    ]);

    return {
      enrollmentStats,
      completionStats,
      quizPerformance,
      studentEngagement,
      revenueStats,
      reviewStats,
    };
  }

  private async getInstructorCourses(instructorId: string): Promise<Course[]> {
    return this.courseRepository.find({
      where: { instructor: { id: instructorId } },
    });
  }

  private async getTotalRevenue(instructorId: string, dateRange?: DateRange): Promise<number> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.instructorAmount)', 'total')
      .innerJoin('payment.course', 'course')
      .where('course.instructor.id = :instructorId', { instructorId })
      .andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED });

    if (dateRange) {
      queryBuilder.andWhere('payment.paidAt BETWEEN :startDate AND :endDate', dateRange);
    }

    const result = await queryBuilder.getRawOne();
    return parseFloat(result.total) || 0;
  }

  private async getTotalStudents(courseIds: string[]): Promise<number> {
    if (courseIds.length === 0) return 0;

    const result = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .select('COUNT(DISTINCT enrollment.user.id)', 'count')
      .where('enrollment.course.id IN (:...courseIds)', { courseIds })
      .getRawOne();

    return parseInt(result.count) || 0;
  }

  private async getTotalEnrollments(courseIds: string[], dateRange?: DateRange): Promise<number> {
    if (courseIds.length === 0) return 0;

    const queryBuilder = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .where('enrollment.course.id IN (:...courseIds)', { courseIds });

    if (dateRange) {
      queryBuilder.andWhere('enrollment.createdAt BETWEEN :startDate AND :endDate', dateRange);
    }

    return queryBuilder.getCount();
  }

  private async getAvgCompletionRate(courseIds: string[]): Promise<number> {
    if (courseIds.length === 0) return 0;

    const result = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .select('AVG(enrollment.progress)', 'avg')
      .where('enrollment.course.id IN (:...courseIds)', { courseIds })
      .getRawOne();

    return parseFloat(result.avg) || 0;
  }

  private async getAvgRating(courseIds: string[]): Promise<number> {
    if (courseIds.length === 0) return 0;

    const result = await this.courseRepository
      .createQueryBuilder('course')
      .select('AVG(course.rating)', 'avg')
      .where('course.id IN (:...courseIds)', { courseIds })
      .getRawOne();

    return parseFloat(result.avg) || 0;
  }

  private async getRecentEnrollments(courseIds: string[], limit: number) {
    if (courseIds.length === 0) return [];

    return this.enrollmentRepository.find({
      where: { course: { id: In(courseIds) } },
      relations: ['user', 'course'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  private async getTopCourses(instructorId: string, limit: number) {
    return this.courseRepository.find({
      where: { instructor: { id: instructorId } },
      order: { studentsCount: 'DESC', rating: 'DESC' },
      take: limit,
    });
  }

  private async getRevenueOverTime(instructorId: string, dateRange?: DateRange) {
    const startDate = dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.endDate || new Date();

    const result = await this.paymentRepository
      .createQueryBuilder('payment')
      .select("DATE_TRUNC('day', payment.paidAt)", 'date')
      .addSelect('SUM(payment.instructorAmount)', 'revenue')
      .innerJoin('payment.course', 'course')
      .where('course.instructor.id = :instructorId', { instructorId })
      .andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere('payment.paidAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy("DATE_TRUNC('day', payment.paidAt)")
      .orderBy('date', 'ASC')
      .getRawMany();

    return result.map(r => ({
      date: r.date,
      revenue: parseFloat(r.revenue),
    }));
  }

  private async getEnrollmentStats(courseId: string, dateRange?: DateRange) {
    const queryBuilder = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .where('enrollment.course.id = :courseId', { courseId });

    if (dateRange) {
      queryBuilder.andWhere('enrollment.createdAt BETWEEN :startDate AND :endDate', dateRange);
    }

    const [total, active, completed] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('enrollment.status = :status', { status: 'active' }).getCount(),
      queryBuilder.clone().andWhere('enrollment.status = :status', { status: 'completed' }).getCount(),
    ]);

    return { total, active, completed };
  }

  private async getCompletionStats(courseId: string) {
    const enrollments = await this.enrollmentRepository.find({
      where: { course: { id: courseId } },
    });

    if (enrollments.length === 0) {
      return { avgProgress: 0, completionRate: 0, dropoffRate: 0 };
    }

    const totalProgress = enrollments.reduce((sum, e) => sum + e.progress, 0);
    const avgProgress = totalProgress / enrollments.length;
    const completed = enrollments.filter(e => e.progress >= 100).length;
    const completionRate = (completed / enrollments.length) * 100;
    const dropoffRate = 100 - completionRate;

    return {
      avgProgress: Math.round(avgProgress * 100) / 100,
      completionRate: Math.round(completionRate * 100) / 100,
      dropoffRate: Math.round(dropoffRate * 100) / 100,
    };
  }

  private async getQuizPerformance(courseId: string) {
    const attempts = await this.quizAttemptRepository
      .createQueryBuilder('attempt')
      .innerJoin('attempt.quiz', 'quiz')
      .innerJoin('quiz.lesson', 'lesson')
      .innerJoin('lesson.module', 'module')
      .where('module.course.id = :courseId', { courseId })
      .andWhere('attempt.status = :status', { status: 'completed' })
      .getMany();

    if (attempts.length === 0) {
      return { avgScore: 0, passRate: 0, totalAttempts: 0 };
    }

    const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
    const avgScore = totalScore / attempts.length;
    const passed = attempts.filter(a => a.passed).length;
    const passRate = (passed / attempts.length) * 100;

    return {
      avgScore: Math.round(avgScore * 100) / 100,
      passRate: Math.round(passRate * 100) / 100,
      totalAttempts: attempts.length,
    };
  }

  private async getStudentEngagement(courseId: string, dateRange?: DateRange) {
    const queryBuilder = this.progressRepository
      .createQueryBuilder('progress')
      .select('COUNT(DISTINCT progress.user.id)', 'activeStudents')
      .addSelect('COUNT(progress.id)', 'totalInteractions')
      .innerJoin('progress.lesson', 'lesson')
      .innerJoin('lesson.module', 'module')
      .where('module.course.id = :courseId', { courseId });

    if (dateRange) {
      queryBuilder.andWhere('progress.lastAccessedAt BETWEEN :startDate AND :endDate', dateRange);
    }

    const result = await queryBuilder.getRawOne();

    return {
      activeStudents: parseInt(result.activeStudents) || 0,
      totalInteractions: parseInt(result.totalInteractions) || 0,
    };
  }

  private async getCourseRevenue(courseId: string, dateRange?: DateRange) {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'totalRevenue')
      .addSelect('SUM(payment.instructorAmount)', 'instructorRevenue')
      .addSelect('COUNT(payment.id)', 'totalSales')
      .where('payment.course.id = :courseId', { courseId })
      .andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED });

    if (dateRange) {
      queryBuilder.andWhere('payment.paidAt BETWEEN :startDate AND :endDate', dateRange);
    }

    const result = await queryBuilder.getRawOne();

    return {
      totalRevenue: parseFloat(result.totalRevenue) || 0,
      instructorRevenue: parseFloat(result.instructorRevenue) || 0,
      totalSales: parseInt(result.totalSales) || 0,
    };
  }

  private async getCourseReviewStats(courseId: string) {
    const reviews = await this.reviewRepository.find({
      where: { course: { id: courseId }, isModerated: false },
    });

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        avgRating: 0,
        ratingDistribution: {},
      };
    }

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;

    const ratingDistribution = reviews.reduce((dist, r) => {
      dist[r.rating] = (dist[r.rating] || 0) + 1;
      return dist;
    }, {} as Record<number, number>);

    return {
      totalReviews: reviews.length,
      avgRating: Math.round(avgRating * 100) / 100,
      ratingDistribution,
    };
  }
}

// Import required for IN operator
import { In } from 'typeorm';
