import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumPost } from './entities/forum-post.entity';
import { ForumComment } from './entities/forum-comment.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ForumService {
  constructor(
    @InjectRepository(ForumPost)
    private postRepository: Repository<ForumPost>,
    @InjectRepository(ForumComment)
    private commentRepository: Repository<ForumComment>,
  ) {}

  async createPost(title: string, content: string, author: User, courseId?: string) {
    const post = this.postRepository.create({
      title,
      content,
      author,
      course: courseId ? { id: courseId } : null,
    });

    return this.postRepository.save(post);
  }

  async findAll(courseId?: string, page = 1, limit = 20) {
    const query: any = {};
    if (courseId) {
      query.course = { id: courseId };
    }

    const [posts, total] = await this.postRepository.findAndCount({
      where: query,
      skip: (page - 1) * limit,
      take: limit,
      relations: ['author', 'comments'],
      order: { isPinned: 'DESC', createdAt: 'DESC' },
    });

    return {
      data: posts,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'comments', 'comments.author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    post.viewsCount++;
    await this.postRepository.save(post);

    return post;
  }

  async addComment(postId: string, content: string, author: User) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = this.commentRepository.create({
      content,
      author,
      post,
    });

    return this.commentRepository.save(comment);
  }

  async likePost(postId: string) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    post.likesCount++;
    return this.postRepository.save(post);
  }
}
