import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Lesson } from '../../courses/entities/lesson.entity';

export enum VideoQuality {
  SD = '480p',
  HD = '720p',
  FULL_HD = '1080p',
  UHD = '4k',
}

@Entity('videos')
export class Video extends BaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  s3Key: string; // S3 object key

  @Column()
  cloudFrontUrl: string; // CloudFront streaming URL

  @Column()
  duration: number; // in seconds

  @Column('simple-array', { nullable: true })
  availableQualities: VideoQuality[];

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column('bigint', { default: 0 })
  fileSize: number; // in bytes

  @Column({ default: 'video/mp4' })
  mimeType: string;

  @OneToOne(() => Lesson, lesson => lesson.video, { onDelete: 'CASCADE' })
  @JoinColumn()
  lesson: Lesson;

  @Column({ default: 0 })
  viewsCount: number;

  @Column({ default: false })
  isProcessed: boolean; // for adaptive streaming processing
}
