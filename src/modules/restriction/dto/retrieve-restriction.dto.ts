import { UserRestriction } from 'src/modules/mikroorm/entities/UserRestriction';

export class RetrieveRestrictionDto {
  constructor(restriction: UserRestriction) {
    this.id = restriction.id;
    this.name = restriction.name;
    this.login = restriction.login;
    this.reason = restriction.reason;
    this.userId = restriction.userId;
    this.createdAt = restriction.createdAt;
  }
  id: number;
  name: string;
  login: string;
  reason: string;
  userId: string;
  createdAt: Date;
}
