import { User } from 'src/modules/mikroorm/entities/User';
import { UserRestriction } from 'src/modules/mikroorm/entities/UserRestriction';

export class RetrieveUserDto {
  constructor(user: User, restriction?: UserRestriction) {
    this.id = user.id;
    this.userId = user.userId;
    this.login = user.login;
    this.name = user.name;
    this.createdAt = user.createdAt;
    this.isBanned = restriction ? true : false;
    this.banReason = restriction ? restriction.reason : '';
  }
  id: number;
  userId: string;
  login: string;
  name: string;
  isBanned: boolean;
  createdAt: Date;
  banReason?: string;
}
