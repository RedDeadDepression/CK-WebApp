import { db } from "./db";
import {
  wins,
  attempts,
  users,
  type Win,
  type Attempt,
  type User,
} from "@shared/schema";
import { eq, desc, count } from "drizzle-orm";

export interface IStorage {
  createWin(data: { telegramUserId: string }): Promise<Win>;

  createAttempt(telegramUserId: string): Promise<Attempt>;

  getWinsByTelegramId(telegramUserId: string): Promise<Win[]>;
  getAttemptsByTelegramId(telegramUserId: string): Promise<Attempt[]>;

  countWins(telegramUserId: string): Promise<number>;
  countAttempts(telegramUserId: string): Promise<number>;

  getUserByTelegramId(telegramUserId: string): Promise<User | null>;
  createOrUpdateUser(
    telegramUserId: string,
    isVip?: boolean
  ): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // ================= USERS =================

  async getUserByTelegramId(
    telegramUserId: string
  ): Promise<User | null> {
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
    const existing = await this.getUserByTelegramId(
      telegramUserId
    );

    if (existing) {
      if (isVip !== undefined) {
        const [updated] = await db
          .update(users)
          .set({
            isVip,
            updatedAt: new Date(),
          })
          .where(eq(users.telegramUserId, telegramUserId))
          .returning();

        return updated;
      }
      return existing;
    }

    const [newUser] = await db
      .insert(users)
      .values({
        telegramUserId,
        isVip: isVip ?? false,
      })
      .returning();

    return newUser;
  }

  // ================= WINS =================

  async createWin(data: { telegramUserId: string }): Promise<Win> {
    await this.createOrUpdateUser(data.telegramUserId);

    const [win] = await db
      .insert(wins)
      .values({
        telegramUserId: data.telegramUserId,
      })
      .returning();

    return win;
  }

  async getWinsByTelegramId(
    telegramUserId: string
  ): Promise<Win[]> {
    return await db
      .select()
      .from(wins)
      .where(eq(wins.telegramUserId, telegramUserId))
      .orderBy(desc(wins.createdAt));
  }

  async countWins(telegramUserId: string): Promise<number> {
    const [result] = await db
      .select({ value: count() })
      .from(wins)
      .where(eq(wins.telegramUserId, telegramUserId));

    return result?.value ?? 0;
  }

  // ================= ATTEMPTS =================

  async createAttempt(
    telegramUserId: string
  ): Promise<Attempt> {
    await this.createOrUpdateUser(telegramUserId);

    const [attempt] = await db
      .insert(attempts)
      .values({
        telegramUserId,
      })
      .returning();

    return attempt;
  }

  async getAttemptsByTelegramId(
    telegramUserId: string
  ): Promise<Attempt[]> {
    return await db
      .select()
      .from(attempts)
      .where(eq(attempts.telegramUserId, telegramUserId))
      .orderBy(desc(attempts.createdAt));
  }

  async countAttempts(
    telegramUserId: string
  ): Promise<number> {
    const [result] = await db
      .select({ value: count() })
      .from(attempts)
      .where(eq(attempts.telegramUserId, telegramUserId));

    return result?.value ?? 0;
  }
}

export const storage = new DatabaseStorage();