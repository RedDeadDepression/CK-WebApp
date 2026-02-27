import type { Express } from "express";
import { storage } from "./storage";

export function registerRoutes(app: Express) {

  /* ================= USER ================= */

  app.get("/api/me", async (req, res) => {
    const telegramUserId = String(req.query.telegram_user_id || "");

    if (!telegramUserId) {
      return res.status(400).json({ message: "telegram_user_id required" });
    }

    const user = await storage.createOrUpdateUser(telegramUserId);
    res.json(user);
  });

  /* ================= WINS ================= */

  app.post("/api/wins", async (req, res) => {
    const { telegramUserId } = req.body;

    if (!telegramUserId) {
      return res.status(400).json({ message: "telegramUserId required" });
    }

    const win = await storage.createWin({ telegramUserId });
    res.status(201).json(win);
  });

  app.get("/api/wins/:telegramUserId", async (req, res) => {
    const { telegramUserId } = req.params;
    const wins = await storage.getWinsByTelegramId(telegramUserId);
    res.json(wins);
  });

  /* ================= ATTEMPTS ================= */

  app.post("/api/attempts", async (req, res) => {
    const { telegramUserId } = req.body;

    if (!telegramUserId) {
      return res.status(400).json({ message: "telegramUserId required" });
    }

    const attempt = await storage.createAttempt({ telegramUserId });
    res.status(201).json(attempt);
  });

  app.get("/api/attempts/:telegramUserId", async (req, res) => {
    const { telegramUserId } = req.params;
    const count = await storage.countAttempts(telegramUserId);
    res.json({ attempts: count });
  });
}