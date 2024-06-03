import { IsArray, IsNumberString, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class summaryData {
  [key: string]: string;
}
export class FinishQuizDto {
  @IsString({ each: true })
  correctQuestions!: string[];

  @IsObject()
  @Type(() => summaryData)
  summaryData!: summaryData;
}
