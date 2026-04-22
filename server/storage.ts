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
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getUserByTelegramId(telegramUserId: string): Promise<User | null>;
  createOrUpdateUser(telegramUserId: string, isVip?: boolean): Promise<User>;

  getUserStats(telegramUserId: string): Promise<UserStats | null>;
  createUserStatsIfNotExists(telegramUserId: string): Promise<void>;

  addWin(telegramUserId: string): Promise<void>;
  getWinsCount(telegramUserId: string): Promise<number>;

  addAttempt(telegramUserId: string): Promise<void>;
  getAttemptsCount(telegramUserId: string): Promise<number>;
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

  async addWin(telegramUserId: string): Promise<void> {
    await this.createOrUpdateUser(telegramUserId);

    await db
      .insert(wins)
      .values({
        telegramUserId,
        winsCount: 1,
        lastWinAt: new Date(),
      })
      .onConflictDoUpdate({
        target: wins.telegramUserId,
        set: {
          winsCount: sql`${wins.winsCount} + 1`,
          lastWinAt: new Date(),
        },
      });
  }

  async getWinsCount(telegramUserId: string): Promise<number> {
    const [row] = await db
      .select()
      .from(wins)
      .where(eq(wins.telegramUserId, telegramUserId))
      .limit(1);

    return row?.winsCount ?? 0;
  }

  // ================= ATTEMPTS =================

  async addAttempt(telegramUserId: string): Promise<void> {
    await this.createOrUpdateUser(telegramUserId);

    await db
      .insert(attempts)
      .values({
        telegramUserId,
        attemptsCount: 1,
      })
      .onConflictDoUpdate({
        target: attempts.telegramUserId,
        set: {
          attemptsCount: sql`${attempts.attemptsCount} + 1`,
        },
      });
  }

  async getAttemptsCount(telegramUserId: string): Promise<number> {
    const [row] = await db
      .select()
      .from(attempts)
      .where(eq(attempts.telegramUserId, telegramUserId))
      .limit(1);

    return row?.attemptsCount ?? 0;
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