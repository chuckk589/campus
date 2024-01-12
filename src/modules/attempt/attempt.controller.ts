import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { Put } from '@nestjs/common/decorators';
import { UpdateAnswerDto } from '../answers/dto/update-answer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AttemptService } from './attempt.service';
import { UpdateAttemptAnswerDto } from './dto/update-attempt-answer.dto';
import { UpdateAttemptDto } from './dto/update-attempt.dto';
import { IServerSideGetRowsRequest } from 'src/types/interfaces';

@Controller({ version: '1', path: 'attempt' })
@UseGuards(JwtAuthGuard)
export class AttemptController {
  constructor(private readonly attemptService: AttemptService) {}

  // @Post()
  // create(@Body() createAttemptDto: CreateAttemptDto) {
  //   return this.attemptService.create(createAttemptDto);
  // }

  @Get()
  findAll() {
    return this.attemptService.findAll();
  }

  @Post('/lazy')
  lazyload(@Body() body: IServerSideGetRowsRequest) {
    return this.attemptService.lazyload(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateAttemptDto: UpdateAttemptDto) {
    return this.attemptService.update(+id, updateAttemptDto);
  }

  @Put('/answer/:id')
  updateAnswer(@Param('id') id: string, @Body() updateAttemptAnswerDto: UpdateAttemptAnswerDto) {
    return this.attemptService.updateAnswer(+id, updateAttemptAnswerDto);
  }
  @Put('/pattern/:id')
  updatePattern(@Param('id') attemptAnswerId: string, @Body() updateAnswerDto: UpdateAnswerDto) {
    return this.attemptService.updatePattern(+attemptAnswerId, updateAnswerDto);
  }
}
