import { db } from "./db";
import { wins, type Win, type InsertWin } from "@shared/schema";

export interface IStorage {
  createWin(win: InsertWin): Promise<Win>;
  getWins(): Promise<Win[]>;
}

export class DatabaseStorage implements IStorage {
  async createWin(insertWin: InsertWin): Promise<Win> {
    const [win] = await db.insert(wins).values(insertWin).returning();
    return win;
  }

  async getWins(): Promise<Win[]> {
    return await db.select().from(wins);
  }
}

export const storage = new DatabaseStorage();
