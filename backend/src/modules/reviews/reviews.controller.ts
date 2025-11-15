import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review' })
  async createReview(@Body() createReviewDto: CreateReviewDto, @CurrentUser() user: User) {
    return this.reviewsService.createReview(createReviewDto, user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a review' })
  async updateReview(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.updateReview(id, updateReviewDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review' })
  async deleteReview(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reviewsService.deleteReview(id, user);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get course reviews' })
  async getCourseReviews(
    @Param('courseId') courseId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('sortBy') sortBy: 'rating' | 'date' | 'helpful',
  ) {
    return this.reviewsService.getCourseReviews(courseId, page, limit, sortBy);
  }

  @Get('course/:courseId/my-review')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user review for a course' })
  async getUserReview(@Param('courseId') courseId: string, @CurrentUser() user: User) {
    return this.reviewsService.getUserReview(user.id, courseId);
  }

  @Post(':id/helpful')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark review as helpful' })
  async markHelpful(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reviewsService.markHelpful(id, user);
  }

  @Delete(':id/helpful')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unmark review as helpful' })
  async unmarkHelpful(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reviewsService.unmarkHelpful(id, user);
  }

  @Get('course/:courseId/stats')
  @ApiOperation({ summary: 'Get course rating statistics' })
  async getCourseRatingStats(@Param('courseId') courseId: string) {
    return this.reviewsService.getCourseRatingStats(courseId);
  }
}
