import { Request, Response } from "express";
import * as DashboardService from "../services/dashboard.service";

export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await DashboardService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json(error);
  }
};
