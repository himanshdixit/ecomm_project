import dotenv from "dotenv";

dotenv.config();

const trimTrailingSlash = (value) => String(value || "").trim().replace(/\/+$/, "");

const normalizeOrigin = (value) => {
  const trimmedValue = trimTrailingSlash(value);

  if (!trimmedValue) {
    return "";
  }

  try {
    return new URL(trimmedValue).origin;
  } catch {
    return trimmedValue;
  }
};

const normalizeOrigins = (value, fallback = "http://localhost:3000") =>
  String(value || fallback)
    .split(",")
    .map((entry) => normalizeOrigin(entry))
    .filter(Boolean);

const escapeRegex = (value) => value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");

const createOriginMatcher = (pattern) => {
  const normalizedPattern = trimTrailingSlash(pattern);

  if (!normalizedPattern) {
    return null;
  }

  if (!normalizedPattern.includes("*")) {
    const normalizedExactOrigin = normalizeOrigin(normalizedPattern);
    return (origin) => normalizeOrigin(origin) === normalizedExactOrigin;
  }

  const regexPattern = `^${normalizedPattern.split("*").map(escapeRegex).join(".*")}$`;
  const matcher = new RegExp(regexPattern, "i");

  return (origin) => matcher.test(normalizeOrigin(origin));
};

const clientUrls = normalizeOrigins(process.env.CLIENT_URL);
const clientOriginPatterns = normalizeOrigins(process.env.CLIENT_URL_PATTERNS, "")
  .map((pattern) => createOriginMatcher(pattern))
  .filter(Boolean);

const isAllowedClientOrigin = (origin) => {
  const normalizedOrigin = normalizeOrigin(origin);

  if (!normalizedOrigin) {
    return false;
  }

  if (clientUrls.includes(normalizedOrigin)) {
    return true;
  }

  return clientOriginPatterns.some((matcher) => matcher(normalizedOrigin));
};

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
  clientOriginPatterns,
  isAllowedClientOrigin,
  requestBodyLimit: process.env.REQUEST_BODY_LIMIT || "1mb",
  authCookieSameSite: process.env.AUTH_COOKIE_SAME_SITE || ((process.env.NODE_ENV || "development") === "production" ? "none" : "lax"),
  authCookieSecure:
    process.env.AUTH_COOKIE_SECURE !== undefined
      ? String(process.env.AUTH_COOKIE_SECURE).trim().toLowerCase() === "true"
      : (process.env.NODE_ENV || "development") === "production",
});

if (config.isProduction && config.jwtSecret === "replace_with_a_strong_secret") {
  throw new Error("JWT_SECRET must be configured with a secure value in production.");
}

if (config.authCookieSameSite === "none" && !config.authCookieSecure) {
  throw new Error("AUTH_COOKIE_SECURE must be true when AUTH_COOKIE_SAME_SITE is set to 'none'.");
}
