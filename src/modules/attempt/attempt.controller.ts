import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { Put, Req, UseInterceptors } from '@nestjs/common/decorators';
import { UpdateAnswerDto } from '../answers/dto/update-answer.dto';
import { LoggedInGuard } from '../auth/guards/loggedin.guard';
import { AttemptService } from './attempt.service';
import { UpdateAttemptAnswerDto } from './dto/update-attempt-answer.dto';
import { UpdateAttemptDto } from './dto/update-attempt.dto';
import { IServerSideGetRowsRequest } from 'src/types/agGridTypes';
import { RequestWithUser } from 'src/types/interfaces';
import { Roles } from '../auth/guards/role.guard';
import { RetrieveAttemptDto } from './dto/retrieve-attempt.dto';
import { UserSanitizeInterceptor } from 'src/common/userSanitizeInterceptor';
import { RetrieveAttemptAnswerDto } from './dto/retrieve-attempt-answer.dto';

@Controller({ version: '1', path: 'attempt' })
@UseGuards(LoggedInGuard)
export class AttemptController {
  constructor(private readonly attemptService: AttemptService) {}

  @Post('/load')
  @UseInterceptors(new UserSanitizeInterceptor(RetrieveAttemptDto, 'rows'))
  lazyload(@Req() req: RequestWithUser, @Body() body: IServerSideGetRowsRequest) {
    return this.attemptService.lazyload(body, req.user);
  }

  @Put(':id')
  @Roles(['admin'])
  update(@Param('id') id: string, @Body() updateAttemptDto: UpdateAttemptDto) {
    return this.attemptService.update(+id, updateAttemptDto);
  }

  // @Put('/answer/:id')
  // updateAnswer(@Req() req: RequestWithUser, @Param('id') id: string, @Body() updateAttemptAnswerDto: UpdateAttemptAnswerDto) {
  //   return this.attemptService.updateAnswer(req.user, +id, updateAttemptAnswerDto);
  // }

  @Get('/pattern/:id/ai')
  getAiAnswer(@Param('id') attemptAnswerId: string) {
    return this.attemptService.getAiAnswer(+attemptAnswerId);
  }

  @Put('/pattern/:id')
  @UseInterceptors(new UserSanitizeInterceptor(RetrieveAttemptAnswerDto))
  updatePattern(@Req() req: RequestWithUser, @Param('id') attemptAnswerId: string, @Body() updateAnswerDto: UpdateAnswerDto) {
    return this.attemptService.updatePattern(req.user, +attemptAnswerId, updateAnswerDto);
  }
}
