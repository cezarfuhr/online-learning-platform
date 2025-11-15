import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Exclude } from 'class-transformer';
import { CourseEnrollment } from '../../courses/entities/course-enrollment.entity';
import { Certificate } from '../../certificates/entities/certificate.entity';
import { ForumPost } from '../../forum/entities/forum-post.entity';
import { QuizAttempt } from '../../quizzes/entities/quiz-attempt.entity';

export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => CourseEnrollment, enrollment => enrollment.user)
  enrollments: CourseEnrollment[];

  @OneToMany(() => Certificate, certificate => certificate.user)
  certificates: Certificate[];

  @OneToMany(() => ForumPost, post => post.author)
  forumPosts: ForumPost[];

  @OneToMany(() => QuizAttempt, attempt => attempt.user)
  quizAttempts: QuizAttempt[];
}
