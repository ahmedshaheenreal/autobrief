import { Entity, Column, OneToMany, ManyToMany } from "typeorm";
import { Digest } from "./Digests.model";

@Entity()
export class User {
  @Column({ primary: true, generated: true })
  id: number;

  @Column({ type: "varchar", length: 100, unique: true, nullable: false })
  email: string;

  @Column({ type: "varchar" })
  password: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  firstName?: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  lastName?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  timezone?: string;

  @ManyToMany(() => Digest, (digest) => digest.users)
  digests: Digest[];
}
