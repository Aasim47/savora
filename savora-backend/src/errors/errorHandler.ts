import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError, ValidationError } from "./AppError";
import { config } from "../config/app";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    error: err.message,
    stack: config.nodeEnv === "development" ? err.stack : undefined,
  });

  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    const issues = err.issues || (err as any).errors || [];
    issues.forEach((e: any) => {
      const path = e.path.join(".");
      if (!errors[path]) errors[path] = [];
      errors[path].push(e.message);
    });
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[])?.join(", ") || "field";
      return res.status(409).json({
        success: false,
        message: `A record with this ${target} already exists`,
        code: "DUPLICATE_ENTRY",
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Record not found",
        code: "NOT_FOUND",
      });
    }
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      errors: err.errors,
      details: config.nodeEnv === "development" ? err.stack : undefined,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
    details: config.nodeEnv === "development" ? err.stack : undefined,
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    code: "ROUTE_NOT_FOUND",
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};