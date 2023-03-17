import { Controller, Get, Post, Body, Param, Headers, UseGuards, Req, Query, HttpException, Put } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';

import { AuthVersionGuard } from '../auth/guards/local-auth-version.guard';
import { QuizAnswerRequest } from 'src/types/interfaces';
import { JwtAuthChromeGuard } from '../auth/guards/jwt-auth-chrome.guard';
import { FinishQuizDto } from './dto/finish-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

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

  @Put()
  @UseGuards(AuthVersionGuard)
  @UseGuards(JwtAuthChromeGuard)
  updateQuiz(@Req() req: QuizAnswerRequest, @Body() updateQuizDto: UpdateQuizDto) {
    return this.quizService.updateQuiz(+req.user.id, updateQuizDto);
  }

  @Post('finish')
  @UseGuards(AuthVersionGuard)
  @UseGuards(JwtAuthChromeGuard)
  async finishQuiz(@Req() req: QuizAnswerRequest, @Body() finishQuizDto: FinishQuizDto) {
    return this.quizService.finishQuiz(req.user.id, finishQuizDto);
  }

  @Post('answer/:page/attempt/:attempt')
  @UseGuards(AuthVersionGuard)
  @UseGuards(JwtAuthChromeGuard)
  getQuizAnswer(
    @Req() req: QuizAnswerRequest,
    @Param('page') page: string,
    @Param('attempt') attempt: string,
    @Headers('Session') session: string,
  ) {
    if (session) {
      return this.quizService.getQuizAnswer(session, req.user.id, page, attempt);
    } else {
      throw new HttpException('No session cookie', 400);
    }
  }
}
