import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { Put, UploadedFile, UseInterceptors } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnswersService } from './answers.service';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { IServerSideGetRowsRequest } from 'src/types/interfaces';

@Controller({
  version: '1',
  path: 'answers',
})
@UseGuards(JwtAuthGuard)
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(@UploadedFile() pattern: Express.Multer.File) {
    return await this.answersService.create(pattern);
  }

  @Get()
  findAll() {
    return this.answersService.findAll();
  }
  @Post('/lazy')
  lazyload(@Body() body: IServerSideGetRowsRequest) {
    return this.answersService.lazyload(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateAnswerDto: UpdateAnswerDto) {
    return this.answersService.update(+id, updateAnswerDto);
  }

  // @Get(':id/ai')
  // getAiAnswer(@Param('id') id: string) {
  //   return this.answersService.getAiAnswer(+id);
  // }
}
