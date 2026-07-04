import { api } from "@/lib/api";

export async function getDashboard(leagueId: number, token: string) {
  const response = await api.get(`/dashboard/${leagueId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}