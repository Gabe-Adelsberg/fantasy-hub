import { useEffect, useState } from "react";
import { getDashboard } from "./api";

export function useDashboard(leagueId: number) {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const data = await getDashboard(leagueId, token);

        setDashboard(data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [leagueId]);

  return { dashboard, loading };
}