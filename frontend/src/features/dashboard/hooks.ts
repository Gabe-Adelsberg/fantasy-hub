import { useEffect, useState } from "react";
import { getDashboard } from "./api";
import type { Dashboard } from "@/types/dashboard";

export function useDashboard(leagueId: number, week?: number) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      const data = await getDashboard(leagueId, token, week);

      setDashboard(data);
      setLoading(false);
    }

    load();
  }, [leagueId, week]);

  return { dashboard, loading };
}