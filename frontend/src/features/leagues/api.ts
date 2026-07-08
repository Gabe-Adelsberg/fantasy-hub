import { api } from "@/lib/api";
import type { UserLeague } from "@/types/dashboard";

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getLeagues(token: string): Promise<UserLeague[]> {
  const response = await api.get<UserLeague[]>("/leagues/", {
    headers: authHeaders(token),
  });

  return response.data;
}

export async function connectSleeperLeague(
  leagueId: string,
  token: string
): Promise<UserLeague> {
  const response = await api.post<UserLeague>(
    "/leagues/connect-sleeper",
    { league_id: leagueId },
    {
      headers: authHeaders(token),
    }
  );

  return response.data;
}

export async function connectSleeperAccount(
  username: string,
  token: string
): Promise<UserLeague[]> {
  const response = await api.post<UserLeague[]>(
    "/leagues/connect-sleeper-account",
    { username },
    {
      headers: authHeaders(token),
    }
  );

  return response.data;
}
