import { Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { PrimaryGeneratedColumn, Column } from "typeorm";
import { Topic } from "./Topic.model";
@Entity()
export class UsePreferences {
  @PrimaryGeneratedColumn()
  user_id: number;

  @ManyToMany(() => Topic, (topic) => topic.usePreferences, {
    cascade: true,
    eager: true,
  })
  @JoinTable()
  topics: Topic[];

  @Column()
  delivery_time: string;

  @Column()
  delivery_frequency: "daily" | "weekly";

  @Column()
  delivery_method: "email" | "webhook";

  @Column()
  topic_String: string;
}
