export interface League {
  name: string;
  sport: string;
  season: number;
  status?: string;
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
  };
  lowest_score: {
    team: string;
    points: number;
  };
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
  };
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
  };
}

export interface Dashboard {
  league: League;
  members: unknown[];
  matchups: Matchup[];
  standings: Standing[];
  power_rankings: PowerRanking[];
  weekly_awards: WeeklyAwards;
  week: number;
}