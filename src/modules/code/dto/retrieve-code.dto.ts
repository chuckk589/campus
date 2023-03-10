import { IsNumberString } from 'class-validator';
import { Code } from 'src/modules/mikroorm/entities/Code';

export class RetrieveCodeDto {
  constructor(code: Code) {
    this.id = code.id.toString();
    this.value = code.value;
    this.status = code.status;
    this.createdAt = code.createdAt;
  }
  id: string;
  value: string;
  status: string;
  createdAt: Date;
}
