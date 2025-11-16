import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Course } from './course.entity';

@Entity('course_categories')
export class CourseCategory extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: 0 })
  order: number;

  @OneToMany(() => Course, course => course.category)
  courses: Course[];

  @Column('simple-array', { nullable: true })
  tags: string[];
}
