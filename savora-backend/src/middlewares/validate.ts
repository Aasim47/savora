import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";
import { ValidationError } from "../errors/AppError";

export const validate = (schema: ZodType<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        const issues = error.issues || (error as any).errors || [];
        issues.forEach((e: any) => {
          const path = e.path.join(".");
          if (!errors[path]) errors[path] = [];
          errors[path].push(e.message);
        });
        next(new ValidationError(errors));
      } else {
        next(error);
      }
    }
  };
};