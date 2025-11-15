import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Course } from './course.entity';

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('course_enrollments')
export class CourseEnrollment extends BaseEntity {
  @ManyToOne(() => User, user => user.enrollments, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Course, course => course.enrollments, { onDelete: 'CASCADE' })
  course: Course;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  progress: number; // percentage

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastAccessedAt: Date;
}
