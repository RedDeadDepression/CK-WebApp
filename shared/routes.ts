import { z } from "zod";
import { wins, users, attempts } from "./schema";

export const api = {
  wins: {
    create: {
      method: "POST" as const,
      path: "/api/wins",
      input: z.object({
        telegramUserId: z.string(),
      }),
      responses: {
        201: z.custom<typeof wins.$inferSelect>(),
      },
    },

    listByUser: {
      method: "GET" as const,
      path: "/api/wins/:telegramUserId",
      responses: {
        200: z.array(z.custom<typeof wins.$inferSelect>()),
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
        201: z.custom<typeof attempts.$inferSelect>(),
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