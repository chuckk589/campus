import { Module } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { AnswersController } from './answers.controller';
import { OpenAiService } from 'src/libs/openai/openai.service';

@Module({
  controllers: [AnswersController],
  providers: [AnswersService, OpenAiService],
})
export class AnswersModule {}
