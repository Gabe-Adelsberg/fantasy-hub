import { useQuery } from "@tanstack/react-query";

import { getDashboard } from "./api";

export function useDashboard(leagueId: number, week?: number) {
  const token = localStorage.getItem("token");
  const query = useQuery({
    queryKey: ["dashboard", leagueId, week ?? "latest"],
    queryFn: () => getDashboard(leagueId, token ?? "", week),
    enabled: Boolean(token && leagueId),
    retry: false,
    staleTime: 60_000,
  });

  return {
    dashboard: query.data ?? null,
    error: query.error,
    loading: query.isLoading,
    refetching: query.isFetching && !query.isLoading,
  };
}
