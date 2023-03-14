import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { AttemptStatus } from 'src/modules/mikroorm/entities/QuizResult';

export class UpdateAttemptAnswerDto {
  @IsOptional()
  @IsBoolean()
  answered: boolean;
}
