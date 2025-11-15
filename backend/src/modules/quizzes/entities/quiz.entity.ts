import { Entity, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Lesson } from '../../courses/entities/lesson.entity';
import { QuizQuestion } from './quiz-question.entity';
import { QuizAttempt } from './quiz-attempt.entity';

@Entity('quizzes')
export class Quiz extends BaseEntity {
  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: 60 })
  timeLimit: number; // in minutes

  @Column({ default: 70 })
  passingScore: number; // percentage

  @Column({ default: 3 })
  maxAttempts: number;

  @OneToOne(() => Lesson, lesson => lesson.quiz, { onDelete: 'CASCADE' })
  @JoinColumn()
  lesson: Lesson;

  @OneToMany(() => QuizQuestion, question => question.quiz)
  questions: QuizQuestion[];

  @OneToMany(() => QuizAttempt, attempt => attempt.quiz)
  attempts: QuizAttempt[];

  @Column({ default: true })
  shuffleQuestions: boolean;

  @Column({ default: false })
  showCorrectAnswers: boolean; // after completion
}
