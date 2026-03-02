import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { getTelegramUserId } from "@/lib/devUser";

/* ================= GET WINS ================= */

export function useWins() {
  const telegramUserId = getTelegramUserId();

  return useQuery({
    queryKey: ["wins", telegramUserId],
    queryFn: async () => {
      if (!telegramUserId) return [];

      const res = await fetch(
        `${api.wins.listByUser.path.replace(":telegramUserId", telegramUserId)}`
      );

      if (!res.ok) throw new Error("Failed to fetch wins");

      return res.json();
    },
    enabled: !!telegramUserId,
  });
}

/* ================= CREATE WIN ================= */

export function useCreateWin() {
  const queryClient = useQueryClient();
  const telegramUserId = getTelegramUserId();

  return useMutation({
    mutationFn: async () => {
      if (!telegramUserId) throw new Error("No telegram user id");

      const res = await fetch(api.wins.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramUserId }),
      });

      if (!res.ok) throw new Error("Failed to create win");

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wins", telegramUserId] });
    },
  });
}