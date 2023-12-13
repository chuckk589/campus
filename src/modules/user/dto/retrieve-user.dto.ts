import { User } from 'src/modules/mikroorm/entities/User';

export class RetrieveUserDto {
  constructor(user: User) {
    this.id = user.id;
    this.userId = user.userId;
    this.login = user.login;
    this.name = user.name;
    this.isBanned = !(user.restriction == null);
    this.createdAt = user.createdAt;
    this.banReason = user.restriction?.reason;
  }
  id: number;
  userId: string;
  login: string;
  name: string;
  isBanned: boolean;
  createdAt: Date;
  banReason?: string;
}
