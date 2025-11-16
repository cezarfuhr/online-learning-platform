import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { CourseModule } from './course-module.entity';
import { CourseEnrollment } from './course-enrollment.entity';
import { Certificate } from '../../certificates/entities/certificate.entity';
import { CourseCategory } from './course-category.entity';

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity('courses')
export class Course extends BaseEntity {
  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({
    type: 'enum',
    enum: CourseLevel,
    default: CourseLevel.BEGINNER,
  })
  level: CourseLevel;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ default: 0 })
  duration: number; // in minutes

  @ManyToOne(() => User, { eager: true })
  instructor: User;

  @OneToMany(() => CourseModule, module => module.course)
  modules: CourseModule[];

  @OneToMany(() => CourseEnrollment, enrollment => enrollment.course)
  enrollments: CourseEnrollment[];

  @OneToMany(() => Certificate, certificate => certificate.course)
  certificates: Certificate[];

  @Column({ default: true })
  isPublished: boolean;

  @Column({ default: 0 })
  studentsCount: number;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating: number;

  @ManyToOne(() => CourseCategory, category => category.courses, { nullable: true })
  category: CourseCategory;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ default: 0 })
  reviewsCount: number;
}
