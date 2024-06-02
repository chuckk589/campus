import { IsNumberString } from 'class-validator';
import { Code } from 'src/modules/mikroorm/entities/Code';
import { UserRestriction } from 'src/modules/mikroorm/entities/UserRestriction';

export class RetrieveCodeDto {
  constructor(code: Code, restriction?: UserRestriction) {
    this.id = code.id.toString();
    this.value = code.value;
    this.status = code.status;
    this.createdAt = code.createdAt;
    this.usedBy = code.attempt?.user ? `${code.attempt.user.login} (${code.attempt.user.name})` : '';
    this.usedByBanned = false;
    if (restriction && code.attempt.createdAt > restriction.createdAt) {
      this.usedByBanned = true;
    }
    this.createdBy = code.createdBy?.username;
  }
  id: string;
  value: string;
  status: string;
  createdAt: Date;
  usedBy: string;
  usedByBanned: boolean;
  createdBy: string;
}
