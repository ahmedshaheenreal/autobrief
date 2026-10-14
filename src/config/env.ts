import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

const tokenSecret = process.env.TOKEN_SECRET;
if (!tokenSecret && isProduction) {
  throw new Error("TOKEN_SECRET must be set in production");
}

// Single source of truth for configuration; nothing else should read process.env.
export const config = {
  nodeEnv,
  isProduction,
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  runPipelineOnStart: process.env.RUN_PIPELINE_ON_START === "true",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    username: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "1234",
    database: process.env.DB_NAME || "",
    synchronize: process.env.DB_SYNC
      ? process.env.DB_SYNC === "true"
      : !isProduction,
  },
  jwt: {
    secret: tokenSecret || "dev-only-secret",
    expiresIn: "1h",
  },
  mail: {
    user: process.env.SENDERMAIL || "",
    pass: process.env.SENDERPASS || "",
  },
  newsApiKey: process.env.NEWS_API_KEY || "",
  huggingFaceToken: process.env.ACCESS_TOKEN || "",
} as const;
