export function MatchupsCard({ matchups }: { matchups: any[] }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-2xl font-semibold text-white">Matchups</h2>

      <div className="mt-4 space-y-3">
        {matchups.map((matchup) => (
          <div
            key={matchup.matchup_id}
            className="rounded-xl bg-zinc-950 p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-white">{matchup.team_a}</p>
                <p className="text-sm text-zinc-500">{matchup.team_a_points} pts</p>
              </div>

              <span className="text-sm text-zinc-500">vs</span>

              <div className="text-right">
                <p className="font-medium text-white">{matchup.team_b}</p>
                <p className="text-sm text-zinc-500">{matchup.team_b_points} pts</p>
              </div>
            </div>

            <p className="mt-3 text-sm text-zinc-400">
              Winner: <span className="text-emerald-400">{matchup.winner}</span> by {matchup.margin}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}