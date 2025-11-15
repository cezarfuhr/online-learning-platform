import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { ForumPost } from './forum-post.entity';

@Entity('forum_comments')
export class ForumComment extends BaseEntity {
  @Column('text')
  content: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  author: User;

  @ManyToOne(() => ForumPost, post => post.comments, { onDelete: 'CASCADE' })
  post: ForumPost;

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: false })
  isAccepted: boolean; // accepted answer
}
