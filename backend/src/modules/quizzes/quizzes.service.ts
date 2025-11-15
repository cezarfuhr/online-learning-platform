import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { QuizAttempt, AttemptStatus } from './entities/quiz-attempt.entity';
import { QuizQuestion } from './entities/quiz-question.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(QuizAttempt)
    private attemptRepository: Repository<QuizAttempt>,
    @InjectRepository(QuizQuestion)
    private questionRepository: Repository<QuizQuestion>,
  ) {}

  async findOne(id: string): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['questions', 'questions.answers'],
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return quiz;
  }

  async startAttempt(quizId: string, user: User): Promise<QuizAttempt> {
    const quiz = await this.findOne(quizId);

    const previousAttempts = await this.attemptRepository.count({
      where: { quiz: { id: quizId }, user: { id: user.id } },
    });

    if (previousAttempts >= quiz.maxAttempts) {
      throw new BadRequestException('Maximum attempts reached');
    }

    const attempt = this.attemptRepository.create({
      quiz,
      user,
      status: AttemptStatus.IN_PROGRESS,
      startedAt: new Date(),
      attemptNumber: previousAttempts + 1,
    });

    return this.attemptRepository.save(attempt);
  }

  async submitAttempt(attemptId: string, answers: Record<string, any>): Promise<QuizAttempt> {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
      relations: ['quiz', 'quiz.questions', 'quiz.questions.answers'],
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Attempt already completed');
    }

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;

    for (const question of attempt.quiz.questions) {
      totalPoints += question.points;
      const userAnswer = answers[question.id];

      if (userAnswer) {
        const correctAnswer = question.answers.find(a => a.isCorrect);
        if (correctAnswer && userAnswer === correctAnswer.id) {
          earnedPoints += question.points;
        }
      }
    }

    const score = (earnedPoints / totalPoints) * 100;
    const passed = score >= attempt.quiz.passingScore;

    attempt.answers = answers;
    attempt.score = score;
    attempt.passed = passed;
    attempt.status = AttemptStatus.COMPLETED;
    attempt.completedAt = new Date();

    return this.attemptRepository.save(attempt);
  }

  async getUserAttempts(userId: string, quizId: string): Promise<QuizAttempt[]> {
    return this.attemptRepository.find({
      where: { user: { id: userId }, quiz: { id: quizId } },
      order: { attemptNumber: 'DESC' },
    });
  }
}
