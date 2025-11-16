import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { ForumComment } from './forum-comment.entity';

@Entity('forum_posts')
export class ForumPost extends BaseEntity {
  @Column()
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, user => user.forumPosts, { eager: true, onDelete: 'CASCADE' })
  author: User;

  @ManyToOne(() => Course, { nullable: true })
  course: Course;

  @OneToMany(() => ForumComment, comment => comment.post)
  comments: ForumComment[];

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  viewsCount: number;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ default: false })
  isClosed: boolean;

  @Column('simple-array', { nullable: true })
  tags: string[];
}
