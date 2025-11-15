import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CourseLevel } from '../entities/course.entity';

export class CreateCourseDto {
  @ApiProperty({ example: 'Introduction to TypeScript' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Learn TypeScript from scratch' })
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({ enum: CourseLevel, default: CourseLevel.BEGINNER })
  @IsEnum(CourseLevel)
  level: CourseLevel;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @Min(0)
  price: number;
}
