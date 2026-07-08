import type { ReactNode } from "react";

import type { SocialHub } from "@/types/dashboard";

const EMPTY_SOCIAL_HUB: SocialHub = {
  feed: [],
  trash_talk_prompts: [],
  newspaper: {
    headline: "Social hub is warming up",
    subheadline: "League stories will appear as soon as the dashboard data loads.",
    top_story: "No headline is ready yet.",
    villain: "TBD",
    quote: "Check back after the next sync.",
  },
  weekly_awards: [],
  polls: [],
  manager_profiles: [],
  rivalry_spotlight: {
    team: "TBD",
    opponent: "TBD",
    record: "0-0",
    games: 0,
    points_for: 0,
    points_against: 0,
    heat: 0,
  },
  predictions: [],
  commissioner_tools: [],
  commissioner_hq: {
    league_name: "League",
    quick_actions: [],
    rulebook: [],
    open_items: [],
  },
  season_archive: [],
  share_graphics: [],
  punishment_tracker: [],
  punishment_hub: {
    title: "Last-Place Watch",
    leader: null,
    danger_zone: [],
    escape_paths: [],
    punishment_history: [],
  },
  hall_of_fame: [],
  rivalry_center: [],
  weekly_pickem: {
    rules: "Pick'em matchups will appear once weekly matchup data is available.",
    leaderboard: [],
    matchups: [],
  },
  team_branding: [],
  scenario_lab: [],
  trade_court: {
    prompt: "Trade Court",
    status: "Trade debate prompts will appear once social data is available.",
  },
};

function withSocialDefaults(social?: Partial<SocialHub> | null): SocialHub {
  return {
    ...EMPTY_SOCIAL_HUB,
    ...social,
    feed: social?.feed ?? EMPTY_SOCIAL_HUB.feed,
    trash_talk_prompts:
      social?.trash_talk_prompts ?? EMPTY_SOCIAL_HUB.trash_talk_prompts,
    newspaper: {
      ...EMPTY_SOCIAL_HUB.newspaper,
      ...social?.newspaper,
    },
    weekly_awards: social?.weekly_awards ?? EMPTY_SOCIAL_HUB.weekly_awards,
    polls: social?.polls ?? EMPTY_SOCIAL_HUB.polls,
    manager_profiles:
      social?.manager_profiles ?? EMPTY_SOCIAL_HUB.manager_profiles,
    rivalry_spotlight: {
      ...EMPTY_SOCIAL_HUB.rivalry_spotlight,
      ...social?.rivalry_spotlight,
    },
    predictions: social?.predictions ?? EMPTY_SOCIAL_HUB.predictions,
    commissioner_tools:
      social?.commissioner_tools ?? EMPTY_SOCIAL_HUB.commissioner_tools,
    commissioner_hq: {
      ...EMPTY_SOCIAL_HUB.commissioner_hq,
      ...social?.commissioner_hq,
      quick_actions:
        social?.commissioner_hq?.quick_actions ??
        EMPTY_SOCIAL_HUB.commissioner_hq.quick_actions,
      rulebook:
        social?.commissioner_hq?.rulebook ??
        EMPTY_SOCIAL_HUB.commissioner_hq.rulebook,
      open_items:
        social?.commissioner_hq?.open_items ??
        EMPTY_SOCIAL_HUB.commissioner_hq.open_items,
    },
    season_archive: social?.season_archive ?? EMPTY_SOCIAL_HUB.season_archive,
    share_graphics: social?.share_graphics ?? EMPTY_SOCIAL_HUB.share_graphics,
    punishment_tracker:
      social?.punishment_tracker ?? EMPTY_SOCIAL_HUB.punishment_tracker,
    punishment_hub: {
      ...EMPTY_SOCIAL_HUB.punishment_hub,
      ...social?.punishment_hub,
      leader: social?.punishment_hub?.leader ?? null,
      danger_zone:
        social?.punishment_hub?.danger_zone ??
        EMPTY_SOCIAL_HUB.punishment_hub.danger_zone,
      escape_paths:
        social?.punishment_hub?.escape_paths ??
        EMPTY_SOCIAL_HUB.punishment_hub.escape_paths,
      punishment_history:
        social?.punishment_hub?.punishment_history ??
        EMPTY_SOCIAL_HUB.punishment_hub.punishment_history,
    },
    hall_of_fame: social?.hall_of_fame ?? EMPTY_SOCIAL_HUB.hall_of_fame,
    rivalry_center:
      social?.rivalry_center ?? EMPTY_SOCIAL_HUB.rivalry_center,
    weekly_pickem: {
      ...EMPTY_SOCIAL_HUB.weekly_pickem,
      ...social?.weekly_pickem,
      leaderboard:
        social?.weekly_pickem?.leaderboard ??
        EMPTY_SOCIAL_HUB.weekly_pickem.leaderboard,
      matchups:
        social?.weekly_pickem?.matchups ??
        EMPTY_SOCIAL_HUB.weekly_pickem.matchups,
    },
    team_branding: social?.team_branding ?? EMPTY_SOCIAL_HUB.team_branding,
    scenario_lab: social?.scenario_lab ?? EMPTY_SOCIAL_HUB.scenario_lab,
    trade_court: {
      ...EMPTY_SOCIAL_HUB.trade_court,
      ...social?.trade_court,
    },
  };
}

