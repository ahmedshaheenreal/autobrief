import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Topic } from "./Topic.model";

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", nullable: false })
  title!: string;

  @Column({ type: "text", nullable: false })
  summary!: string;

  @Column({ type: "varchar", nullable: false, unique: true })
  url!: string;

  @ManyToOne(() => Topic, (topic) => topic)
  topic!: Topic;

  @Column({ type: "varchar", nullable: false })
  source!: string;

  @Column({ type: "timestamp", nullable: false })
  published_at!: Date;
}
