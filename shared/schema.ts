import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  real,
} from "drizzle-orm/pg-core";

/* ================= USERS ================= */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegramUserId: text("telegram_user_id").notNull().unique(),
  fullName: text("full_name"),
  username: text("username"),
  dailyCost: real("daily_cost"),
  smokeFreeStartedAt: timestamp("smoke_free_started_at"),
  isVip: boolean("is_vip").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* ================= WINS ================= */

export const wins = pgTable("wins", {
  telegramUserId: text("telegram_user_id").primaryKey(),

  winsCount: integer("wins_count").default(0).notNull(),

  lastWinAt: timestamp("last_win_at"),
});

/* ================= ATTEMPTS ================= */

export const attempts = pgTable("attempts", {
  telegramUserId: text("telegram_user_id").primaryKey(),

  attemptsCount: integer("attempts_count").default(0).notNull(),
});

/* ================= USER STATS ================= */

export const userStats = pgTable("user_stats", {
  telegramUserId: text("telegram_user_id").primaryKey(),

  answer_id01: integer("answer_id01"),
  answer_id02: integer("answer_id02"),
  answer_id03: integer("answer_id03"),
  answer_id04: integer("answer_id04"),

  surveyCompleted: boolean("survey_completed").default(false),
  onboardingCompleted: boolean("onboarding_completed").default(false),
});

/* ================= TYPES ================= */

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Win = typeof wins.$inferSelect;
export type InsertWin = typeof wins.$inferInsert;

export type Attempt = typeof attempts.$inferSelect;
export type InsertAttempt = typeof attempts.$inferInsert;

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = typeof userStats.$inferInsert;