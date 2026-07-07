import type { Standing } from "@/types/dashboard";

export function StandingsCard({ standings }: { standings: Standing[] }) {
  return (
    <section className="surface p-6">
      <h2 className="text-2xl font-semibold text-white">Standings</h2>

      <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/30 text-zinc-400">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Record</th>
              <th className="px-4 py-3">PF</th>
              <th className="px-4 py-3">PA</th>
            </tr>
          </thead>

          <tbody>
            {standings.map((team) => (
              <tr
                key={team.rank}
                className="border-t border-white/10 transition hover:bg-white/[0.035]"
              >
                <td className="px-4 py-3 text-zinc-400">#{team.rank}</td>
                <td className="px-4 py-3 font-medium text-white">
                  {team.team}
                </td>
                <td className="px-4 py-3 text-zinc-300">{team.record}</td>
                <td className="px-4 py-3 text-zinc-300">
                  {team.points_for}
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  {team.points_against}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
