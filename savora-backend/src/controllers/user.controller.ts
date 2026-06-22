import { Request, Response } from "express";
import * as UserService from "../services/user.service";

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    res.json(user);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const updateMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, phone } = req.body;
    const updatedUser = await UserService.updateUser(userId, { name, phone });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserService.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await UserService.getUserById(req.params.id as string);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json(error);
  }
};
