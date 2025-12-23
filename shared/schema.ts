import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
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
