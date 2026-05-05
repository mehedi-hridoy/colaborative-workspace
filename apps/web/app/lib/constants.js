const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const API_BASE_URL = rawApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
