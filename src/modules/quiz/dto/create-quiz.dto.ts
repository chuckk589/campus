import { IsNumberString, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
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
  @IsOptional()
  cmid?: string;

  @IsString()
  @IsOptional()
  path?: string;

  @ValidateNested()
  @IsObject()
  @IsOptional()
  @Type(() => CreateQuizDtoUser)
  user?: CreateQuizDtoUser;
}
