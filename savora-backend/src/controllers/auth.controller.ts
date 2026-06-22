import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { config } from "../config/app";
import { BadRequestError, ConflictError, UnauthorizedError } from "../errors/AppError";
import { asyncHandler } from "../errors/errorHandler";
import { RegisterInput, LoginInput, AuthTokens } from "../types";

const generateToken = (user: { id: string; email: string; role: string }): string => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

const formatUserResponse = (user: { id: string; email: string; name: string; role: string }) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, phone } = req.body as RegisterInput;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ConflictError("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, config.bcrypt.rounds);
  const role = email === "skaasim47@gmail.com" ? "ADMIN" : "CUSTOMER";

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phone,
      role: role as "ADMIN" | "CUSTOMER",
    },
  });

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: "Registered successfully",
    data: { token, user: formatUserResponse(user) } as AuthTokens,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const token = generateToken(user);

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: { token, user: formatUserResponse(user) } as AuthTokens,
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!(req as any).user) {
    throw new UnauthorizedError("Not authenticated");
  }

  res.status(200).json({
    success: true,
    data: formatUserResponse((req as any).user),
  });
});