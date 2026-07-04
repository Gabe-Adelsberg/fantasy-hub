export function WeeklyAwardsCard({ awards }: { awards: any }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-2xl font-semibold text-white">Weekly Awards</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Award
          title="Highest Score"
          value={awards.highest_score.team}
          detail={`${awards.highest_score.points} pts`}
        />

        <Award
          title="Lowest Score"
          value={awards.lowest_score.team}
          detail={`${awards.lowest_score.points} pts`}
        />

        <Award
          title="Closest Game"
          value={`${awards.closest_game.winner.team} beat ${awards.closest_game.loser.team}`}
          detail={`Margin: ${awards.closest_game.margin}`}
        />

        <Award
          title="Biggest Blowout"
          value={`${awards.biggest_blowout.winner.team} beat ${awards.biggest_blowout.loser.team}`}
          detail={`Margin: ${awards.biggest_blowout.margin}`}
        />
      </div>
    </section>
  );
}

function Award({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl bg-zinc-950 p-4">
      <p className="text-sm text-zinc-400">{title}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-zinc-500">{detail}</p>
    </div>
  );
}