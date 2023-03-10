import { IsEnum } from 'class-validator';
import { CodeStatus } from 'src/modules/mikroorm/entities/Code';

export class UpdateCodeDto {
  @IsEnum(CodeStatus)
  status!: CodeStatus;
}
