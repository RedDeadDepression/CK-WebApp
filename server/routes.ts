import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ================= WINS =================

  app.post(api.wins.create.path, async (req, res) => {
    try {
      const { telegramUserId } = req.body;

      if (!telegramUserId) {
        return res.status(400).json({
          message: "telegramUserId is required",
        });
      }

      const win = await storage.createWin({ telegramUserId });

      res.status(201).json(win);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.wins.listByUser.path, async (req, res) => {
    try {
      const telegramUserId = req.params.telegramUserId;

      if (!telegramUserId) {
        return res.status(400).json({
          message: "telegramUserId is required",
        });
      }

      const wins = await storage.getWinsByTelegramId(telegramUserId);

      res.status(200).json(wins);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ================= USER =================

  app.get(api.user.me.path, async (req, res) => {
    try {
      const telegramUserId = req.query.telegram_user_id as string;

      if (!telegramUserId) {
        return res.status(400).json({
          message: "telegram_user_id is required",
        });
      }

      let user = await storage.getUserByTelegramId(telegramUserId);

      if (!user) {
        user = await storage.createOrUpdateUser(telegramUserId, false);
      }

      res.status(200).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}