import { Entity, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Review } from './review.entity';

@Entity('review_helpful')
@Index(['user', 'review'], { unique: true })
export class ReviewHelpful extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Review, { onDelete: 'CASCADE' })
  review: Review;
}
