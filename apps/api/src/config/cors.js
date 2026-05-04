const configuredOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set(configuredOrigins);

// Allow Railway preview/prod web domains without manual env edits on every domain rotation.
const railwayDomainPattern = /^https:\/\/[a-z0-9-]+\.up\.railway\.app$/i;

export const isAllowedOrigin = (origin) => {
  // Non-browser requests (curl, server-to-server) may not send Origin.
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  if (railwayDomainPattern.test(origin)) return true;
  return false;
};

export const corsOriginValidator = (origin, callback) => {
  if (isAllowedOrigin(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`CORS blocked for origin: ${origin}`));
};
