import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UsePreferences } from "./UsePreferences.model";
import { Article } from "./Article.model";

@Entity()
export class Topic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100, unique: true, nullable: false })
  name: string;

  @ManyToOne(() => UsePreferences, (userpref) => userpref.topics)
  usePreferences: UsePreferences;

  @OneToMany(() => Article, (article) => article.id, {
    cascade: true,
  })
  article_ids: number[];

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;
  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  // Add any additional properties or methods as needed
}
