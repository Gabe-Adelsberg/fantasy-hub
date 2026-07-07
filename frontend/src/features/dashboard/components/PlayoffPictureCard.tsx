import type {
  PlayoffMatchup,
  PlayoffPerformance,
  PlayoffPicture,
  PlayoffTeam,
} from "@/types/dashboard";

export function PlayoffPictureCard({
  playoffPicture,
}: {
  playoffPicture: PlayoffPicture;
}) {
  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Playoff Bracket
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            {playoffPicture.is_playoffs
              ? "Playoffs are underway."
              : `${playoffPicture.weeks_until_playoffs} week${
                  playoffPicture.weeks_until_playoffs === 1 ? "" : "s"
                } until playoffs.`}
          </p>
        </div>

        <div className="grid gap-2 text-sm text-zinc-300 sm:grid-cols-3">
          <Stat label="Playoff Teams" value={playoffPicture.playoff_teams} />
          <Stat label="Start Week" value={playoffPicture.playoff_week_start} />
          <Stat label="Title Week" value={playoffPicture.championship_week} />
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Bracket rounds={playoffPicture.bracket} />

        <div className="space-y-5">
          <PerformanceSummary teams={playoffPicture.performance} />
          <TeamList
            title="Projected Seeds"
            teams={playoffPicture.projected_playoff_teams}
          />
          <TeamList title="Bubble Watch" teams={playoffPicture.bubble_teams} />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-zinc-950 px-3 py-2">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="font-semibold text-white">{value}</p>
    </div>
  );
}

function Bracket({
  rounds,
}: {
  rounds: { week: number; round: string; matchups: PlayoffMatchup[] }[];
}) {
  if (rounds.every((round) => round.matchups.length === 0)) {
    return (
      <div className="rounded-lg bg-zinc-950 p-5">
        <h3 className="text-lg font-semibold text-white">Bracket</h3>
        <p className="mt-2 text-sm text-zinc-400">
          The bracket will populate once playoff matchup data is available.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[760px] gap-4 md:grid-cols-3">
        {rounds.map((round) => (
          <div key={round.week}>
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-white">
                {round.round}
              </h3>
              <p className="text-sm text-zinc-500">Week {round.week}</p>
            </div>

            <div className="space-y-4">
              {round.matchups.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-800 p-4 text-sm text-zinc-500">
                  No matchups yet.
                </div>
              ) : (
                round.matchups.map((matchup) => (
                  <BracketMatchup key={matchup.matchup_id} matchup={matchup} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BracketMatchup({ matchup }: { matchup: PlayoffMatchup }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <TeamScore
        name={matchup.team_a}
        points={matchup.team_a_points}
        isWinner={matchup.winner_roster_id === matchup.team_a_roster_id}
      />
      <div className="my-3 border-t border-zinc-800" />
      <TeamScore
        name={matchup.team_b}
        points={matchup.team_b_points}
        isWinner={matchup.winner_roster_id === matchup.team_b_roster_id}
      />
      <p className="mt-3 text-xs text-zinc-500">
        Winner: <span className="text-zinc-300">{matchup.winner}</span>
        {matchup.winner !== "Tie" ? ` by ${matchup.margin}` : ""}
      </p>
    </div>
  );
}

function TeamScore({
  name,
  points,
  isWinner,
}: {
  name: string;
  points: number;
  isWinner: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className={isWinner ? "font-semibold text-white" : "text-zinc-400"}>
        {name}
      </p>
      <p className={isWinner ? "font-semibold text-emerald-400" : "text-zinc-400"}>
        {points}
      </p>
    </div>
  );
}

function PerformanceSummary({ teams }: { teams: PlayoffPerformance[] }) {
  const leader = teams[0];

  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Playoff Performance
      </h3>

      {!leader ? (
        <p className="mt-3 rounded-lg bg-zinc-950 p-4 text-sm text-zinc-400">
          No playoff scores have been recorded yet.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {teams.map((team) => (
            <div
              key={team.roster_id}
              className="rounded-lg bg-zinc-950 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-white">{team.team}</p>
                <p className="text-sm text-zinc-400">
                  {team.playoff_wins}-{team.playoff_losses}
                </p>
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                {team.playoff_points} pts / {team.average_score} avg / high{" "}
                {team.high_score}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TeamList({ title, teams }: { title: string; teams: PlayoffTeam[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </h3>

      {teams.length === 0 ? (
        <p className="mt-3 rounded-lg bg-zinc-950 p-4 text-sm text-zinc-400">
          No teams in this group.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {teams.map((team) => (
            <div
              key={team.roster_id}
              className="flex items-center justify-between gap-4 rounded-lg bg-zinc-950 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-white">
                  #{team.seed} {team.team}
                </p>
                <p className="text-sm text-zinc-500">
                  {team.record} / {team.points_for} PF
                </p>
              </div>

              <span className="shrink-0 rounded-full border border-zinc-800 px-3 py-1 text-xs capitalize text-zinc-300">
                {team.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
