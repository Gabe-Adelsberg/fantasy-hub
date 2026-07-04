export function PowerRankingsCard({ rankings }: { rankings: any[] }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-2xl font-semibold text-white">Power Rankings</h2>

      <div className="mt-4 space-y-2">
        {rankings.map((team) => (
          <div
            key={team.roster_id}
            className="flex items-center justify-between gap-4 rounded-xl bg-zinc-950 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-white">
                #{team.rank} {team.team}
              </p>
              <p className="text-sm text-zinc-500">
                {team.record}
              </p>
            </div>

            <span className="shrink-0 font-semibold text-blue-400">
              {team.power_score}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}