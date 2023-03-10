import { IsString } from 'class-validator';

export class RetrieveSessionDto {
  @IsString()
  password!: string;
  @IsString()
  username!: string;
}
