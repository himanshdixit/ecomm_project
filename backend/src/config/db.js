import mongoose from "mongoose";

import { config } from "./env.js";

mongoose.set("strictQuery", true);

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const connection = await mongoose.connect(config.mongoUri, {
    dbName: config.dbName,
  });

  console.log(`MongoDB connected: ${connection.connection.host}/${config.dbName}`);
  return connection.connection;
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
};
