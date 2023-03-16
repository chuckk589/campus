import { IsNumberString, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuizDtoUser {
  @IsString()
  name!: string;

  @IsString()
  id!: string;

  @IsString()
  login!: string;
}

export class CreateQuizDto {
  @IsString({ message: 'Отсутствует обязательный параметр - код' })
  code!: string;

  @IsString()
  cmid!: string;

  @ValidateNested()
  @IsObject()
  @Type(() => CreateQuizDtoUser)
  user!: CreateQuizDtoUser;
}
