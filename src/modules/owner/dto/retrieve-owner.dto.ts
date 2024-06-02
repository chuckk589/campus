import { Owner } from 'src/modules/mikroorm/entities/Owner';

export class RetrieveOwnerDto {
  constructor(owner: Owner) {
    Object.assign(this, owner);
  }
}
