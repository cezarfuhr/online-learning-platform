import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity('reviews')
@Index(['user', 'course'], { unique: true }) // One review per user per course
export class Review extends BaseEntity {
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  course: Course;

  @Column('int')
  rating: number; // 1-5

  @Column('text', { nullable: true })
  comment: string;

  @Column({ default: 0 })
  helpfulCount: number; // How many users found this helpful

  @Column({ default: false })
  isVerifiedPurchase: boolean;

  @Column({ default: false })
  isFeatured: boolean; // Can be featured by admin

  @Column({ type: 'timestamp', nullable: true })
  editedAt: Date;

  @Column({ default: false })
  isModerated: boolean;

  @Column({ nullable: true })
  moderationNote: string;
}
