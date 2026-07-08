import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { verifySleeperTeam } from "../api";
import type { SocialHub } from "@/types/dashboard";

type UserTeam = {
  roster_id: number | null;
  team: string | null;
  display_name: string | null;
  sleeper_username: string | null;
  sleeper_team_verified: boolean;
};

type TeamBrand = SocialHub["team_branding"][number];

type TeamBrandCustomization = Partial<
  Pick<
    TeamBrand,
    | "team"
    | "tagline"
    | "primary_color"
    | "secondary_color"
    | "banner_text"
    | "identity"
  >
> & {
  background_image?: string;
};

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

function brandStorageKey(rosterId?: number | null) {
  return rosterId ? `fantasy-hub:team-brand:${rosterId}` : null;
}

function loadBrandCustomization(
  storageKey: string | null
): TeamBrandCustomization {
  if (!storageKey) {
    return {};
  }

  try {
    const storedValue = window.localStorage.getItem(storageKey);

    return storedValue ? JSON.parse(storedValue) : {};
  } catch {
    return {};
  }
}

function cleanBrandCustomization(
  customization: TeamBrandCustomization
): TeamBrandCustomization {
  return Object.fromEntries(
    Object.entries(customization).filter(([, value]) => value?.trim())
  ) as TeamBrandCustomization;
}

function applyBrandCustomization(
  brand: TeamBrand,
  customization: TeamBrandCustomization
): TeamBrand {
  return {
    ...brand,
    ...cleanBrandCustomization(customization),
  };
}

function brandBackgroundStyle(brand: TeamBrand, image?: string) {
  const gradient = `linear-gradient(135deg, ${brand.primary_color}, ${brand.secondary_color})`;

  if (!image) {
    return { background: gradient };
  }

  return {
    backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.15)), url(${image})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
  };
}

