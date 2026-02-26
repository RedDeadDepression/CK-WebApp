import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  numeric
} from "drizzle-orm/pg-core";

/* ================= USERS ================= */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegramUserId: text("telegram_user_id").notNull().unique(),

  fullName: text("full_name"),
  username: text("username"),

  dailyCost: numeric("daily_cost"),

  isVip: boolean("is_vip").default(false),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ================= WINS ================= */

export const wins = pgTable("wins", {
  id: serial("id").primaryKey(),
  telegramUserId: text("telegram_user_id").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});

/* ================= ATTEMPTS ================= */

export const attempts = pgTable("attempts", {
  id: serial("id").primaryKey(),
  telegramUserId: text("telegram_user_id").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});

/* ================= TYPES ================= */

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Win = typeof wins.$inferSelect;
export type InsertWin = typeof wins.$inferInsert;

export type Attempt = typeof attempts.$inferSelect;
export type InsertAttempt = typeof attempts.$inferInsert;