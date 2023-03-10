import { User } from 'src/modules/mikroorm/entities/User';

export class RetrieveStatusDto {
  constructor(init?: Partial<RetrieveStatusDto>) {
    Object.assign(this, init);
  }
  title: string;
  value: string;
  comment?: string;
}
