import { Entity, PrimaryKey } from "@mikro-orm/core";
import { CustomBaseEntity } from "./CustomBaseEntity";

@Entity()
export class Owner extends CustomBaseEntity {
  @PrimaryKey()
  id!: number;

  
}
