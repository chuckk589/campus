import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [QuizController],
  providers: [QuizService, JwtService],
})
export class QuizModule {}
