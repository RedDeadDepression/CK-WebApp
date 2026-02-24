import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
  integer,
  real
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/* ================= USERS ================= */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  telegramUserId: text("telegram_user_id").unique().notNull(),

  fullName: text("full_name"),
  username: text("username"),

  dailyCost: real("daily_cost"),

  smokeFreeStartedAt: timestamp("smoke_free_started_at"),

  isVip: boolean("is_vip").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

/* ================= USER STATS ================= */

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),

  telegramUserId: text("telegram_user_id")
    .notNull()
    .references(() => users.telegramUserId, { onDelete: "cascade" })
    .unique(),

  answerId01: integer("answer_id01"),
  answerId02: integer("answer_id02"),
  answerId03: integer("answer_id03"),
  answerId04: integer("answer_id04"),

  onboardingCompleted: boolean("onboarding_completed")
    .default(false)
    .notNull(),

  surveyCompleted: boolean("survey_completed")
    .default(false)
    .notNull(),
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
});

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;

/* ================= WINS ================= */

export const wins = pgTable("wins", {
  id: serial("id").primaryKey(),

  telegramUserId: text("telegram_user_id")
    .notNull()
    .references(() => users.telegramUserId, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWinSchema = createInsertSchema(wins).omit({
  id: true,
  createdAt: true,
});

export type Win = typeof wins.$inferSelect;
export type InsertWin = z.infer<typeof insertWinSchema>;