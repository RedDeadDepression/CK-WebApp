import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const wins = pgTable("wins", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWinSchema = createInsertSchema(wins).omit({ 
  id: true, 
  createdAt: true 
});

export type Win = typeof wins.$inferSelect;
export type InsertWin = z.infer<typeof insertWinSchema>;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegramUserId: text("telegram_user_id").unique().notNull(),
  isVip: boolean("is_vip").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true 
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
