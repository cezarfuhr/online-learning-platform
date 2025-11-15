import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Quiz } from './quiz.entity';
import { QuizAnswer } from './quiz-answer.entity';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
}

@Entity('quiz_questions')
export class QuizQuestion extends BaseEntity {
  @Column('text')
  question: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.MULTIPLE_CHOICE,
  })
  type: QuestionType;

  @Column()
  points: number;

  @Column()
  order: number;

  @ManyToOne(() => Quiz, quiz => quiz.questions, { onDelete: 'CASCADE' })
  quiz: Quiz;

  @OneToMany(() => QuizAnswer, answer => answer.question)
  answers: QuizAnswer[];

  @Column('text', { nullable: true })
  explanation: string;
}
