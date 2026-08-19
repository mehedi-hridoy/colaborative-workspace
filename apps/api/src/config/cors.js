const configuredOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set(configuredOrigins);

const localhostPattern = /^https?:\/\/localhost(?::\d+)?$/i;
const vercelDomainPattern = /^https:\/\/([a-z0-9-]+\.)*vercel\.app$/i;
const renderDomainPattern = /^https:\/\/([a-z0-9-]+\.)*onrender\.com$/i;

export const isAllowedOrigin = (origin) => {
  // Non-browser requests (curl, server-to-server) may not send Origin.
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  if (localhostPattern.test(origin)) return true;
  if (vercelDomainPattern.test(origin)) return true;
  if (renderDomainPattern.test(origin)) return true;
  return false;
};

export const corsOriginValidator = (origin, callback) => {
  if (isAllowedOrigin(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`CORS blocked for origin: ${origin}`));
};
