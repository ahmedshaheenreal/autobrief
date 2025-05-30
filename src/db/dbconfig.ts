import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "../models/User.model";
import { Article } from "../models/Article.model";
import { Digest } from "../models/Digests.model";
import { Topic } from "../models/Topic.model";
import { UsePreferences } from "../models/UsePreferences.model";
dotenv.config();
const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  username: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "",
  entities: [User, Article, Digest, Topic, UsePreferences],
  synchronize: true, // Set to false in production
  logging: false, // Set to true for debugging
});
export default AppDataSource;
