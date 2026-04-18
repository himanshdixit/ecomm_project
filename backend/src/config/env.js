import dotenv from "dotenv";

dotenv.config();

const normalizeOrigins = (value) =>
  String(value || "http://localhost:3000")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const clientUrls = normalizeOrigins(process.env.CLIENT_URL);

export const config = Object.freeze({
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: (process.env.NODE_ENV || "development") === "production",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/Codex_ecomm_db",
  dbName: process.env.DB_NAME || "Codex_ecomm_db",
  jwtSecret: process.env.JWT_SECRET || "replace_with_a_strong_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrls,
  clientUrl: clientUrls[0],
  requestBodyLimit: process.env.REQUEST_BODY_LIMIT || "1mb",
});

if (config.isProduction && config.jwtSecret === "replace_with_a_strong_secret") {
  throw new Error("JWT_SECRET must be configured with a secure value in production.");
}
