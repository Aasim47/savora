import { Request, Response } from "express";
import * as CategoryService from "../services/category.service";

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await CategoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await CategoryService.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json(error);
  }
};
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await CategoryService.deleteCategory(req.params.id as string);
    res.status(204).send();
  } catch (error: any) {
    if (error.message && error.message.includes("existing orders")) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json(error);
  }
};
