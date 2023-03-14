import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { Put, UploadedFile, UseInterceptors } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnswersService } from './answers.service';
import { UpdateAnswerDto } from './dto/update-answer.dto';

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

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.answersService.findOne(+id);
  // }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateAnswerDto: UpdateAnswerDto) {
    return this.answersService.update(+id, updateAnswerDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.answersService.remove(+id);
  // }
}
