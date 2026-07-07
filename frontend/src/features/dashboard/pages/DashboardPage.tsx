import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Header from "../../../components/layout/Header";
import { OverviewCards } from "../components/OverviewCards";
import { PowerRankingsCard } from "../components/PowerRankingsCard";
import { WeeklyAwardsCard } from "../components/WeeklyAwardsCard";
import { MatchupsCard } from "../components/MatchupsCard";
import { LeaguePulseCard } from "../components/LeaguePulseCard";
import { PlayoffPictureCard } from "../components/PlayoffPictureCard";
import { StandingsCard } from "../components/StandingsCard";
import { useDashboard } from "../hooks";
import { useLeagues } from "../../leagues/hooks";

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (error as { response?: { data?: { detail?: string } } })
      .response;

    return response?.data?.detail ?? "Could not load dashboard.";
  }

  return "Could not load dashboard.";
}

export default function DashboardPage() {
  const [week, setWeek] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<
    "overview" | "pulse" | "playoffs"
  >("overview");
  const navigate = useNavigate();
  const { leagueId } = useParams();
  const parsedLeagueId = Number(leagueId);
  const { leagues } = useLeagues();
  const { dashboard, error, loading, refetching } = useDashboard(
    parsedLeagueId,
    week
  );

  if (!Number.isInteger(parsedLeagueId)) {
    return <p className="p-8 text-red-500">Invalid league id.</p>;
  }

  if (loading) return <p className="p-8 text-white">Loading...</p>;

  if (!dashboard || error) {
    return (
      <div className="space-y-4 p-8">
        <p className="text-red-500">{getErrorMessage(error)}</p>
        <Link
          to="/leagues"
          className="inline-flex rounded-lg border border-zinc-800 px-4 py-2 text-zinc-300 hover:bg-zinc-900 hover:text-white"
        >
          Back to leagues
        </Link>
      </div>
    );
  }

  const canGoPrevious = dashboard.week > dashboard.week_bounds.min;
  const canGoNext = dashboard.week < dashboard.week_bounds.max;

  return (
    <div className="space-y-8">
      <Header />

      <div className="surface p-6 md:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">League Dashboard</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white">
            {dashboard.league.name}
          </h2>

          <p className="mt-2 text-zinc-400">
            {dashboard.league.season} / {dashboard.league.sport.toUpperCase()}
            {refetching ? " / Refreshing" : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/leagues"
            className="rounded-lg border border-white/10 px-4 py-2 text-zinc-300 transition hover:bg-white/10 hover:text-white"
          >
            All leagues
          </Link>

          {leagues.length > 1 && (
            <select
              value={parsedLeagueId}
              onChange={(event) => {
                setWeek(undefined);
                navigate(`/leagues/${event.target.value}/dashboard`);
              }}
              className="rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-white"
            >
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() =>
              setWeek(Math.max(dashboard.week_bounds.min, dashboard.week - 1))
            }
            disabled={!canGoPrevious}
            className="rounded-lg border border-white/10 px-4 py-2 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>

          <span className="text-zinc-300">Week {dashboard.week}</span>

          <button
            onClick={() =>
              setWeek(Math.min(dashboard.week_bounds.max, dashboard.week + 1))
            }
            disabled={!canGoNext}
            className="rounded-lg border border-white/10 px-4 py-2 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
      </div>

      <OverviewCards dashboard={dashboard} />

      <div className="surface flex gap-2 p-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={[
            "rounded-lg px-4 py-3 text-sm font-medium transition",
            activeTab === "overview"
              ? "bg-white/10 text-white"
              : "text-zinc-400 hover:bg-white/5 hover:text-white",
          ].join(" ")}
        >
          Overview
        </button>

        <button
          onClick={() => setActiveTab("pulse")}
          className={[
            "rounded-lg px-4 py-3 text-sm font-medium transition",
            activeTab === "pulse"
              ? "bg-white/10 text-white"
              : "text-zinc-400 hover:bg-white/5 hover:text-white",
          ].join(" ")}
        >
          Pulse
        </button>

        <button
          onClick={() => setActiveTab("playoffs")}
          className={[
            "rounded-lg px-4 py-3 text-sm font-medium transition",
            activeTab === "playoffs"
              ? "bg-white/10 text-white"
              : "text-zinc-400 hover:bg-white/5 hover:text-white",
          ].join(" ")}
        >
          Playoffs
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <StandingsCard standings={dashboard.standings} />
          </div>

          <div className="xl:col-span-5">
            <WeeklyAwardsCard awards={dashboard.weekly_awards} />
          </div>

          <div className="xl:col-span-12">
            <MatchupsCard matchups={dashboard.matchups} />
          </div>

          <div className="xl:col-span-12">
            <PowerRankingsCard rankings={dashboard.power_rankings} />
          </div>
        </div>
      )}

      {activeTab === "pulse" && (
        <LeaguePulseCard pulse={dashboard.league_pulse} />
      )}

      {activeTab === "playoffs" && (
        <PlayoffPictureCard playoffPicture={dashboard.playoff_picture} />
      )}
    </div>
  );
}
