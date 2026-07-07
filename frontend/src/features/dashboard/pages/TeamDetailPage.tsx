import { Link, useParams } from "react-router-dom";

import { useDashboard } from "../hooks";

export default function TeamDetailPage() {
  const { leagueId, rosterId } = useParams();
  const parsedLeagueId = Number(leagueId);
  const parsedRosterId = Number(rosterId);
  const { dashboard, loading } = useDashboard(parsedLeagueId);

  if (loading) {
    return <p className="p-8 text-white">Loading team...</p>;
  }

  const team = dashboard?.league_pulse.teams.find(
    (pulseTeam) => pulseTeam.roster_id === parsedRosterId
  );

  if (!dashboard || !team) {
    return (
      <div className="space-y-4 p-8">
        <p className="text-red-500">Could not load team detail.</p>
        <Link
          to={`/leagues/${leagueId}/dashboard`}
          className="inline-flex rounded-lg border border-zinc-800 px-4 py-2 text-zinc-300 hover:bg-zinc-900 hover:text-white"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="surface p-6 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            to={`/leagues/${leagueId}/dashboard`}
            className="text-sm font-medium text-blue-300 hover:text-blue-200"
          >
            Back to dashboard
          </Link>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
            {team.team}
          </h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            {team.label_description}
          </p>
        </div>

        <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 px-5 py-4 shadow-xl shadow-blue-950/20">
          <p className="text-sm text-zinc-400">Playoff Odds</p>
          <p className="mt-1 text-3xl font-bold text-white">
            {team.playoff_odds}%
          </p>
        </div>
      </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat title="Profile" value={team.label} />
        <Stat title="Actual Record" value={team.actual_record} />
        <Stat title="All-Play" value={team.all_play_record} />
        <Stat title="Luck Delta" value={formatLuck(team.luck_delta)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="surface p-6">
          <h2 className="text-2xl font-semibold text-white">Scoring Trend</h2>
          <div className="mt-4 space-y-3">
            {team.power_history.map((week) => (
              <div key={week.week}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Week {week.week}</span>
                  <span className="text-zinc-300">
                    #{week.rank} / {week.score} pts
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-black/30">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    style={{ width: `${Math.min(week.score, 200) / 2}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="surface p-6">
          <h2 className="text-2xl font-semibold text-white">Manager Pain</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Stat
              title="Bench Points"
              value={team.bench_pain.total_bench_points}
            />
            <Stat
              title="Avg Bench Pain"
              value={team.bench_pain.average_bench_points}
            />
            <Stat
              title="Worst Week"
              value={team.bench_pain.worst_week ?? "-"}
            />
            <Stat
              title="Worst Miss"
              value={team.bench_pain.worst_week_points}
            />
          </div>
        </section>

        <section className="surface p-6">
          <h2 className="text-2xl font-semibold text-white">
            Schedule Difficulty
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Stat
              title="Difficulty Rank"
              value={`#${team.schedule_difficulty.difficulty_rank}`}
            />
            <Stat
              title="Avg Opponent Score"
              value={team.schedule_difficulty.average_opponent_score}
            />
          </div>
        </section>

        <section className="surface p-6">
          <h2 className="text-2xl font-semibold text-white">Rivalries</h2>
          <div className="mt-4 space-y-2">
            {team.rivalries.slice(0, 5).map((rivalry) => (
              <div
                key={rivalry.opponent_roster_id}
                className="surface-muted px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{rivalry.opponent}</p>
                  <p className="text-sm text-zinc-400">
                    {rivalry.wins}-{rivalry.losses}
                    {rivalry.ties ? `-${rivalry.ties}` : ""}
                  </p>
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  {rivalry.points_for} PF / {rivalry.points_against} PA
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-zinc-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function formatLuck(value: number) {
  return value > 0 ? `+${value}` : String(value);
}
