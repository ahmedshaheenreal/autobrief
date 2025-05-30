import { User } from "./User.model";
import { Article } from "./Article.model";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
  ManyToMany,
} from "typeorm";

export enum DeliveryStatus {
  PENDING = "pending",
  DELIVERED = "delivered",
  FAILED = "failed",
}

@Entity("digest")
export class Digest {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToMany(() => User, (user) => user.digests, {
    onDelete: "CASCADE",
  })
  @JoinTable({
    name: "digest_user",
    joinColumn: {
      name: "digest_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "user_id",
      referencedColumnName: "id",
    },
  })
  users: User[];

  @Column({ type: "date" })
  date: string;

  @ManyToMany(() => Article)
  @JoinTable({
    name: "digest_articles",
    joinColumn: { name: "digest_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "article_id", referencedColumnName: "id" },
  })
  articles: Article[];

  @Column({ type: "timestamp", nullable: true })
  delivered_at: Date | null;

  @Column({
    type: "enum",
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  delivery_status: DeliveryStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
