import rateLimit from "express-rate-limit";

// Strict limiter for authentication routes (login, register)
// Max 5 requests per 15 minutes per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many attempts, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Standard limiter for all other API endpoints
// Max 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
