import { useState } from "react";

import Header from "../../../components/layout/Header";
import { OverviewCards } from "../components/OverviewCards";
import { PowerRankingsCard } from "../components/PowerRankingsCard";
import { WeeklyAwardsCard } from "../components/WeeklyAwardsCard";
import { MatchupsCard } from "../components/MatchupsCard";
import { StandingsCard } from "../components/StandingsCard";
import { useDashboard } from "../hooks";

export default function DashboardPage() {
  const [week, setWeek] = useState<number | undefined>(undefined);
  const { dashboard, loading } = useDashboard(1, week);

  if (loading) return <p className="p-8 text-white">Loading...</p>;

  if (!dashboard) {
    return <p className="p-8 text-red-500">Could not load dashboard.</p>;
  }

  return (
    <div className="space-y-8">
      <Header />

      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">
            {dashboard.league.name}
          </h2>

          <p className="mt-1 text-zinc-400">
            {dashboard.league.season} • {dashboard.league.sport.toUpperCase()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setWeek(Math.max(1, dashboard.week - 1))}
            className="rounded-lg border border-zinc-800 px-4 py-2 text-white hover:bg-zinc-900"
          >
            ←
          </button>

          <span className="text-zinc-300">Week {dashboard.week}</span>

          <button
            onClick={() => setWeek(dashboard.week + 1)}
            className="rounded-lg border border-zinc-800 px-4 py-2 text-white hover:bg-zinc-900"
          >
            →
          </button>
        </div>
      </div>

      <OverviewCards dashboard={dashboard} />

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <PowerRankingsCard rankings={dashboard.power_rankings} />
        </div>

        <div className="xl:col-span-5">
          <WeeklyAwardsCard awards={dashboard.weekly_awards} />
        </div>

        <div className="xl:col-span-12">
          <MatchupsCard matchups={dashboard.matchups} />
        </div>

        <div className="xl:col-span-12">
          <StandingsCard standings={dashboard.standings} />
        </div>
      </div>
    </div>
  );
}