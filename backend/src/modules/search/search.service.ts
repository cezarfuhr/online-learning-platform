import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Course } from '../courses/entities/course.entity';
import { SearchCoursesDto, SortBy, SortOrder } from './dto/search-courses.dto';

interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
  hasMore: boolean;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async searchCourses(searchDto: SearchCoursesDto): Promise<SearchResult<Course>> {
    const {
      query,
      level,
      minPrice,
      maxPrice,
      minRating,
      tags,
      instructorId,
      category,
      isFree,
      sortBy = SortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
      page = 1,
      limit = 12,
    } = searchDto;

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.category', 'category')
      .where('course.isPublished = :isPublished', { isPublished: true });

    // Text search in title and description
    if (query) {
      queryBuilder.andWhere(
        '(LOWER(course.title) LIKE LOWER(:query) OR LOWER(course.description) LIKE LOWER(:query))',
        { query: `%${query}%` },
      );
    }

    // Filter by level
    if (level) {
      queryBuilder.andWhere('course.level = :level', { level });
    }

    // Filter by price range
    if (minPrice !== undefined && maxPrice !== undefined) {
      queryBuilder.andWhere('course.price BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      });
    } else if (minPrice !== undefined) {
      queryBuilder.andWhere('course.price >= :minPrice', { minPrice });
    } else if (maxPrice !== undefined) {
      queryBuilder.andWhere('course.price <= :maxPrice', { maxPrice });
    }

    // Filter by free courses
    if (isFree !== undefined) {
      if (isFree) {
        queryBuilder.andWhere('course.price = 0');
      } else {
        queryBuilder.andWhere('course.price > 0');
      }
    }

    // Filter by rating
    if (minRating !== undefined) {
      queryBuilder.andWhere('course.rating >= :minRating', { minRating });
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      // PostgreSQL array overlap operator
      queryBuilder.andWhere('course.tags && :tags', { tags });
    }

    // Filter by instructor
    if (instructorId) {
      queryBuilder.andWhere('instructor.id = :instructorId', { instructorId });
    }

    // Filter by category
    if (category) {
      queryBuilder.andWhere('category.slug = :category', { category });
    }

    // Sorting
    const orderDirection = sortOrder === SortOrder.ASC ? 'ASC' : 'DESC';

    switch (sortBy) {
      case SortBy.TITLE:
        queryBuilder.orderBy('course.title', orderDirection);
        break;
      case SortBy.PRICE:
        queryBuilder.orderBy('course.price', orderDirection);
        break;
      case SortBy.RATING:
        queryBuilder.orderBy('course.rating', orderDirection);
        break;
      case SortBy.STUDENTS_COUNT:
        queryBuilder.orderBy('course.studentsCount', orderDirection);
        break;
      case SortBy.DURATION:
        queryBuilder.orderBy('course.duration', orderDirection);
        break;
      default:
        queryBuilder.orderBy('course.createdAt', orderDirection);
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const lastPage = Math.ceil(total / limit);
    const hasMore = page < lastPage;

    return {
      data,
      total,
      page,
      lastPage,
      hasMore,
    };
  }

  async getPopularCourses(limit = 10): Promise<Course[]> {
    return this.courseRepository.find({
      where: { isPublished: true },
      order: { studentsCount: 'DESC', rating: 'DESC' },
      take: limit,
      relations: ['instructor', 'category'],
    });
  }

  async getTrendingCourses(limit = 10): Promise<Course[]> {
    // Get courses with high enrollment in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoin('course.enrollments', 'enrollment')
      .where('course.isPublished = :isPublished', { isPublished: true })
      .andWhere('enrollment.createdAt >= :date', { date: thirtyDaysAgo })
      .groupBy('course.id')
      .addGroupBy('instructor.id')
      .addGroupBy('category.id')
      .orderBy('COUNT(enrollment.id)', 'DESC')
      .addOrderBy('course.rating', 'DESC')
      .take(limit)
      .getMany();
  }

  async getRecommendedCourses(userId: string, limit = 10): Promise<Course[]> {
    // Simple recommendation based on user's enrolled courses categories
    const userEnrollments = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('course.enrollments', 'enrollment')
      .leftJoinAndSelect('course.category', 'category')
      .where('enrollment.user.id = :userId', { userId })
      .getMany();

    if (userEnrollments.length === 0) {
      return this.getPopularCourses(limit);
    }

    // Get categories from user's courses
    const categories = userEnrollments
      .map(course => course.category?.id)
      .filter(Boolean);

    if (categories.length === 0) {
      return this.getPopularCourses(limit);
    }

    // Find courses in same categories that user hasn't enrolled in
    return this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoin('course.enrollments', 'enrollment', 'enrollment.user.id = :userId', { userId })
      .where('course.isPublished = :isPublished', { isPublished: true })
      .andWhere('category.id IN (:...categories)', { categories })
      .andWhere('enrollment.id IS NULL') // Not enrolled
      .orderBy('course.rating', 'DESC')
      .addOrderBy('course.studentsCount', 'DESC')
      .take(limit)
      .getMany();
  }

  async searchSuggestions(query: string, limit = 5): Promise<string[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const courses = await this.courseRepository
      .createQueryBuilder('course')
      .select('course.title')
      .where('LOWER(course.title) LIKE LOWER(:query)', { query: `%${query}%` })
      .andWhere('course.isPublished = :isPublished', { isPublished: true })
      .orderBy('course.studentsCount', 'DESC')
      .limit(limit)
      .getMany();

    return courses.map(course => course.title);
  }
}
