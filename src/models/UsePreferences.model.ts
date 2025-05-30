import { Entity, OneToMany } from "typeorm";
import { PrimaryGeneratedColumn, Column } from "typeorm";
import { Topic } from "./Topic.model";
@Entity()
export class UsePreferences {
  @PrimaryGeneratedColumn()
  user_id: number;

  @OneToMany(() => Topic, (topic) => topic, { cascade: true, eager: true })
  topics: Topic[];

  @Column()
  delivery_time: string;

  @Column()
  delivery_frequency: "daily" | "weekly";

  @Column()
  delivery_method: "email" | "webhook";
}
