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

  /* ================= STATS ================= */

app.get("/api/stats/:telegramUserId", async (req, res) => {
  const { telegramUserId } = req.params;

  const wins = await storage.getWinsCount(telegramUserId);
  const attempts = await storage.getAttemptsCount(telegramUserId);

  const user = await storage.getUserByTelegramId(telegramUserId);

  res.json({
    wins,
    attempts,
    dailyCost: user?.dailyCost ?? null,
  });
});

  /* ================= WINS ================= */

  // ➕ добавить win (увеличить счётчик)
  app.post("/api/wins", async (req, res) => {
    const { telegramUserId } = req.body;

    if (!telegramUserId) {
      return res.status(400).json({ message: "telegramUserId required" });
    }

    await storage.addWin(telegramUserId);

    res.status(200).json({ success: true });
  });

  // 📊 получить wins
  app.get("/api/wins/:telegramUserId", async (req, res) => {
    const { telegramUserId } = req.params;

    const wins = await storage.getWinsCount(telegramUserId);

    res.json({ wins });
  });

  /* ================= ATTEMPTS ================= */

  // ➕ добавить попытку
  app.post("/api/attempts", async (req, res) => {
    const { telegramUserId } = req.body;

    if (!telegramUserId) {
      return res.status(400).json({ message: "telegramUserId required" });
    }

    await storage.addAttempt(telegramUserId);

    res.status(200).json({ success: true });
  });

  // 📊 получить attempts
  app.get("/api/attempts/:telegramUserId", async (req, res) => {
    const { telegramUserId } = req.params;

    const attempts = await storage.getAttemptsCount(telegramUserId);

    res.json({ attempts });
  });
}
