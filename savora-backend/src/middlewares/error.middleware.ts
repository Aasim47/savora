import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      code: err.code,
      message: err.message,
      errors: err.errors,
    });
  }

  // Handle generic JWT errors if they slip through
  if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "error",
      code: "UNAUTHORIZED",
      message: "Token expired or invalid",
    });
  }

  console.error("🔥 UNHANDLED SERVER ERROR:", err);

  return res.status(500).json({
    status: "error",
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  });
};
