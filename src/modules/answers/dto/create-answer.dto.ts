import { IsNumberString } from 'class-validator';

export class CreateAnswerDto {
  @IsNumberString()
  amount!: string;
}
