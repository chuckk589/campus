import { IsOptional, IsString } from 'class-validator';

export class UpdateOwnerDto {
  @IsString()
  @IsOptional()
  credentials: string;
  @IsString()
  @IsOptional()
  email: string;
  @IsString()
  @IsOptional()
  password: string;
  @IsString({ each: true })
  permissions: string[];
  @IsString()
  @IsOptional()
  role: string;
}
