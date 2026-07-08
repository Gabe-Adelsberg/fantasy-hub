from pydantic import BaseModel


class LeagueSummary(BaseModel):
    name: str | None = None
    sport: str | None = None
    season: int | str | None = None
    status: str | None = None


class MemberSummary(BaseModel):
    user_id: str | None = None
    display_name: str | None = None


class MatchupSummary(BaseModel):
    matchup_id: int
    team_a: str
    team_a_points: float
    team_b: str
    team_b_points: float
    winner: str
    margin: float


class StandingSummary(BaseModel):
    rank: int
    team: str
    record: str
    points_for: float
    points_against: float


class PowerRankingComponents(BaseModel):
    win_percentage: float
    points_for: float
    points_against: float
    recent_week: float
    luck_adjustment: float


class PowerRankingSummary(BaseModel):
    rank: int
    team: str
    roster_id: int
    record: str
    power_score: float
    components: PowerRankingComponents


class AwardTeam(BaseModel):
    team: str
    points: float


class GameAward(BaseModel):
    winner: AwardTeam
    loser: AwardTeam
    margin: float


class WeeklyAwardsSummary(BaseModel):
    highest_score: AwardTeam | None = None
    lowest_score: AwardTeam | None = None
    closest_game: GameAward | None = None
    biggest_blowout: GameAward | None = None


class WeekBounds(BaseModel):
    min: int
    max: int


class PlayoffTeamSummary(BaseModel):
    seed: int
    team: str
    roster_id: int
    record: str
    points_for: float
    status: str


class PlayoffMatchupSummary(BaseModel):
    matchup_id: int
    team_a: str
    team_a_roster_id: int | None = None
    team_a_points: float
    team_b: str
    team_b_roster_id: int | None = None
    team_b_points: float
    winner: str
    winner_roster_id: int | None = None
    margin: float


class PlayoffRoundSummary(BaseModel):
    week: int
    round: str
    matchups: list[PlayoffMatchupSummary]


class PlayoffPerformanceSummary(BaseModel):
    roster_id: int
    team: str
    playoff_wins: int
    playoff_losses: int
    playoff_points: float
    weeks_played: int
    average_score: float
    high_score: float


class PlayoffPictureSummary(BaseModel):
    playoff_week_start: int
    regular_season_weeks: int
    playoff_teams: int
    bye_count: int
    championship_week: int
    is_playoffs: bool
    weeks_until_playoffs: int
    projected_playoff_teams: list[PlayoffTeamSummary]
    bubble_teams: list[PlayoffTeamSummary]
    bracket: list[PlayoffRoundSummary]
    performance: list[PlayoffPerformanceSummary]


class PulseStorylineSummary(BaseModel):
    title: str
    description: str
    team: str | None = None
    value: float | None = None


class PulseTeamSummary(BaseModel):
    pulse_rank: int
    team: str
    roster_id: int
    actual_record: str
    all_play_record: str
    all_play_win_rate: float
    luck_delta: float
    average_score: float
    high_score: float
    low_score: float
    standard_deviation: float
    label: str
    label_description: str
    playoff_odds: int
    schedule_difficulty: dict
    bench_pain: dict
    rivalries: list[dict]
    power_history: list[dict]
    notes: list[str]


class PulseHighlightsSummary(BaseModel):
    luckiest_team: PulseTeamSummary | None = None
    unluckiest_team: PulseTeamSummary | None = None
    most_consistent_team: PulseTeamSummary | None = None
    most_volatile_team: PulseTeamSummary | None = None


class LeaguePulseSummary(BaseModel):
    storylines: list[PulseStorylineSummary]
    teams: list[PulseTeamSummary]
    highlights: PulseHighlightsSummary
    share_cards: list[dict]


class SocialHubSummary(BaseModel):
    feed: list[dict]
    trash_talk_prompts: list[str]
    newspaper: dict
    weekly_awards: list[dict]
    polls: list[dict]
    manager_profiles: list[dict]
    rivalry_spotlight: dict
    predictions: list[dict]
    commissioner_tools: list[str]
    season_archive: list[dict]
    share_graphics: list[dict]
    punishment_tracker: list[dict]
    hall_of_fame: list[dict]
    trade_court: dict


class DashboardResponse(BaseModel):
    league: LeagueSummary
    members: list[MemberSummary]
    matchups: list[MatchupSummary]
    standings: list[StandingSummary]
    power_rankings: list[PowerRankingSummary]
    weekly_awards: WeeklyAwardsSummary
    week: int
    week_bounds: WeekBounds
    playoff_picture: PlayoffPictureSummary
    league_pulse: LeaguePulseSummary
    social_hub: SocialHubSummary
