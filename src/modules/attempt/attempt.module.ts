import { Module } from '@nestjs/common';
import { AttemptService } from './attempt.service';
import { AttemptController } from './attempt.controller';
import { OpenAiService } from 'src/libs/openai/openai.service';

@Module({
  controllers: [AttemptController],
  providers: [AttemptService, OpenAiService],
})
export class AttemptModule {}
