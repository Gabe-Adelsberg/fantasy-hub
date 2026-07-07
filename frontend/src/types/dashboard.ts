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
  members: unknown[];
  matchups: Matchup[];
  standings: Standing[];
  power_rankings: PowerRanking[];
  weekly_awards: WeeklyAwards;
  week: number;
  week_bounds: WeekBounds;
  playoff_picture: PlayoffPicture;
  league_pulse: LeaguePulse;
}
