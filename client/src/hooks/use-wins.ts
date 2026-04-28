import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

function getTelegramUserId() {
  const tg = window.Telegram?.WebApp;
  return tg?.initDataUnsafe?.user?.id
    ? String(tg.initDataUnsafe.user.id)
    : null;
}

//  GET wins
export function useWins() {
  return useQuery({
    queryKey: ["wins"],
    queryFn: async () => {
      const telegramUserId = getTelegramUserId();
      if (!telegramUserId) return { wins: 0 };

      const res = await fetch(
        `${api.wins.getByUser.path}?telegramUserId=${telegramUserId}`
      );

      if (!res.ok) throw new Error("Failed to fetch wins");

      return await res.json(); // { wins: number }
    },
  });
}

//  CREATE win
export function useCreateWin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const telegramUserId = getTelegramUserId();
      if (!telegramUserId) throw new Error("No Telegram user");

      const res = await fetch(api.wins.create.path, {
        method: api.wins.create.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ telegramUserId }),
      });

      if (!res.ok) throw new Error("Failed to create win");

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wins"] });
    },
  });
}