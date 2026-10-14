import { DataSource } from "typeorm";
import { config } from "../config/env";
import { User } from "../models/User.model";
import { Article } from "../models/Article.model";
import { Digest } from "../models/Digests.model";
import { Topic } from "../models/Topic.model";
import { UsePreferences } from "../models/UsePreferences.model";

const AppDataSource = new DataSource({
  type: "mysql",
  host: config.db.host,
  port: config.db.port,
  username: config.db.username,
  password: config.db.password,
  database: config.db.database,
  entities: [User, Article, Digest, Topic, UsePreferences],
  synchronize: config.db.synchronize,
  logging: false,
});
export default AppDataSource;
