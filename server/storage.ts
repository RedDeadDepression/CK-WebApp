import { db } from "./db";
import {
  wins,
  users,
  attempts,
  userStats,
  type Win,
  type InsertWin,
  type User,
  type InsertUser,
  type Attempt,
  type InsertAttempt,
  type UserStats
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  createWin(win: InsertWin): Promise<Win>;
  getWins(): Promise<Win[]>;
  getWinsByTelegramId(telegramUserId: string): Promise<Win[]>;

  createAttempt(attempt: InsertAttempt): Promise<Attempt>;
  getAttemptsByTelegramId(telegramUserId: string): Promise<Attempt[]>;

  getUserByTelegramId(telegramUserId: string): Promise<User | null>;
  createOrUpdateUser(telegramUserId: string, isVip?: boolean): Promise<User>;

  getUserStats(telegramUserId: string): Promise<UserStats | null>;
  createUserStatsIfNotExists(telegramUserId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {

  // ================= USERS =================

  async getUserByTelegramId(telegramUserId: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.telegramUserId, telegramUserId))
      .limit(1);

    return user || null;
  }

  async createOrUpdateUser(
    telegramUserId: string,
    isVip?: boolean
  ): Promise<User> {
    const existing = await this.getUserByTelegramId(telegramUserId);

    if (existing) {
      if (isVip !== undefined) {
        const [updated] = await db
          .update(users)
          .set({ isVip, updatedAt: new Date() })
          .where(eq(users.telegramUserId, telegramUserId))
          .returning();
        return updated;
      }
      return existing;
    }

    const [newUser] = await db
      .insert(users)
      .values({ telegramUserId, isVip: isVip ?? false })
      .returning();

    await this.createUserStatsIfNotExists(telegramUserId);

    return newUser;
  }

  // ================= WINS =================

  async createWin(insertWin: InsertWin): Promise<Win> {
    const [win] = await db.insert(wins).values(insertWin).returning();
    return win;
  }

  async getWins(): Promise<Win[]> {
    return await db.select().from(wins);
  }

  async getWinsByTelegramId(telegramUserId: string): Promise<Win[]> {
    return await db
      .select()
      .from(wins)
      .where(eq(wins.telegramUserId, telegramUserId));
  }

  // ================= ATTEMPTS =================

  async createAttempt(insertAttempt: InsertAttempt): Promise<Attempt> {
    const [attempt] = await db.insert(attempts).values(insertAttempt).returning();
    return attempt;
  }

  async getAttemptsByTelegramId(telegramUserId: string): Promise<Attempt[]> {
    return await db
      .select()
      .from(attempts)
      .where(eq(attempts.telegramUserId, telegramUserId));
  }

  async countAttempts(telegramUserId: string): Promise<number> {
    const rows = await db
      .select()
      .from(attempts)
      .where(eq(attempts.telegramUserId, telegramUserId));

    return rows.length;
  }

  // ================= USER STATS =================

  async getUserStats(telegramUserId: string): Promise<UserStats | null> {
    const [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.telegramUserId, telegramUserId))
      .limit(1);

    return stats || null;
  }

  async createUserStatsIfNotExists(telegramUserId: string): Promise<void> {
    const existing = await this.getUserStats(telegramUserId);

    if (!existing) {
      await db.insert(userStats).values({ telegramUserId });
    }
  }
}

export const storage = new DatabaseStorage();