import { db } from "./db";
import {
  wins,
  users,
  attempts,
  type Win,
  type InsertWin,
  type Attempt,
  type InsertAttempt,
  type User,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  createWin(win: InsertWin): Promise<Win>;
  getWinsByTelegramId(telegramUserId: string): Promise<Win[]>;

  createAttempt(attempt: InsertAttempt): Promise<Attempt>;
  countAttempts(telegramUserId: string): Promise<number>;

  getUserByTelegramId(telegramUserId: string): Promise<User | null>;
  createOrUpdateUser(telegramUserId: string, isVip?: boolean): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async createWin(insertWin: InsertWin): Promise<Win> {
    const [win] = await db.insert(wins).values(insertWin).returning();
    return win;
  }

  async getWinsByTelegramId(telegramUserId: string): Promise<Win[]> {
    return await db
      .select()
      .from(wins)
      .where(eq(wins.telegramUserId, telegramUserId));
  }

  async createAttempt(insertAttempt: InsertAttempt): Promise<Attempt> {
    const [attempt] = await db.insert(attempts).values(insertAttempt).returning();
    return attempt;
  }

  async countAttempts(telegramUserId: string): Promise<number> {
    const result = await db
      .select()
      .from(attempts)
      .where(eq(attempts.telegramUserId, telegramUserId));

    return result.length;
  }

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

    return newUser;
  }
}

export const storage = new DatabaseStorage();