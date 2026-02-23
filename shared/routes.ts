import { z } from "zod";
import { users, userStats, wins } from "./schema";

/* ================= ERROR SCHEMAS ================= */

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

/* ================= API ================= */

export const api = {
  user: {
    me: {
      method: "GET" as const,
      path: "/api/me",
      responses: {
        200: z.object({
          user: z.custom<typeof users.$inferSelect>(),
          stats: z.custom<typeof userStats.$inferSelect>().nullable(),
        }),
        404: errorSchemas.notFound,
      },
    },

    updateProfile: {
      method: "POST" as const,
      path: "/api/profile",
      input: z.object({
        dailyCost: z.number().optional(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },

  wins: {
    create: {
      method: "POST" as const,
      path: "/api/wins",
      input: z.object({
        telegramUserId: z.number(),
      }),
      responses: {
        201: z.custom<typeof wins.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },

    list: {
      method: "GET" as const,
      path: "/api/wins/:telegramUserId",
      responses: {
        200: z.array(z.custom<typeof wins.$inferSelect>()),
      },
    },
  },
};

/* ================= URL BUILDER ================= */

export function buildUrl(
  path: string,
  params?: Record<string, string | number>
): string {
  let url = path;

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }

  return url;
}