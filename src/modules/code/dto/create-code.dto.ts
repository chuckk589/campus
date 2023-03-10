import { IsNumberString } from 'class-validator';

export class CreateCodeDto {
  @IsNumberString()
  amount!: string;
}
