import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { config } from "../config/app";
import { UnauthorizedError } from "../errors/AppError";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or invalid token");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId?: string;
      sub?: string;
      email: string;
      role: string;
    };

    if (!decoded.email) {
      throw new UnauthorizedError("No email in token");
    }

    const userId = decoded.userId || decoded.sub;
    if (!userId) {
      throw new UnauthorizedError("Invalid token format (missing user ID)");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    (req as any).user = user;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      next(new UnauthorizedError("Token expired or invalid"));
    } else {
      next(error);
    }
  }
};

export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId?: string;
      sub?: string;
      email: string;
    };

    const userId = decoded.userId || decoded.sub;
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) (req as any).user = user;
    }
    next();
  } catch {
    next();
  }
};