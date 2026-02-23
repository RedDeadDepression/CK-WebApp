import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
  integer,
  bigint,
  real
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ================= USERS ================= */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  telegramUserId: bigint("telegram_user_id", { mode: "number" })
    .unique()
    .notNull(),

  fullName: text("full_name"),
  username: text("username"),

  joinedAt: timestamp("joined_at").defaultNow(),

  dailyCost: real("daily_cost"),
  smokeFreeStartedAt: timestamp("smoke_free_started_at"),

  isVip: boolean("is_vip").default(false).notNull(),
});

/* ================= USER STATS ================= */

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),

  telegramUserId: bigint("telegram_user_id", { mode: "number" })
    .unique()
    .notNull()
    .references(() => users.telegramUserId, {
      onDelete: "cascade",
    }),

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

/* ================= WINS ================= */

export const wins = pgTable("wins", {
  id: serial("id").primaryKey(),

  telegramUserId: bigint("telegram_user_id", { mode: "number" })
    .notNull()
    .references(() => users.telegramUserId, {
      onDelete: "cascade",
    }),

  createdAt: timestamp("created_at").defaultNow(),
});

/* ================= QUESTIONS ================= */

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  questionText: text("question_text").unique().notNull(),
});

/* ================= RELATIONS ================= */

export const usersRelations = relations(users, ({ one, many }) => ({
  stats: one(userStats, {
    fields: [users.telegramUserId],
    references: [userStats.telegramUserId],
  }),
  wins: many(wins),
}));

export const winsRelations = relations(wins, ({ one }) => ({
  user: one(users, {
    fields: [wins.telegramUserId],
    references: [users.telegramUserId],
  }),
}));

/* ================= TYPES ================= */

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = typeof userStats.$inferInsert;

export type Win = typeof wins.$inferSelect;
export type InsertWin = typeof wins.$inferInsert;

export type Question = typeof questions.$inferSelect;