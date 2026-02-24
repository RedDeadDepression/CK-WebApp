import { z } from "zod";
import { wins, users } from "./schema";

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
  wins: {
    create: {
      method: "POST" as const,
      path: "/api/wins",
      input: z.object({
        telegramUserId: z.string(),
      }),
      responses: {
        201: z.custom<typeof wins.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },

    listByUser: {
      method: "GET" as const,
      path: "/api/wins/:telegramUserId",
      responses: {
        200: z.array(z.custom<typeof wins.$inferSelect>()),
        404: errorSchemas.notFound,
      },
    },
  },

  user: {
    me: {
      method: "GET" as const,
      path: "/api/me",
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

/* ================= UTILS ================= */

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