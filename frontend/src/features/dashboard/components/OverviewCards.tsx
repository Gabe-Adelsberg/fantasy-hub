import type { Dashboard } from "@/types/dashboard";

type Props = {
  dashboard: Dashboard;
};

export function OverviewCards({ dashboard }: Props) {
  const leader = dashboard.power_rankings[0];
  const highScore = dashboard.weekly_awards.highest_score;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

      <Card
        title="Teams"
        value={dashboard.members.length}
      />

      <Card
        title="Current Week"
        value={dashboard.week}
      />

      <Card
        title="League Leader"
        value={leader?.team ?? "TBD"}
      />

      <Card
        title="Highest Score"
        value={highScore?.points ?? "TBD"}
      />

    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="metric-card">
      <p className="text-sm text-zinc-400">
        {title}
      </p>

      <h2 className="mt-3 text-3xl font-bold text-white">
        {value}
      </h2>
    </div>
  );
}
