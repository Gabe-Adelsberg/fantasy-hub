import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { connectSleeperLeague } from "../api";
import { useLeagues } from "../hooks";

export default function LeaguesPage() {
  const [sleeperLeagueId, setSleeperLeagueId] = useState("");
  const { leagues, loading } = useLeagues();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token") ?? "";
  const connectMutation = useMutation({
    mutationFn: () => connectSleeperLeague(sleeperLeagueId.trim(), token),
    onSuccess: () => {
      setSleeperLeagueId("");
      queryClient.invalidateQueries({ queryKey: ["leagues"] });
    },
  });

  function handleConnectLeague() {
    if (!sleeperLeagueId.trim() || connectMutation.isPending) {
      return;
    }

    connectMutation.mutate();
  }

  if (loading) {
    return <p className="p-8 text-white">Loading leagues...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Your Leagues</h1>
        <p className="mt-2 text-zinc-400">
          Choose a connected Sleeper league to open its dashboard.
        </p>
      </div>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-xl font-semibold text-white">
          Connect a Sleeper league
        </h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={sleeperLeagueId}
            onChange={(event) => setSleeperLeagueId(event.target.value)}
            placeholder="Sleeper league ID"
            className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-600"
          />
          <button
            onClick={handleConnectLeague}
            disabled={!sleeperLeagueId.trim() || connectMutation.isPending}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {connectMutation.isPending ? "Connecting..." : "Connect"}
          </button>
        </div>

        {connectMutation.isError && (
          <p className="mt-3 text-sm text-red-400">
            Could not connect that league. Check the ID and try again.
          </p>
        )}
      </section>

      {leagues.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold text-white">
            No leagues connected yet
          </h2>
          <p className="mt-2 text-zinc-400">
            Add a Sleeper league ID above to start building your dashboard.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {leagues.map((league) => (
            <Link
              key={league.id}
              to={`/leagues/${league.id}/dashboard`}
              className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-600 hover:bg-zinc-800"
            >
              <p className="text-sm uppercase tracking-wide text-zinc-500">
                {league.sport} {league.season}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                {league.name}
              </h2>
              <p className="mt-3 text-sm text-zinc-400">
                {league.sleeper_league_id
                  ? "Sleeper connected"
                  : "Sleeper not connected"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
