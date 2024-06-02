import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOwnerDto {
  @IsString()
  @IsNotEmpty()
  role: string;
  @IsString()
  @IsNotEmpty()
  username: string;
  @IsString()
  password: string;
  @IsString()
  @IsOptional()
  email: string;
  @IsString()
  @IsOptional()
  firstName: string;
  @IsString()
  @IsOptional()
  lastName: string;
}
