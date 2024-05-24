import { Controller, Get, Post, Body, Param, Headers, UseGuards, Req, Query, HttpException, Put } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';

import { AuthVersionGuard } from '../auth/guards/local-auth-version.guard';
import { QuizAnswerRequest } from 'src/types/interfaces';
import { JwtAuthChromeGuard } from '../auth/guards/jwt-auth-chrome.guard';
import { FinishQuizDto } from './dto/finish-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { UserStatusGuard } from '../auth/guards/user-status.guard';

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

  @Get()
  @UseGuards(AuthVersionGuard)
  versionCheck() {
    return { status: 'ok' };
  }

  // @Put()
  // @UseGuards(AuthVersionGuard, JwtAuthChromeGuard, UserStatusGuard)
  // updateQuiz(@Req() req: QuizAnswerRequest, @Body() updateQuizDto: UpdateQuizDto) {
  //   return this.quizService.updateQuiz(+req.user.id, updateQuizDto);
  // }

  @Post('finish')
  @UseGuards(AuthVersionGuard, JwtAuthChromeGuard, UserStatusGuard)
  async finishQuiz(@Req() req: QuizAnswerRequest, @Body() finishQuizDto: FinishQuizDto) {
    return this.quizService.finishQuiz(req.user.id, finishQuizDto);
  }

  @Post('answer/:page')
  @UseGuards(AuthVersionGuard, JwtAuthChromeGuard, UserStatusGuard)
  getQuizAnswer(
    @Req() req: QuizAnswerRequest,
    @Param('page') page: string,
    @Headers('Session') session: string,
    @Body() updateQuizDto: UpdateQuizDto,
  ) {
    if (session) {
      return this.quizService.getQuizAnswer(session, req.user.id, page, updateQuizDto);
    } else {
      throw new HttpException('No session cookie', 401);
    }
  }
}
