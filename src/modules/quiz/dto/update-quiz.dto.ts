import { Type } from 'class-transformer';
import { IsString, ValidateNested, IsObject } from 'class-validator';
import { CreateQuizDtoUser } from './create-quiz.dto';

export class UpdateQuizDto {
  @IsString()
  cmid?: string;

  @IsString()
  path?: string;

  @IsString()
  attempt?: string;

  @ValidateNested()
  @IsObject()
  @Type(() => CreateQuizDtoUser)
  user?: CreateQuizDtoUser;

  @IsString()
  name?: string;
}
