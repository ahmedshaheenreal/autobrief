import express from "express";
import { authRouter } from "./routes/auth.routes";
import { preferencesRouter } from "./routes/preferences.routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

/** Builds the Express app without starting a server or connecting to the DB. */
export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/", (req, res) => {
    res.send("Hello, World!");
  });
  app.use("/api", authRouter);
  app.use("/api/userpreferences", preferencesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};
