import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumService } from './forum.service';
import { ForumPost } from './entities/forum-post.entity';
import { ForumComment } from './entities/forum-comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ForumPost, ForumComment])],
  providers: [ForumService],
  exports: [ForumService, TypeOrmModule],
})
export class ForumModule {}
