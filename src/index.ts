import { config } from "./config/env";
import AppDataSource from "./db/dbconfig";
import { createApp } from "./app";
import { runDailyPipeline } from "./services/pipeline";

async function main() {
  await AppDataSource.initialize();
  console.log("Data Source has been initialized!");

  if (config.runPipelineOnStart) {
    runDailyPipeline()
      .then((result) => console.log("Daily pipeline finished:", result))
      .catch((err) => console.error("Daily pipeline failed:", err));
  }

  createApp().listen(config.port, () => {
    console.log(`Server is running on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
