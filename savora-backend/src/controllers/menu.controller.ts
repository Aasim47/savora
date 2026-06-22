import { Request, Response } from "express";
import * as MenuService from "../services/menu.service";

import { uploadToImgBB } from "../utils/imgbb";

export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    delete data.image;
    if (data.price) data.price = parseFloat(data.price);
    
    if (req.file) {
      const imageUrl = await uploadToImgBB(req.file.buffer, req.file.originalname);
      data.imageUrl = imageUrl;
    }
    const menuItem = await MenuService.createMenuItem(data);
    res.status(201).json(menuItem);
  } catch (error) {
    console.error("Create Menu Item Error:", error);
    res.status(500).json(error);
  }
};

export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const menuItems = await MenuService.getMenuItems();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (data.price) data.price = parseFloat(data.price);
    if (data.available !== undefined) {
      data.available = data.available === 'true' || data.available === true;
    }
    
    if (req.file) {
      const imageUrl = await uploadToImgBB(req.file.buffer, req.file.originalname);
      data.imageUrl = imageUrl;
    }
    const menuItem = await MenuService.updateMenuItem(req.params.id as string, data);
    res.json(menuItem);
  } catch (error) {
    console.error("Update Menu Item Error:", error);
    res.status(500).json(error);
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    await MenuService.deleteMenuItem(req.params.id as string);
    res.status(204).send();
  } catch (error: any) {
    if (error.message && error.message.includes("existing orders")) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json(error);
  }
};
