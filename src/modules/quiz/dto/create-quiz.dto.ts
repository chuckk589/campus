import { IsNumberString, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateQuizDtoUser {
  @IsString()
  name!: string;

  @IsString()
  id!: string;
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
