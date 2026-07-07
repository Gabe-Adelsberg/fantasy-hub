type Props = {
  dashboard: any;
};

export function OverviewCards({ dashboard }: Props) {
  const leader = dashboard.power_rankings[0];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

      <Card
        title="Teams"
        value={dashboard.members.length}
      />

      <Card
        title="Current Week"
        value="1"
      />

      <Card
        title="League Leader"
        value={leader.team}
      />

      <Card
        title="Highest Score"
        value={dashboard.weekly_awards.highest_score.points}
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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-400">
        {title}
      </p>

      <h2 className="mt-3 text-3xl font-bold text-white">
        {value}
      </h2>
    </div>
  );
}