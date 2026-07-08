import { api } from "@/lib/api";
import type { Dashboard } from "@/types/dashboard";

export async function getDashboard(
  leagueId: number,
  token: string,
  week?: number
): Promise<Dashboard> {
  const url =
    week === undefined
      ? `/dashboard/${leagueId}`
      : `/dashboard/${leagueId}?week=${week}`;

  const response = await api.get<Dashboard>(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function verifySleeperTeam(
  leagueId: number,
  code: string,
  token: string
) {
  const response = await api.post(
    `/leagues/${leagueId}/verify-team`,
    { code },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}
