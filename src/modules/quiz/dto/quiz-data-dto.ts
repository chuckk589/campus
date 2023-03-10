import { IsString } from 'class-validator';

export class QuizDataDto {
  @IsString()
  cookie!: string;

  @IsString()
  cmid!: string;

  @IsString()
  attempt!: string;
}
