import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ================= CREATE WIN =================

  app.post(api.wins.create.path, async (req, res) => {
    try {
      const telegramUserId = req.body.telegramUserId;

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
      throw err;
    }
  });

  // ================= CREATE ATTEMPT =================

  app.post("/api/attempts", async (req, res) => {
    const telegramUserId = req.body.telegramUserId;

    if (!telegramUserId) {
      return res.status(400).json({
        message: "telegramUserId is required",
      });
    }

    const attempt = await storage.createAttempt(telegramUserId);

    res.status(201).json(attempt);
  });

  // ================= USER STATS =================

  app.get("/api/stats/:telegramUserId", async (req, res) => {
    const { telegramUserId } = req.params;

    const wins = await storage.countWins(telegramUserId);
    const attempts = await storage.countAttempts(telegramUserId);

    res.json({
      wins,
      attempts,
    });
  });

  // ================= USER =================

  app.get(api.user.me.path, async (req, res) => {
    const telegramUserId = req.query.telegram_user_id as string;

    if (!telegramUserId) {
      return res.status(400).json({
        message: "telegram_user_id is required",
      });
    }

    let user = await storage.getUserByTelegramId(telegramUserId);

    if (!user) {
      user = await storage.createOrUpdateUser(telegramUserId);
    }

    res.status(200).json(user);
  });

  return httpServer;
}