import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { ReviewHelpful } from './entities/review-helpful.entity';
import { Course } from '../courses/entities/course.entity';
import { CourseEnrollment } from '../courses/entities/course-enrollment.entity';
import { User } from '../users/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(ReviewHelpful)
    private reviewHelpfulRepository: Repository<ReviewHelpful>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseEnrollment)
    private enrollmentRepository: Repository<CourseEnrollment>,
  ) {}

  async createReview(createReviewDto: CreateReviewDto, user: User): Promise<Review> {
    const { courseId, rating, comment } = createReviewDto;

    // Check if user is enrolled in the course
    const enrollment = await this.enrollmentRepository.findOne({
      where: { user: { id: user.id }, course: { id: courseId } },
    });

    if (!enrollment) {
      throw new ForbiddenException('You must be enrolled in this course to review it');
    }

    // Check if user already reviewed this course
    const existingReview = await this.reviewRepository.findOne({
      where: { user: { id: user.id }, course: { id: courseId } },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this course');
    }

    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Create review
    const review = this.reviewRepository.create({
      user,
      course,
      rating,
      comment,
      isVerifiedPurchase: true,
    });

    const savedReview = await this.reviewRepository.save(review);

    // Update course rating
    await this.updateCourseRating(courseId);

    return savedReview;
  }

  async updateReview(reviewId: string, updateReviewDto: UpdateReviewDto, user: User): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['user', 'course'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.user.id !== user.id) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    if (updateReviewDto.rating !== undefined) {
      review.rating = updateReviewDto.rating;
    }

    if (updateReviewDto.comment !== undefined) {
      review.comment = updateReviewDto.comment;
    }

    review.editedAt = new Date();

    const updatedReview = await this.reviewRepository.save(review);

    // Update course rating
    await this.updateCourseRating(review.course.id);

    return updatedReview;
  }

  async deleteReview(reviewId: string, user: User): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['user', 'course'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.user.id !== user.id) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    const courseId = review.course.id;
    await this.reviewRepository.remove(review);

    // Update course rating
    await this.updateCourseRating(courseId);
  }

  async getCourseReviews(
    courseId: string,
    page = 1,
    limit = 10,
    sortBy: 'rating' | 'date' | 'helpful' = 'date',
  ) {
    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.course.id = :courseId', { courseId })
      .andWhere('review.isModerated = :isModerated', { isModerated: false });

    // Sorting
    switch (sortBy) {
      case 'rating':
        queryBuilder.orderBy('review.rating', 'DESC');
        break;
      case 'helpful':
        queryBuilder.orderBy('review.helpfulCount', 'DESC');
        break;
      default:
        queryBuilder.orderBy('review.createdAt', 'DESC');
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [reviews, total] = await queryBuilder.getManyAndCount();

    return {
      reviews,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async getUserReview(userId: string, courseId: string): Promise<Review | null> {
    return this.reviewRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
  }

  async markHelpful(reviewId: string, user: User): Promise<void> {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if already marked helpful
    const existing = await this.reviewHelpfulRepository.findOne({
      where: { user: { id: user.id }, review: { id: reviewId } },
    });

    if (existing) {
      throw new BadRequestException('Already marked as helpful');
    }

    const helpful = this.reviewHelpfulRepository.create({
      user,
      review,
    });

    await this.reviewHelpfulRepository.save(helpful);

    // Update helpful count
    review.helpfulCount++;
    await this.reviewRepository.save(review);
  }

  async unmarkHelpful(reviewId: string, user: User): Promise<void> {
    const helpful = await this.reviewHelpfulRepository.findOne({
      where: { user: { id: user.id }, review: { id: reviewId } },
    });

    if (!helpful) {
      throw new NotFoundException('Not marked as helpful');
    }

    await this.reviewHelpfulRepository.remove(helpful);

    // Update helpful count
    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
    if (review) {
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
      await this.reviewRepository.save(review);
    }
  }

  async getCourseRatingStats(courseId: string) {
    const reviews = await this.reviewRepository.find({
      where: { course: { id: courseId }, isModerated: false },
    });

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = reviews.reduce((dist, review) => {
      dist[review.rating] = (dist[review.rating] || 0) + 1;
      return dist;
    }, {} as Record<number, number>);

    return {
      averageRating: Math.round(averageRating * 100) / 100,
      totalReviews: reviews.length,
      ratingDistribution,
    };
  }

  private async updateCourseRating(courseId: string): Promise<void> {
    const stats = await this.getCourseRatingStats(courseId);

    await this.courseRepository.update(courseId, {
      rating: stats.averageRating,
      reviewsCount: stats.totalReviews,
    });
  }
}
