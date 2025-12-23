import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.wins.create.path, async (req, res) => {
    try {
      const win = await storage.createWin({});
      res.status(201).json(win);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
            message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.get(api.wins.list.path, async (req, res) => {
    const wins = await storage.getWins();
    res.json(wins);
  });

  return httpServer;
}
