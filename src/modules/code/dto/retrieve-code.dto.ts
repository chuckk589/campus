import { IsNumberString } from 'class-validator';
import { Code } from 'src/modules/mikroorm/entities/Code';

export class RetrieveCodeDto {
  constructor(code: Code) {
    this.id = code.id.toString();
    this.value = code.value;
    this.status = code.status;
    this.createdAt = code.createdAt;
    this.usedBy = code.attempt?.user ? `${code.attempt.user.login} (${code.attempt.user.name})` : '';
    this.usedByBanned = false;
    if (code.attempt?.user?.restriction && code.attempt.createdAt > code.attempt.user.restriction.createdAt) {
      this.usedByBanned = true;
    }
  }
  id: string;
  value: string;
  status: string;
  createdAt: Date;
  usedBy: string;
  usedByBanned: boolean;
}
