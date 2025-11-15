import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Quiz } from './quiz.entity';

export enum AttemptStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

@Entity('quiz_attempts')
export class QuizAttempt extends BaseEntity {
  @ManyToOne(() => User, user => user.quizAttempts, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Quiz, quiz => quiz.attempts, { onDelete: 'CASCADE' })
  quiz: Quiz;

  @Column({
    type: 'enum',
    enum: AttemptStatus,
    default: AttemptStatus.IN_PROGRESS,
  })
  status: AttemptStatus;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  score: number;

  @Column('jsonb', { nullable: true })
  answers: Record<string, any>; // questionId -> answer

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ default: 1 })
  attemptNumber: number;

  @Column({ default: false })
  passed: boolean;
}
