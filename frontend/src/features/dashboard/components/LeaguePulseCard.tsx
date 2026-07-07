import { Link, useParams } from "react-router-dom";

import type { LeaguePulse, PulseTeam } from "@/types/dashboard";

export function LeaguePulseCard({ pulse }: { pulse: LeaguePulse }) {
  const { leagueId } = useParams();

  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        <Highlight
          title="Luckiest"
          team={pulse.highlights.luckiest_team}
          detail={(team) => `${formatLuck(team.luck_delta)} wins vs all-play`}
        />
        <Highlight
          title="Unluckiest"
          team={pulse.highlights.unluckiest_team}
          detail={(team) => `${formatLuck(team.luck_delta)} wins vs all-play`}
        />
        <Highlight
          title="Most Consistent"
          team={pulse.highlights.most_consistent_team}
          detail={(team) => `${team.standard_deviation} score volatility`}
        />
        <Highlight
          title="Most Volatile"
          team={pulse.highlights.most_volatile_team}
          detail={(team) => `${team.standard_deviation} score volatility`}
        />
      </div>

      <section className="surface p-6">
        <h2 className="text-2xl font-semibold text-white">Shareable Cards</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Copy quick league-context cards for your group chat.
        </p>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {pulse.share_cards.map((card) => (
            <div
              key={`${card.title}-${card.body}`}
              className="surface-muted p-4"
            >
              <p className="font-semibold text-white">{card.title}</p>
              <p className="mt-1 text-sm text-zinc-400">{card.body}</p>
              <button
                onClick={() => copyCard(card.title, card.body)}
                className="mt-3 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
        <section className="surface p-6">
          <h2 className="text-2xl font-semibold text-white">
            Weekly Storylines
          </h2>
          <div className="mt-4 space-y-3">
            {pulse.storylines.map((storyline) => (
              <div
                key={`${storyline.title}-${storyline.team ?? "league"}`}
                className="surface-muted p-4"
              >
                <p className="font-semibold text-white">{storyline.title}</p>
                <p className="mt-1 text-sm text-zinc-400">
                  {storyline.description}
                </p>
                {storyline.value !== null && (
                  <p className="mt-2 text-sm font-medium text-blue-400">
                    {storyline.value}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="surface p-6">
          <h2 className="text-2xl font-semibold text-white">
            True Strength Table
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Ranked by all-play performance, not just head-to-head luck.
          </p>

          <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/30 text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Label</th>
                  <th className="px-4 py-3">Odds</th>
                  <th className="px-4 py-3">Record</th>
                  <th className="px-4 py-3">All-Play</th>
                  <th className="px-4 py-3">Luck</th>
                  <th className="px-4 py-3">SOS</th>
                  <th className="px-4 py-3">Bench Pain</th>
                </tr>
              </thead>

              <tbody>
                {pulse.teams.map((team) => (
                  <tr
                    key={team.roster_id}
                    className="border-t border-white/10 transition hover:bg-white/[0.035]"
                  >
                    <td className="px-4 py-3 text-zinc-400">
                      #{team.pulse_rank}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/leagues/${leagueId}/teams/${team.roster_id}`}
                        className="font-medium text-white hover:text-blue-300"
                      >
                        {team.team}
                      </Link>
                      <p className="mt-1 text-xs text-zinc-500">
                        {team.notes[0]}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-200">{team.label}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {team.label_description}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {team.playoff_odds}%
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {team.actual_record}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {team.all_play_record}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {formatLuck(team.luck_delta)}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      #{team.schedule_difficulty.difficulty_rank}
                      <span className="block text-xs text-zinc-500">
                        {team.schedule_difficulty.average_opponent_score} PA
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {team.bench_pain.total_bench_points}
                      <span className="block text-xs text-zinc-500">
                        Wk {team.bench_pain.worst_week ?? "-"} high
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}

function copyCard(title: string, body: string) {
  const text = `${title}: ${body}`;

  if (navigator.clipboard) {
    void navigator.clipboard.writeText(text);
  }
}

function Highlight({
  title,
  team,
  detail,
}: {
  title: string;
  team: PulseTeam | null;
  detail: (team: PulseTeam) => string;
}) {
  return (
    <div className="metric-card">
      <p className="text-sm text-zinc-400">{title}</p>
      <h3 className="mt-2 truncate text-xl font-semibold text-white">
        {team?.team ?? "TBD"}
      </h3>
      {team && <p className="mt-2 text-sm text-zinc-500">{detail(team)}</p>}
    </div>
  );
}

function formatLuck(value: number) {
  return value > 0 ? `+${value}` : String(value);
}
