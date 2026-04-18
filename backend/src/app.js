import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";

import { config } from "./config/env.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { notFound } from "./middleware/notFoundMiddleware.js";
import apiRoutes from "./routes/index.js";
import { apiResponse } from "./utils/apiResponse.js";
import { uploadsDirectory } from "./utils/uploadStorage.js";

const app = express();

const corsOptions = {
  origin(origin, callback) {
    if (!origin || config.clientUrls.includes(origin)) {
      callback(null, true);
      return;
    }

    const corsError = new Error("Origin not allowed by CORS.");
    corsError.statusCode = 403;
    callback(corsError);
  },
  credentials: true,
};

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(cors(corsOptions));
app.use(express.json({ limit: config.requestBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: config.requestBodyLimit }));
app.use(cookieParser());
app.use(morgan(config.isProduction ? "combined" : "dev"));
app.use("/uploads", express.static(uploadsDirectory, { maxAge: config.isProduction ? "7d" : 0 }));

app.get("/", (req, res) => {
  res.json(
    apiResponse({
      message: "Codex Commerce API is running",
      data: {
        env: config.nodeEnv,
        version: "v1",
      },
    })
  );
});

app.get("/health", (req, res) => {
  res.status(200).json(
    apiResponse({
      message: "Service healthy",
      data: {
        status: "ok",
        uptime: Number(process.uptime().toFixed(2)),
        timestamp: new Date().toISOString(),
        env: config.nodeEnv,
      },
    })
  );
});

app.use("/api/v1", apiRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
