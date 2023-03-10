import { IsNumberString, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateQuizDtoUser {
  @IsString()
  name!: string;

  @IsString()
  id!: string;
}

export class CreateQuizDto {
  @IsString()
  code!: string;

  @IsString()
  cmid!: string;

  @IsNumberString()
  time!: string;

  @ValidateNested()
  @IsObject()
  @Type(() => CreateQuizDtoUser)
  user!: CreateQuizDtoUser;
}
