import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  banReason: string;

  @IsBoolean()
  isBanned: boolean;
}