export function SocialHubCard({
  leagueId,
  social: rawSocial,
  userTeam,
}: {
  leagueId: number;
  social?: Partial<SocialHub> | null;
  userTeam?: UserTeam | null;
}) {
  const social = withSocialDefaults(rawSocial);
  const userTeamName = userTeam?.team ?? userTeam?.display_name ?? null;
  const customizationKey = brandStorageKey(userTeam?.roster_id);
  const [brandCustomization, setBrandCustomization] =
    useState<TeamBrandCustomization>(() =>
      loadBrandCustomization(customizationKey)
    );
  const [isBrandEditorOpen, setIsBrandEditorOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isVerifyingTeam, setIsVerifyingTeam] = useState(false);
  const [isTeamVerified, setIsTeamVerified] = useState(
    Boolean(userTeam?.sleeper_team_verified)
  );
  const userBrand = social.team_branding.find(
    (brand) => brand.roster_id === userTeam?.roster_id
  );
  const previewUserBrand = userBrand
    ? applyBrandCustomization(userBrand, brandCustomization)
    : null;
  const teamBranding = useMemo(
    () =>
      social.team_branding
        .map((brand) =>
          brand.roster_id === userTeam?.roster_id
            ? applyBrandCustomization(brand, brandCustomization)
            : brand
        )
        .sort((a, b) => {
          if (a.roster_id === userTeam?.roster_id) return -1;
          if (b.roster_id === userTeam?.roster_id) return 1;
          return 0;
        }),
    [brandCustomization, social.team_branding, userTeam?.roster_id]
  );
  const rivalryCenter = [...social.rivalry_center].sort((a, b) => {
    const aIsUser =
      userTeamName !== null &&
      (a.team === userTeamName || a.opponent === userTeamName);
    const bIsUser =
      userTeamName !== null &&
      (b.team === userTeamName || b.opponent === userTeamName);

    if (aIsUser && !bIsUser) return -1;
    if (!aIsUser && bIsUser) return 1;
    return 0;
  });

  useEffect(() => {
    setBrandCustomization(loadBrandCustomization(customizationKey));
  }, [customizationKey]);

  useEffect(() => {
    setIsTeamVerified(Boolean(userTeam?.sleeper_team_verified));
  }, [userTeam?.sleeper_team_verified]);

  function updateBrandCustomization(
    field: keyof TeamBrandCustomization,
    value: string
  ) {
    setBrandCustomization((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function saveBrandCustomization() {
    if (!customizationKey) {
      return;
    }

    if (!isTeamVerified) {
      setVerificationMessage("Verify this Sleeper team before saving changes.");
      return;
    }

    window.localStorage.setItem(
      customizationKey,
      JSON.stringify(cleanBrandCustomization(brandCustomization))
    );
    setBrandCustomization(cleanBrandCustomization(brandCustomization));
  }

  function resetBrandCustomization() {
    if (customizationKey) {
      window.localStorage.removeItem(customizationKey);
    }

    setBrandCustomization({});
  }

  function uploadBrandImage(file: File | null) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      return;
    }

    if (file.size > 1_500_000) {
      window.alert("Please choose an image under 1.5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateBrandCustomization("background_image", reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function openBrandEditor() {
    setIsBrandEditorOpen(true);

    if (!verificationCode) {
      setVerificationCode(
        `FH-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
      );
    }
  }

  function getVerificationError(error: unknown) {
    if (typeof error === "object" && error !== null && "response" in error) {
      const response = (error as { response?: { data?: { detail?: string } } })
        .response;

      return response?.data?.detail ?? "Could not verify this Sleeper team.";
    }

    return "Could not verify this Sleeper team.";
  }

  async function verifyTeam() {
    if (!verificationCode || isVerifyingTeam) {
      return;
    }

    setIsVerifyingTeam(true);
    setVerificationMessage("");

    try {
      const token = localStorage.getItem("token") ?? "";
      await verifySleeperTeam(leagueId, verificationCode, token);
      setIsTeamVerified(true);
      setVerificationMessage("Team verified. You can save brand changes now.");
    } catch (error) {
      setVerificationMessage(getVerificationError(error));
    } finally {
      setIsVerifyingTeam(false);
    }
  }

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
          {rivalryCenter.map((rivalry) => (
            <div key={rivalry.name} className="surface-muted p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-white">{rivalry.name}</p>
                {userTeamName &&
                  (rivalry.team === userTeamName ||
                    rivalry.opponent === userTeamName) && (
                    <span className="rounded-full border border-blue-400/30 px-2 py-1 text-xs text-blue-200">
                      Yours
                    </span>
                  )}
              </div>
              <p className="mt-1 text-sm text-zinc-400">
                {rivalry.record} / {rivalry.games} game(s) / heat {rivalry.heat}
              </p>
              <p className="mt-2 text-sm text-zinc-500">{rivalry.story}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Team Branding">
        {previewUserBrand ? (
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-blue-400/20 bg-blue-500/[0.06] p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-white">
                {isTeamVerified ? "Team verified" : "Verify and customize"}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Edit your team name, colors, banner, and background image from
                a focused pop-up.
              </p>
            </div>
            <button
              onClick={openBrandEditor}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Customize brand
            </button>
          </div>
        ) : (
          <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-medium text-white">Connect your Sleeper team</p>
            <p className="mt-1 text-sm text-zinc-400">
              Once your Sleeper account is matched to a roster, your team brand
              will be customizable here.
            </p>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {teamBranding.slice(0, 6).map((brand) => (
            <div
              key={brand.roster_id}
              className="overflow-hidden rounded-xl border border-white/10 bg-black/20"
            >
              <div
                className="h-24"
                style={brandBackgroundStyle(
                  brand,
                  brand.roster_id === userTeam?.roster_id
                    ? brandCustomization.background_image
                    : undefined
                )}
              />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-white">{brand.team}</p>
                  {brand.roster_id === userTeam?.roster_id && (
                    <span className="rounded-full border border-blue-400/30 px-2 py-1 text-xs text-blue-200">
                      Your team
                    </span>
                  )}
                </div>
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

      {previewUserBrand && isBrandEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="mt-8 w-full max-w-4xl rounded-xl border border-white/10 bg-zinc-950 p-5 shadow-2xl">
            <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="eyebrow">Team Branding</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">
                  Customize {previewUserBrand.team}
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Verify the Sleeper roster once, then save your custom brand on
                  this device.
                </p>
              </div>
              <button
                onClick={() => setIsBrandEditorOpen(false)}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="space-y-4">
                <div
                  className="rounded-xl border border-white/10 p-5"
                  style={brandBackgroundStyle(
                    previewUserBrand,
                    brandCustomization.background_image
                  )}
                >
                  <p className="text-2xl font-semibold text-white drop-shadow">
                    {previewUserBrand.team}
                  </p>
                  <p className="mt-2 text-sm text-white/85 drop-shadow">
                    {previewUserBrand.banner_text}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        Sleeper team verification
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">
                        Fantasy Hub checks whether Sleeper says your connected
                        account owns this roster. The code below is only a
                        fallback if Sleeper cannot confirm ownership directly.
                      </p>
                    </div>
                    <span
                      className={[
                        "rounded-full border px-2 py-1 text-xs",
                        isTeamVerified
                          ? "border-emerald-400/30 text-emerald-200"
                          : "border-yellow-400/30 text-yellow-200",
                      ].join(" ")}
                    >
                      {isTeamVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                  <div className="mt-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-lg text-white">
                    {verificationCode}
                  </div>
                  <button
                    onClick={verifyTeam}
                    disabled={isTeamVerified || isVerifyingTeam}
                    className="mt-3 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isVerifyingTeam
                      ? "Checking Sleeper..."
                      : isTeamVerified
                        ? "Verified"
                        : "Verify team"}
                  </button>
                  {verificationMessage && (
                    <p className="mt-3 text-sm text-zinc-300">
                      {verificationMessage}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <BrandInput
                  label="Team name"
                  value={brandCustomization.team ?? previewUserBrand.team}
                  onChange={(value) => updateBrandCustomization("team", value)}
                />
                <BrandInput
                  label="Identity"
                  value={
                    brandCustomization.identity ?? previewUserBrand.identity
                  }
                  onChange={(value) =>
                    updateBrandCustomization("identity", value)
                  }
                />
                <BrandInput
                  label="Tagline"
                  value={
                    brandCustomization.tagline ?? previewUserBrand.tagline
                  }
                  onChange={(value) =>
                    updateBrandCustomization("tagline", value)
                  }
                />
                <BrandInput
                  label="Banner text"
                  value={
                    brandCustomization.banner_text ??
                    previewUserBrand.banner_text
                  }
                  onChange={(value) =>
                    updateBrandCustomization("banner_text", value)
                  }
                />
                <BrandInput
                  label="Primary color"
                  type="color"
                  value={
                    brandCustomization.primary_color ??
                    previewUserBrand.primary_color
                  }
                  onChange={(value) =>
                    updateBrandCustomization("primary_color", value)
                  }
                />
                <BrandInput
                  label="Secondary color"
                  type="color"
                  value={
                    brandCustomization.secondary_color ??
                    previewUserBrand.secondary_color
                  }
                  onChange={(value) =>
                    updateBrandCustomization("secondary_color", value)
                  }
                />
                <label className="text-sm text-zinc-400 md:col-span-2">
                  <span>Background image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      uploadBrandImage(event.target.files?.[0] ?? null)
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:text-white"
                  />
                  <span className="mt-1 block text-xs text-zinc-500">
                    Saved on this device. Use a compressed image under 1.5 MB.
                  </span>
                </label>
                {brandCustomization.background_image && (
                  <button
                    onClick={() =>
                      updateBrandCustomization("background_image", "")
                    }
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white md:col-span-2"
                  >
                    Remove background image
                  </button>
                )}
                <div className="flex flex-wrap gap-3 md:col-span-2">
                  <button
                    onClick={saveBrandCustomization}
                    disabled={!isTeamVerified}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Save brand
                  </button>
                  <button
                    onClick={resetBrandCustomization}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

function BrandInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "color";
}) {
  return (
    <label className="text-sm text-zinc-400">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={[
          "mt-1 w-full rounded-lg border border-white/10 bg-black/30 text-white outline-none transition focus:border-blue-400",
          type === "color" ? "h-11 px-2 py-1" : "px-3 py-2",
        ].join(" ")}
      />
    </label>
  );
}

function copyCard(title: string, body: string) {
  const text = `${title}: ${body}`;

  if (navigator.clipboard) {
    void navigator.clipboard.writeText(text);
  }
}
