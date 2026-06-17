const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const normalizeUrl = (url) => url.replace(/\/api\/?$/, "").replace(/\/$/, "");

export const API_BASE_URL = normalizeUrl(rawApiUrl);
export const SOCKET_URL = normalizeUrl(process.env.NEXT_PUBLIC_SOCKET_URL || rawApiUrl || "http://localhost:5000");

