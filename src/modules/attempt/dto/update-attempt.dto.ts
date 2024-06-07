import { IsBoolean, IsEnum } from 'class-validator';
import { AttemptStatus } from 'src/modules/mikroorm/entities/QuizResult';

export class UpdateAttemptDto {
  @IsEnum(AttemptStatus)
  status!: AttemptStatus;

  @IsBoolean()
  editable!: boolean;
}
