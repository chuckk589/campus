import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { Put, Req } from '@nestjs/common/decorators';
import { UpdateAnswerDto } from '../answers/dto/update-answer.dto';
import { LoggedInGuard } from '../auth/guards/loggedin.guard';
import { AttemptService } from './attempt.service';
import { UpdateAttemptAnswerDto } from './dto/update-attempt-answer.dto';
import { UpdateAttemptDto } from './dto/update-attempt.dto';
import { IServerSideGetRowsRequest } from 'src/types/agGridTypes';
import { RequestWithUser } from 'src/types/interfaces';
import { Roles } from '../auth/guards/role.guard';

@Controller({ version: '1', path: 'attempt' })
@UseGuards(LoggedInGuard)
export class AttemptController {
  constructor(private readonly attemptService: AttemptService) {}

  @Post('/load')
  lazyload(@Req() req: RequestWithUser, @Body() body: IServerSideGetRowsRequest) {
    return this.attemptService.lazyload(body, req.user);
  }

  @Put(':id')
  @Roles(['admin'])
  update(@Param('id') id: string, @Body() updateAttemptDto: UpdateAttemptDto) {
    return this.attemptService.update(+id, updateAttemptDto);
  }

  @Put('/answer/:id')
  updateAnswer(@Param('id') id: string, @Body() updateAttemptAnswerDto: UpdateAttemptAnswerDto) {
    return this.attemptService.updateAnswer(+id, updateAttemptAnswerDto);
  }

  @Get('/pattern/:id/ai')
  getAiAnswer(@Param('id') attemptAnswerId: string) {
    return this.attemptService.getAiAnswer(+attemptAnswerId);
  }

  @Put('/pattern/:id')
  updatePattern(@Req() req: RequestWithUser, @Param('id') attemptAnswerId: string, @Body() updateAnswerDto: UpdateAnswerDto) {
    return this.attemptService.updatePattern(req.user, +attemptAnswerId, updateAnswerDto);
  }
}
