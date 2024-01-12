import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateRestrictionDto {
  @IsNumberString()
  userId: string;
  @IsString()
  @IsOptional()
  reason: string;
}
