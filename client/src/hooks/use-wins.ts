import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useWins() {
  return useQuery({
    queryKey: [api.wins.list.path],
    queryFn: async () => {
      const res = await fetch(api.wins.list.path);
      if (!res.ok) throw new Error("Failed to fetch wins");
      return api.wins.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateWin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.wins.create.path, {
        method: api.wins.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to create win");
      return api.wins.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.wins.list.path] }),
  });
}
