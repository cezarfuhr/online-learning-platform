import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchCoursesDto } from './dto/search-courses.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('courses')
  @ApiOperation({ summary: 'Search courses with filters' })
  async searchCourses(@Query() searchDto: SearchCoursesDto) {
    return this.searchService.searchCourses(searchDto);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular courses' })
  async getPopularCourses(@Query('limit') limit?: number) {
    return this.searchService.getPopularCourses(limit);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending courses' })
  async getTrendingCourses(@Query('limit') limit?: number) {
    return this.searchService.getTrendingCourses(limit);
  }

  @Get('recommended')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recommended courses for user' })
  async getRecommendedCourses(
    @CurrentUser() user: User,
    @Query('limit') limit?: number,
  ) {
    return this.searchService.getRecommendedCourses(user.id, limit);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions' })
  async searchSuggestions(
    @Query('query') query: string,
    @Query('limit') limit?: number,
  ) {
    return this.searchService.searchSuggestions(query, limit);
  }
}
