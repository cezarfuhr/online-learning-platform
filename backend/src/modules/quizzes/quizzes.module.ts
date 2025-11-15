import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizzesService } from './quizzes.service';
import { Quiz } from './entities/quiz.entity';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizAnswer } from './entities/quiz-answer.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, QuizQuestion, QuizAnswer, QuizAttempt])],
  providers: [QuizzesService],
  exports: [QuizzesService, TypeOrmModule],
})
export class QuizzesModule {}
