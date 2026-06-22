const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("CRITICAL ERROR: JWT_SECRET environment variable is missing.");
}

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  jwt: {
    secret: jwtSecret,
    expiresIn: "7d",
  },
  bcrypt: {
    rounds: 10,
  },
  delivery: {
    freeKm: 2,
    feePerKm: 10,
  },
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
  },
  imgbb: {
    apiKey: process.env.IMGBB_API_KEY,
  },
} as const;

export type Config = typeof config;