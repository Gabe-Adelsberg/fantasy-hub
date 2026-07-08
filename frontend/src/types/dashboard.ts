export interface League {
  id?: number;
  name: string;
  sport: string;
  season: number | string;
  status?: string;
}

export interface UserLeague {
  id: number;
  name: string;
  sport: string;
  season: number;
  commissioner_id: number;
  sleeper_league_id: string | null;
  sleeper_user_id?: string | null;
  sleeper_username?: string | null;
  sleeper_roster_id?: number | null;
  sleeper_team_verified?: boolean;
}

export interface PowerRanking {
  rank: number;
  team: string;
  roster_id: number;
  record: string;
  power_score: number;
}

export interface Standing {
  rank: number;
  team: string;
  record: string;
  points_for: number;
  points_against: number;
}

export interface WeekBounds {
  min: number;
  max: number;
}

export interface PlayoffTeam {
  seed: number;
  team: string;
  roster_id: number;
  record: string;
  points_for: number;
  status: "bye" | "playoff" | "bubble" | string;
}

export interface PlayoffPicture {
  playoff_week_start: number;
  regular_season_weeks: number;
  playoff_teams: number;
  bye_count: number;
  championship_week: number;
  is_playoffs: boolean;
  weeks_until_playoffs: number;
  projected_playoff_teams: PlayoffTeam[];
  bubble_teams: PlayoffTeam[];
  bracket: PlayoffRound[];
  performance: PlayoffPerformance[];
}

export interface PlayoffMatchup {
  matchup_id: number;
  team_a: string;
  team_a_roster_id: number | null;
  team_a_points: number;
  team_b: string;
  team_b_roster_id: number | null;
  team_b_points: number;
  winner: string;
  winner_roster_id: number | null;
  margin: number;
}

export interface PlayoffRound {
  week: number;
  round: string;
  matchups: PlayoffMatchup[];
}

export interface PlayoffPerformance {
  roster_id: number;
  team: string;
  playoff_wins: number;
  playoff_losses: number;
  playoff_points: number;
  weeks_played: number;
  average_score: number;
  high_score: number;
}

export interface PulseStoryline {
  title: string;
  description: string;
  team: string | null;
  value: number | null;
}

export interface PulseTeam {
  pulse_rank: number;
  team: string;
  roster_id: number;
  actual_record: string;
  all_play_record: string;
  all_play_win_rate: number;
  luck_delta: number;
  average_score: number;
  high_score: number;
  low_score: number;
  standard_deviation: number;
  label: string;
  label_description: string;
  playoff_odds: number;
  schedule_difficulty: {
    average_opponent_score: number;
    difficulty_rank: number;
    games_tracked: number;
  };
  bench_pain: {
    total_bench_points: number;
    average_bench_points: number;
    worst_week: number | null;
    worst_week_points: number;
    weeks_tracked: number;
  };
  rivalries: Array<{
    opponent: string;
    opponent_roster_id: number;
    wins: number;
    losses: number;
    ties: number;
    points_for: number;
    points_against: number;
    games: number;
  }>;
  power_history: Array<{
    week: number;
    rank: number;
    score: number;
  }>;
  notes: string[];
}

export interface PulseHighlights {
  luckiest_team: PulseTeam | null;
  unluckiest_team: PulseTeam | null;
  most_consistent_team: PulseTeam | null;
  most_volatile_team: PulseTeam | null;
}

export interface LeaguePulse {
  storylines: PulseStoryline[];
  teams: PulseTeam[];
  highlights: PulseHighlights;
  share_cards: Array<{
    title: string;
    body: string;
  }>;
}

export interface SocialHub {
  feed: Array<{
    type: string;
    title: string;
    body: string;
  }>;
  trash_talk_prompts: string[];
  newspaper: {
    headline: string;
    subheadline: string;
    top_story: string;
    villain: string;
    quote: string;
  };
  weekly_awards: Array<{
    title: string;
    winner: string;
  }>;
  polls: Array<{
    question: string;
    options: string[];
  }>;
  manager_profiles: Array<{
    team: string;
    roster_id: number;
    badge: string;
    bio: string;
    trophy_case: string[];
  }>;
  rivalry_spotlight: {
    team: string;
    opponent: string;
    record: string;
    games: number;
    points_for: number;
    points_against: number;
    heat: number;
  };
  predictions: Array<{
    title: string;
    pick: string;
    confidence: number;
    reason: string;
  }>;
  commissioner_tools: string[];
  commissioner_hq: {
    league_name: string;
    quick_actions: Array<{
      title: string;
      description: string;
    }>;
    rulebook: string[];
    open_items: string[];
  };
  season_archive: Array<{
    week: number;
    headline: string;
    summary: string;
  }>;
  share_graphics: Array<{
    title: string;
    body: string;
  }>;
  punishment_tracker: Array<{
    rank: number;
    team: string;
    danger_level: number;
    reason: string;
  }>;
  punishment_hub: {
    title: string;
    leader: {
      rank: number;
      team: string;
      danger_level: number;
      reason: string;
    } | null;
    danger_zone: Array<{
      rank: number;
      team: string;
      danger_level: number;
      reason: string;
    }>;
    escape_paths: string[];
    punishment_history: Array<{
      season: string;
      status: string;
    }>;
  };
  hall_of_fame: Array<{
    title: string;
    team: string;
    description: string;
  }>;
  rivalry_center: Array<{
    name: string;
    team: string;
    opponent: string;
    record: string;
    games: number;
    points_for: number;
    points_against: number;
    heat: number;
    story: string;
  }>;
  weekly_pickem: {
    rules: string;
    leaderboard: Array<{
      manager: string;
      record: string;
      note: string;
    }>;
    matchups: Array<{
      title: string;
      pick: string;
      confidence: number;
      reason: string;
      options: string[];
    }>;
  };
  team_branding: Array<{
    team: string;
    roster_id: number;
    tagline: string;
    primary_color: string;
    secondary_color: string;
    banner_text: string;
    identity: string;
  }>;
  scenario_lab: Array<{
    team: string;
    roster_id: number;
    playoff_odds: number;
    summary: string;
    path: string[];
  }>;
  trade_court: {
    prompt: string;
    status: string;
  };
}

export interface Matchup {
  matchup_id: number;
  team_a: string;
  team_a_points: number;
  team_b: string;
  team_b_points: number;
  winner: string;
  margin: number;
}

export interface WeeklyAwards {
  highest_score: {
    team: string;
    points: number;
  } | null;
  lowest_score: {
    team: string;
    points: number;
  } | null;
  closest_game: {
    winner: {
      team: string;
      points: number;
    };
    loser: {
      team: string;
      points: number;
    };
    margin: number;
  } | null;
  biggest_blowout: {
    winner: {
      team: string;
      points: number;
    };
    loser: {
      team: string;
      points: number;
    };
    margin: number;
  } | null;
}

export interface Dashboard {
  league: League;
  user_team: {
    roster_id: number | null;
    team: string | null;
    display_name: string | null;
    sleeper_user_id: string | null;
    sleeper_username: string | null;
    sleeper_team_verified: boolean;
  } | null;
  members: unknown[];
  matchups: Matchup[];
  standings: Standing[];
  power_rankings: PowerRanking[];
  weekly_awards: WeeklyAwards;
  week: number;
  week_bounds: WeekBounds;
  playoff_picture: PlayoffPicture;
  league_pulse: LeaguePulse;
  social_hub: SocialHub;
}
