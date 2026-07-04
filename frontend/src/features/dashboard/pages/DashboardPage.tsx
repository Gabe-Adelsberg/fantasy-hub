import { useDashboard } from "../hooks";
import { PowerRankingsCard } from "../components/PowerRankingsCard";
import { WeeklyAwardsCard } from "../components/WeeklyAwardsCard";
import Header from "../../../components/layout/Header";

export default function DashboardPage() {
  const { dashboard, loading } = useDashboard(1);

  if (loading) return <p className="text-white p-8">Loading...</p>;
  if (!dashboard) return <p className="text-red-500 p-8">Could not load dashboard.</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">
          {dashboard.league.name}
        </h1>
        <p className="text-zinc-400">
          {dashboard.league.season} • {dashboard.league.sport.toUpperCase()}
        </p>
      </div>

      <Header />

      <PowerRankingsCard rankings={dashboard.power_rankings} />

      <WeeklyAwardsCard awards={dashboard.weekly_awards} />
    </div>
    
  );
}