import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { getTelegramUserId } from "@/lib/telegram";

export function useUser() {
  // Original implementation (temporarily disabled for premium flow testing):
  // return useQuery({
  //   queryKey: [api.user.me.path],
  //   queryFn: async () => {
  //     const telegramUserId = getTelegramUserId();
  //     
  //     if (!telegramUserId) {
  //       // If no Telegram user ID, return null or default user
  //       // For now, we'll create a fallback user with isVip: false
  //       return { id: 0, telegramUserId: "", isVip: false, createdAt: new Date(), updatedAt: new Date() };
  //     }
  //
  //     const res = await fetch(`${api.user.me.path}?telegram_user_id=${encodeURIComponent(telegramUserId)}`);
  //     if (!res.ok) {
  //       if (res.status === 404) {
  //         // User doesn't exist yet, return default
  //         return { id: 0, telegramUserId, isVip: false, createdAt: new Date(), updatedAt: new Date() };
  //       }
  //       throw new Error("Failed to fetch user");
  //     }
  //     return api.user.me.responses[200].parse(await res.json());
  //   },
  //   enabled: typeof window !== "undefined", // Only run on client
  // });

  // Temporary mocked implementation: always return a VIP user
  return useQuery({
    queryKey: ["mock-user-vip"],
    queryFn: async () => {
      const telegramUserId = getTelegramUserId() ?? "";
      return {
        id: 0,
        telegramUserId,
        isVip: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
    enabled: typeof window !== "undefined",
  });
}

