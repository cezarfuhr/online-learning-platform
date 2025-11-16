import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Lesson } from '../../courses/entities/lesson.entity';

@Entity('lesson_progress')
export class LessonProgress extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Lesson, lesson => lesson.progress, { onDelete: 'CASCADE' })
  lesson: Lesson;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ default: 0 })
  watchedSeconds: number; // for video lessons

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  progressPercentage: number;

  @Column({ type: 'timestamp', nullable: true })
  lastAccessedAt: Date;
}
