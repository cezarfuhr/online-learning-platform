import { User } from './user.model';

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  level: CourseLevel;
  price: number;
  duration: number;
  instructor: User;
  isPublished: boolean;
  studentsCount: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseEnrollment {
  id: string;
  course: Course;
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  completedAt?: Date;
  lastAccessedAt?: Date;
}