export function SocialHubCard({ social: rawSocial }: { social?: Partial<SocialHub> | null }) {
  const social = withSocialDefaults(rawSocial);

  return (
    <section className="space-y-6">
      <section className="surface overflow-hidden p-6 md:p-8">
        <p className="eyebrow">League Newspaper</p>
        <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white">
          {social.newspaper.headline}
        </h2>
        <p className="mt-2 text-zinc-400">{social.newspaper.subheadline}</p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="surface-muted p-5">
            <p className="text-sm text-zinc-500">Top Story</p>
            <p className="mt-2 text-lg text-white">{social.newspaper.top_story}</p>
          </div>
          <div className="surface-muted p-5">
            <p className="text-sm text-zinc-500">Quote Board</p>
            <p className="mt-2 text-lg text-white">"{social.newspaper.quote}"</p>
            <p className="mt-3 text-sm text-zinc-400">
              Villain watch: {social.newspaper.villain}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="League Feed">
          <div className="space-y-3">
            {social.feed.map((item) => (
              <div key={`${item.type}-${item.title}`} className="surface-muted p-4">
                <p className="text-xs uppercase tracking-wide text-blue-300">
                  {item.type}
                </p>
                <p className="mt-1 font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-sm text-zinc-400">{item.body}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Weekly Awards">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
            {social.weekly_awards.map((award) => (
              <div key={award.title} className="surface-muted p-4">
                <p className="text-sm text-zinc-500">{award.title}</p>
                <p className="mt-1 font-semibold text-white">{award.winner}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Trash Talk Wall">
          <div className="space-y-3">
            {social.trash_talk_prompts.map((prompt) => (
              <Prompt key={prompt} text={prompt} />
            ))}
          </div>
        </Panel>

        <Panel title="League Polls">
          <div className="space-y-4">
            {social.polls.map((poll) => (
              <div key={poll.question} className="surface-muted p-4">
                <p className="font-medium text-white">{poll.question}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {poll.options.map((option) => (
                    <span
                      key={option}
                      className="rounded-full border border-white/10 px-3 py-1 text-sm text-zinc-300"
                    >
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Commissioner Tools">
          <div className="space-y-2">
            {social.commissioner_tools.map((tool) => (
              <button
                key={tool}
                className="w-full rounded-lg border border-white/10 px-4 py-3 text-left text-zinc-300 transition hover:bg-white/10 hover:text-white"
              >
                {tool}
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Manager Profiles">
          <div className="grid gap-3 md:grid-cols-2">
            {social.manager_profiles.slice(0, 6).map((profile) => (
              <div key={profile.roster_id} className="surface-muted p-4">
                <p className="font-semibold text-white">{profile.team}</p>
                <p className="mt-1 text-sm text-blue-300">{profile.badge}</p>
                <p className="mt-2 text-sm text-zinc-400">{profile.bio}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Rivalry Spotlight">
          <div className="surface-muted p-5">
            <p className="text-2xl font-semibold text-white">
              {social.rivalry_spotlight.team} vs{" "}
              {social.rivalry_spotlight.opponent}
            </p>
            <p className="mt-2 text-zinc-400">
              Record: {social.rivalry_spotlight.record} / Heat:{" "}
              {social.rivalry_spotlight.heat}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {social.rivalry_spotlight.points_for} PF /{" "}
              {social.rivalry_spotlight.points_against} PA
            </p>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Weekly Predictions">
          <div className="space-y-3">
            {social.predictions.slice(0, 4).map((prediction) => (
              <div key={prediction.title} className="surface-muted p-4">
                <p className="font-medium text-white">{prediction.title}</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Pick: {prediction.pick} ({prediction.confidence}% confidence)
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Punishment Hub">
          <div className="space-y-3">
            {social.punishment_hub.leader && (
              <div className="rounded-lg border border-red-400/20 bg-red-500/10 p-4">
                <p className="text-sm text-red-200">Current danger leader</p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {social.punishment_hub.leader.team}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  {social.punishment_hub.leader.reason}
                </p>
              </div>
            )}

            {social.punishment_hub.danger_zone.map((team) => (
              <div key={team.team} className="surface-muted p-4">
                <div className="flex justify-between gap-3">
                  <p className="font-medium text-white">
                    #{team.rank} {team.team}
                  </p>
                  <p className="text-red-300">{team.danger_level}%</p>
                </div>
                <p className="mt-1 text-sm text-zinc-500">{team.reason}</p>
              </div>
            ))}

            <div className="surface-muted p-4">
              <p className="font-medium text-white">Escape Paths</p>
              <ul className="mt-2 space-y-1 text-sm text-zinc-400">
                {social.punishment_hub.escape_paths.map((path) => (
                  <li key={path}>{path}</li>
                ))}
              </ul>
            </div>
          </div>
        </Panel>

        <Panel title="Scenario Lab">
          <div className="space-y-3">
            {social.scenario_lab.slice(0, 4).map((scenario) => (
              <div key={scenario.roster_id} className="surface-muted p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{scenario.team}</p>
                    <p className="mt-1 text-sm text-blue-300">
                      {scenario.summary}
                    </p>
                  </div>
                  <p className="text-sm text-zinc-300">
                    {scenario.playoff_odds}%
                  </p>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-zinc-400">
                  {scenario.path.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Commissioner HQ">
          <div className="grid gap-3 md:grid-cols-2">
            {social.commissioner_hq.quick_actions.map((action) => (
              <button
                key={action.title}
                className="surface-muted p-4 text-left transition hover:bg-white/[0.055]"
              >
                <p className="font-semibold text-white">{action.title}</p>
                <p className="mt-1 text-sm text-zinc-400">
                  {action.description}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="surface-muted p-4">
              <p className="font-medium text-white">Rulebook</p>
              <ul className="mt-2 space-y-1 text-sm text-zinc-400">
                {social.commissioner_hq.rulebook.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
            <div className="surface-muted p-4">
              <p className="font-medium text-white">Open Items</p>
              <ul className="mt-2 space-y-1 text-sm text-zinc-400">
                {social.commissioner_hq.open_items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Panel>

        <Panel title="Weekly Pick'em">
          <p className="text-sm text-zinc-400">{social.weekly_pickem.rules}</p>
          <div className="mt-4 space-y-3">
            {social.weekly_pickem.matchups.slice(0, 5).map((matchup) => (
              <div key={matchup.title} className="surface-muted p-4">
                <p className="font-medium text-white">{matchup.title}</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Suggested pick: {matchup.pick} ({matchup.confidence}%)
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {matchup.options.map((option) => (
                    <span
                      key={option}
                      className="rounded-full border border-white/10 px-3 py-1 text-sm text-zinc-300"
                    >
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Rivalry Center">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {social.rivalry_center.map((rivalry) => (
            <div key={rivalry.name} className="surface-muted p-4">
              <p className="font-semibold text-white">{rivalry.name}</p>
              <p className="mt-1 text-sm text-zinc-400">
                {rivalry.record} / {rivalry.games} game(s) / heat {rivalry.heat}
              </p>
              <p className="mt-2 text-sm text-zinc-500">{rivalry.story}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Team Branding">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {social.team_branding.slice(0, 6).map((brand) => (
            <div
              key={brand.roster_id}
              className="overflow-hidden rounded-xl border border-white/10 bg-black/20"
            >
              <div
                className="h-24"
                style={{
                  background: `linear-gradient(135deg, ${brand.primary_color}, ${brand.secondary_color})`,
                }}
              />
              <div className="p-4">
                <p className="font-semibold text-white">{brand.team}</p>
                <p className="mt-1 text-sm text-blue-300">{brand.identity}</p>
                <p className="mt-2 text-sm text-zinc-400">{brand.tagline}</p>
                <p className="mt-3 text-xs uppercase tracking-wide text-zinc-500">
                  {brand.banner_text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Hall Of Fame">
          <div className="space-y-3">
            {social.hall_of_fame.map((entry) => (
              <div key={entry.title} className="surface-muted p-4">
                <p className="text-sm text-zinc-500">{entry.title}</p>
                <p className="mt-1 font-semibold text-white">{entry.team}</p>
                <p className="mt-1 text-sm text-zinc-400">{entry.description}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Trade Court">
          <div className="surface-muted p-5">
            <p className="font-medium text-white">{social.trade_court.prompt}</p>
            <p className="mt-2 text-sm text-zinc-400">
              {social.trade_court.status}
            </p>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Shareable Graphics">
          <div className="space-y-3">
            {social.share_graphics.map((card) => (
              <div key={`${card.title}-${card.body}`} className="surface-muted p-4">
                <p className="font-semibold text-white">{card.title}</p>
                <p className="mt-1 text-sm text-zinc-400">{card.body}</p>
                <button
                  onClick={() => copyCard(card.title, card.body)}
                  className="mt-3 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
                >
                  Copy caption
                </button>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="surface p-6">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Prompt({ text }: { text: string }) {
  return (
    <div className="surface-muted p-4">
      <p className="text-sm text-zinc-400">{text}</p>
      <button
        onClick={() => copyCard("Trash Talk Prompt", text)}
        className="mt-3 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
      >
        Copy prompt
      </button>
    </div>
  );
}

function copyCard(title: string, body: string) {
  const text = `${title}: ${body}`;

  if (navigator.clipboard) {
    void navigator.clipboard.writeText(text);
  }
}
