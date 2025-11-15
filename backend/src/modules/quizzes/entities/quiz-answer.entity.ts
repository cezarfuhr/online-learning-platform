import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { QuizQuestion } from './quiz-question.entity';

@Entity('quiz_answers')
export class QuizAnswer extends BaseEntity {
  @Column('text')
  answer: string;

  @Column()
  isCorrect: boolean;

  @Column()
  order: number;

  @ManyToOne(() => QuizQuestion, question => question.answers, { onDelete: 'CASCADE' })
  question: QuizQuestion;
}
