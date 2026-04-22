import { z } from "zod";
import { users } from "./schema";

export const api = {
  wins: {
    create: {
      method: "POST" as const,
      path: "/api/wins",
      input: z.object({
        telegramUserId: z.string(),
      }),
      responses: {
        200: z.object({
          success: z.boolean(),
        }),
      },
    },

    getByUser: {
      method: "GET" as const,
      path: "/api/wins/:telegramUserId",
      responses: {
        200: z.object({
          wins: z.number(),
        }),
      },
    },
  },

  attempts: {
    create: {
      method: "POST" as const,
      path: "/api/attempts",
      input: z.object({
        telegramUserId: z.string(),
      }),
      responses: {
        200: z.object({
          success: z.boolean(),
        }),
      },
    },

    getByUser: {
      method: "GET" as const,
      path: "/api/attempts/:telegramUserId",
      responses: {
        200: z.object({
          attempts: z.number(),
        }),
      },
    },
  },

  stats: {
    byUser: {
      method: "GET" as const,
      path: "/api/stats/:telegramUserId",
      responses: {
        200: z.object({
          wins: z.number(),
          attempts: z.number(),
          dailyCost: z.number().nullable(),
        }),
      },
    },
  },

  user: {
    me: {
      method: "GET" as const,
      path: "/api/me",
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
      },
    },
  },
};