import { IsArray, IsNumberString, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionState } from 'src/modules/mikroorm/entities/QuizAnswerState';

export class summaryData {
  [key: string]: string;
}
export class FinishQuizDto {
  @IsArray()
  @ValidateNested({ each: true })
  questions!: { value: string; state: QuestionState }[];

  @IsObject()
  @Type(() => summaryData)
  summaryData!: summaryData;
}
