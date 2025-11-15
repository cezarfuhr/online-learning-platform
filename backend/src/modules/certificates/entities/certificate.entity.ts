import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity('certificates')
export class Certificate extends BaseEntity {
  @Column({ unique: true })
  certificateNumber: string;

  @ManyToOne(() => User, user => user.certificates, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Course, course => course.certificates, { eager: true, onDelete: 'CASCADE' })
  course: Course;

  @Column({ type: 'timestamp' })
  issuedAt: Date;

  @Column({ nullable: true })
  pdfUrl: string;

  @Column('decimal', { precision: 5, scale: 2 })
  finalScore: number;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verificationCode: string;
}
