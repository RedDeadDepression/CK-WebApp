import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { getTelegramUserId } from "@/lib/devUser";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const telegramUserId = getTelegramUserId();

      // 👉 если вне Telegram — создаём dev-пользователя
      if (!telegramUserId) {
        return {
          id: 0,
          telegramUserId: "dev-user",
          isVip: true, // можно false если хочешь тестировать free flow
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      const res = await fetch(
        `${api.user.me.path}?telegram_user_id=${encodeURIComponent(telegramUserId)}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }

      return await res.json();
    },

    enabled: typeof window !== "undefined",
  });
}