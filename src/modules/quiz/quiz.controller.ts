import { Controller, Get, Post, Body, Param, Headers, UseGuards, Req, Query, HttpException } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';

import { AuthVersionGuard } from '../auth/guards/local-auth-version.guard';
import { QuizAnswerRequest } from 'src/types/interfaces';
import { JwtAuthChromeGuard } from '../auth/guards/jwt-auth-chrome.guard';

@Controller({
  path: 'quiz',
  version: '1',
})
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('new')
  @UseGuards(AuthVersionGuard)
  initNewQuiz(@Body() createQuizDto: CreateQuizDto) {
    return this.quizService.createQuiz(createQuizDto);
  }

  @Get('answer')
  @UseGuards(JwtAuthChromeGuard)
  @UseGuards(AuthVersionGuard)
  getQuizAnswer(
    @Req() req: QuizAnswerRequest,
    @Query('id') id: string,
    @Query('attempt') attempt: string,
    @Headers('Session') session: string,
  ) {
    if (session) {
      return this.quizService.getQuizAnswer(session, req.user.id, id, attempt);
    } else {
      throw new HttpException('No session cookie', 400);
    }
  }
}
