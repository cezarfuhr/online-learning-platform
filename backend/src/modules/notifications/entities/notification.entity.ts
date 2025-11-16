import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  COURSE_ENROLLED = 'course_enrolled',
  COURSE_UPDATED = 'course_updated',
  NEW_LESSON = 'new_lesson',
  QUIZ_GRADED = 'quiz_graded',
  CERTIFICATE_GENERATED = 'certificate_generated',
  FORUM_REPLY = 'forum_reply',
  FORUM_LIKE = 'forum_like',
  COURSE_COMPLETED = 'course_completed',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  SUBSCRIPTION_RENEWED = 'subscription_renewed',
  SUBSCRIPTION_EXPIRING = 'subscription_expiring',
  NEW_REVIEW = 'new_review',
  ANNOUNCEMENT = 'announcement',
}

@Entity('notifications')
export class Notification extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  actionUrl: string;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;
}
