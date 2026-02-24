import { db } from "./db";
import {
  wins,
  users,
  type Win,
  type User,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createWin(data: { telegramUserId: string }): Promise<Win>;
  getWinsByTelegramId(telegramUserId: string): Promise<Win[]>;
  getUserByTelegramId(telegramUserId: string): Promise<User | null>;
  createOrUpdateUser(
    telegramUserId: string,
    isVip?: boolean
  ): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // ================= WINS =================

  async createWin(data: { telegramUserId: string }): Promise<Win> {
    // Создаём пользователя если его нет
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
}

export const storage = new DatabaseStorage();