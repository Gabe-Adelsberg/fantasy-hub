import type { PowerRanking } from "@/types/dashboard";

export function PowerRankingsCard({ rankings }: { rankings: PowerRanking[] }) {
  return (
    <section className="surface p-6">
      <h2 className="text-2xl font-semibold text-white">Power Rankings</h2>

      <div className="mt-4 space-y-2">
        {rankings.map((team) => (
          <div
            key={team.roster_id}
            className="surface-muted flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-white/[0.055]"
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
