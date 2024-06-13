import { Owner } from 'src/modules/mikroorm/entities/Owner';

export class RetrieveOwnerDto {
  constructor(owner: Owner) {
    this.createdAt = owner.createdAt;
    this.id = owner.id;
    this.role = owner.role;
    this.username = owner.username;
    this.email = owner.email;
    this.credentials = owner.credentials;
    this.permissions = owner.permissions?.getItems()?.map((permission) => ({
      id: permission.permission.id.toString(),
      metadata: permission.metadata,
    }));
  }
  id: number;
  createdAt: Date;
  role: string;
  username: string;
  email: string;
  credentials: string;
  permissions: RetrieveOwnerPermissionDto[];
}
export class RetrieveOwnerPermissionDto {
  id: string;
  metadata: string;
}
