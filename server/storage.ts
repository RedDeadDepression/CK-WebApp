import { db } from "./db";
import { wins, users, type Win, type InsertWin, type User, type InsertUser } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  createWin(win: InsertWin): Promise<Win>;
  getWins(): Promise<Win[]>;
  getUserByTelegramId(telegramUserId: string): Promise<User | null>;
  createOrUpdateUser(telegramUserId: string, isVip?: boolean): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async createWin(insertWin: InsertWin): Promise<Win> {
    const [win] = await db.insert(wins).values(insertWin).returning();
    return win;
  }

  async getWins(): Promise<Win[]> {
    return await db.select().from(wins);
  }

  async getUserByTelegramId(telegramUserId: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.telegramUserId, telegramUserId)).limit(1);
    return user || null;
  }

  async createOrUpdateUser(telegramUserId: string, isVip?: boolean): Promise<User> {
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
