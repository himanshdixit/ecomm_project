import { connectDB, disconnectDB } from "./config/db.js";
import { config } from "./config/env.js";
import app from "./app.js";

let server;
let isShuttingDown = false;

const shutdown = async (signal, exitCode = 0) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`${signal} received. Shutting down gracefully...`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }

    await disconnectDB();
    process.exit(exitCode);
  } catch (error) {
    console.error("Graceful shutdown failed", error);
    process.exit(1);
  }
};

const startServer = async () => {
  await connectDB();

  server = app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
  });
};

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection", reason);
  shutdown("unhandledRejection", 1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception", error);
  shutdown("uncaughtException", 1);
});

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
