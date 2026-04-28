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
  const telegramUserId = getTelegramUserId();

  return useQuery({
    queryKey: ["wins", telegramUserId],
    queryFn: async () => {
      if (!telegramUserId) return { wins: 0 };

      const url = api.wins.getByUser.path.replace(
        ":telegramUserId",
        telegramUserId
      );

      const res = await fetch(url);

      if (!res.ok) throw new Error("Failed to fetch wins");

      return await res.json(); // { wins: number }
    },
    enabled: !!telegramUserId,
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
      const telegramUserId = getTelegramUserId();

      //  invalidate
      queryClient.invalidateQueries({
        queryKey: ["wins", telegramUserId],
      });

      // optional
      queryClient.setQueryData(["wins", telegramUserId], (old: any) => {
        if (!old) return { wins: 1 };
        return { wins: old.wins + 1 };
      });
    },
  });
}