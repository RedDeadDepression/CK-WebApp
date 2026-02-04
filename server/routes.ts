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

  app.get(api.user.me.path, async (req, res) => {
    try {
      // Get telegram_user_id from query parameter
      const telegramUserId = req.query.telegram_user_id as string;
      
      if (!telegramUserId) {
        return res.status(400).json({
          message: "telegram_user_id is required",
        });
      }

      // Get or create user
      let user = await storage.getUserByTelegramId(telegramUserId);
      
      if (!user) {
        // Create new user if doesn't exist
        user = await storage.createOrUpdateUser(telegramUserId, false);
      }

      res.status(200).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  return httpServer;
}
