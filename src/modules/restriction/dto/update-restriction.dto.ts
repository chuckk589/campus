import { IsOptional, IsString } from 'class-validator';

export class UpdateRestrictionDto {
  @IsString()
  @IsOptional()
  reason: string;
}
