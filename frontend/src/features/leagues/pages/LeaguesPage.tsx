import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { connectSleeperAccount, connectSleeperLeague } from "../api";
import { useLeagues } from "../hooks";

export default function LeaguesPage() {
  const [sleeperUsername, setSleeperUsername] = useState("");
  const [sleeperLeagueId, setSleeperLeagueId] = useState("");
  const { leagues, loading } = useLeagues();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token") ?? "";
  const accountMutation = useMutation({
    mutationFn: () => connectSleeperAccount(sleeperUsername.trim(), token),
    onSuccess: () => {
      setSleeperUsername("");
      queryClient.invalidateQueries({ queryKey: ["leagues"] });
    },
  });
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

  function handleConnectAccount() {
    if (!sleeperUsername.trim() || accountMutation.isPending) {
      return;
    }

    accountMutation.mutate();
  }

  if (loading) {
    return <p className="p-8 text-white">Loading leagues...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Your Leagues</h1>
        <p className="mt-2 text-zinc-400">
          Connect your Sleeper account once, then choose a league dashboard.
        </p>
      </div>

      <section className="surface p-5">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="eyebrow">Recommended</p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Connect your Sleeper account
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Enter your Sleeper username and Fantasy Hub will import your
              leagues, then match your account to your roster in each league.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={sleeperUsername}
                onChange={(event) => setSleeperUsername(event.target.value)}
                placeholder="Sleeper username"
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-blue-400"
              />
              <button
                onClick={handleConnectAccount}
                disabled={
                  !sleeperUsername.trim() || accountMutation.isPending
                }
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {accountMutation.isPending ? "Importing..." : "Import leagues"}
              </button>
            </div>

            {accountMutation.isError && (
              <p className="mt-3 text-sm text-red-400">
                Could not find that Sleeper account or import its leagues.
              </p>
            )}
          </div>

          <div className="surface-muted p-4">
            <h3 className="font-semibold text-white">Have a league ID?</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Manual league connect still works, but it cannot identify your
              roster unless you connect the account too.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <input
                value={sleeperLeagueId}
                onChange={(event) => setSleeperLeagueId(event.target.value)}
                placeholder="Sleeper league ID"
                className="min-w-0 rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-zinc-500"
              />
              <button
                onClick={handleConnectLeague}
                disabled={!sleeperLeagueId.trim() || connectMutation.isPending}
                className="rounded-lg border border-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {connectMutation.isPending ? "Connecting..." : "Connect ID"}
              </button>
            </div>

            {connectMutation.isError && (
              <p className="mt-3 text-sm text-red-400">
                Could not connect that league. Check the ID and try again.
              </p>
            )}
          </div>
        </div>
      </section>

      {leagues.length === 0 ? (
        <div className="surface p-6">
          <h2 className="text-xl font-semibold text-white">
            No leagues connected yet
          </h2>
          <p className="mt-2 text-zinc-400">
            Add your Sleeper username above to import your leagues and roster
            identity.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {leagues.map((league) => (
            <Link
              key={league.id}
              to={`/leagues/${league.id}/dashboard`}
              className="surface p-5 transition hover:border-blue-400/40 hover:bg-white/[0.045]"
            >
              <p className="text-sm uppercase tracking-wide text-zinc-500">
                {league.sport} {league.season}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                {league.name}
              </h2>
              <div className="mt-3 space-y-1 text-sm text-zinc-400">
                <p>
                  {league.sleeper_league_id
                    ? "Sleeper connected"
                    : "Sleeper not connected"}
                </p>
                {league.sleeper_username && (
                  <p>Account: {league.sleeper_username}</p>
                )}
                {league.sleeper_roster_id ? (
                  <p className="text-blue-300">
                    Your roster: #{league.sleeper_roster_id}
                  </p>
                ) : (
                  <p className="text-zinc-500">Roster not matched yet</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
