import { useQuery } from "@tanstack/react-query";

import { getLeagues } from "./api";

export function useLeagues() {
  const token = localStorage.getItem("token");
  const query = useQuery({
    queryKey: ["leagues"],
    queryFn: () => getLeagues(token ?? ""),
    enabled: Boolean(token),
    retry: false,
    staleTime: 5 * 60_000,
  });

  return {
    leagues: query.data ?? [],
    error: query.error,
    loading: query.isLoading,
  };
}
