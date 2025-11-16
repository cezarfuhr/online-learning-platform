import { Entity, Column, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CourseModule } from './course-module.entity';
import { Video } from '../../videos/entities/video.entity';
import { Quiz } from '../../quizzes/entities/quiz.entity';
import { LessonProgress } from '../../progress/entities/lesson-progress.entity';

export enum LessonType {
  VIDEO = 'video',
  QUIZ = 'quiz',
  TEXT = 'text',
}

@Entity('lessons')
export class Lesson extends BaseEntity {
  @Column()
  title: string;

  @Column('text', { nullable: true })
  content: string;

  @Column({
    type: 'enum',
    enum: LessonType,
    default: LessonType.VIDEO,
  })
  type: LessonType;

  @Column()
  order: number;

  @Column({ default: 0 })
  duration: number; // in seconds

  @ManyToOne(() => CourseModule, module => module.lessons, { onDelete: 'CASCADE' })
  module: CourseModule;

  @OneToOne(() => Video, video => video.lesson, { nullable: true })
  video: Video;

  @OneToOne(() => Quiz, quiz => quiz.lesson, { nullable: true })
  quiz: Quiz;

  @OneToMany(() => LessonProgress, progress => progress.lesson)
  progress: LessonProgress[];

  @Column({ default: false })
  isFree: boolean;
}
