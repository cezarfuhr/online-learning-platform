import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Course } from './course.entity';
import { Lesson } from './lesson.entity';

@Entity('course_modules')
export class CourseModule extends BaseEntity {
  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column()
  order: number;

  @ManyToOne(() => Course, course => course.modules, { onDelete: 'CASCADE' })
  course: Course;

  @OneToMany(() => Lesson, lesson => lesson.module)
  lessons: Lesson[];
}
