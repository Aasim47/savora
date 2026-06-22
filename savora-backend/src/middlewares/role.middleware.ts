import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { ForbiddenError } from "../errors/AppError";

export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user) {
      throw new ForbiddenError("Authentication required");
    }

    if (!roles.includes((req as any).user.role)) {
      throw new ForbiddenError(`Requires one of: ${roles.join(", ")}`);
    }

    next();
  };
};

export const requireAdmin = requireRole("ADMIN");
export const requireCustomer = requireRole("CUSTOMER");