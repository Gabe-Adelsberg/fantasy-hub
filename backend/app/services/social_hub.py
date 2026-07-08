def _top_team(league_pulse: dict) -> dict | None:
    teams = league_pulse.get("teams", [])
    return teams[0] if teams else None


def _award_text(weekly_awards: dict, key: str, fallback: str) -> str:
    award = weekly_awards.get(key)

    if not award:
        return fallback

    return f'{award["team"]} ({award["points"]} pts)'


def _matchup_predictions(matchups: list[dict], league_pulse: dict) -> list[dict]:
    team_lookup = {
        team["team"]: team
        for team in league_pulse.get("teams", [])
    }
    predictions = []

    for matchup in matchups:
        team_a = team_lookup.get(matchup["team_a"])
        team_b = team_lookup.get(matchup["team_b"])
        team_a_odds = team_a.get("playoff_odds", 50) if team_a else 50
        team_b_odds = team_b.get("playoff_odds", 50) if team_b else 50
        pick = matchup["team_a"] if team_a_odds >= team_b_odds else matchup["team_b"]
        confidence = min(abs(team_a_odds - team_b_odds) + 50, 95)

        predictions.append({
            "title": f'{matchup["team_a"]} vs {matchup["team_b"]}',
            "pick": pick,
            "confidence": confidence,
            "reason": "Picked from current Pulse profile and playoff odds.",
        })

    return predictions


def _manager_profiles(league_pulse: dict) -> list[dict]:
    profiles = []

    for team in league_pulse.get("teams", []):
        profiles.append({
            "team": team["team"],
            "roster_id": team["roster_id"],
            "badge": team["label"],
            "bio": team["label_description"],
            "trophy_case": [
                note
                for note in team.get("notes", [])
            ][:2],
        })

    return profiles


def _rivalry_spotlight(league_pulse: dict) -> dict:
    best = None

    for team in league_pulse.get("teams", []):
        for rivalry in team.get("rivalries", []):
            margin = abs(
                rivalry.get("points_for", 0)
                - rivalry.get("points_against", 0)
            )
            candidate = {
                "team": team["team"],
                "opponent": rivalry["opponent"],
                "record": (
                    f'{rivalry["wins"]}-{rivalry["losses"]}'
                    + (f'-{rivalry["ties"]}' if rivalry["ties"] else "")
                ),
                "games": rivalry["games"],
                "points_for": rivalry["points_for"],
                "points_against": rivalry["points_against"],
                "heat": max(100 - margin, 1),
            }

            if best is None or (
                candidate["games"],
                candidate["heat"],
            ) > (
                best["games"],
                best["heat"],
            ):
                best = candidate

    return best or {
        "team": "TBD",
        "opponent": "TBD",
        "record": "0-0",
        "games": 0,
        "points_for": 0,
        "points_against": 0,
        "heat": 0,
    }


def _punishment_tracker(league_pulse: dict) -> list[dict]:
    teams = sorted(
        league_pulse.get("teams", []),
        key=lambda team: (
            team["playoff_odds"],
            team["all_play_win_rate"],
        ),
    )

    return [
        {
            "rank": index,
            "team": team["team"],
            "danger_level": min(100 - team["playoff_odds"], 99),
            "reason": (
                f'{team["playoff_odds"]}% playoff odds, '
                f'{team["all_play_record"]} all-play'
            ),
        }
        for index, team in enumerate(teams[:4], start=1)
    ]


def _punishment_hub(league_pulse: dict) -> dict:
    tracker = _punishment_tracker(league_pulse)
    last_place = tracker[0] if tracker else None

    return {
        "title": "Last-Place Watch",
        "leader": last_place,
        "danger_zone": tracker,
        "escape_paths": [
            "Win this week and gain ground on the closest manager above you.",
            "Outscore the league median to improve the all-play profile.",
            "Avoid a low-score week that locks in punishment danger.",
        ],
        "punishment_history": [
            {
                "season": "Current",
                "status": "Tracking live danger only. Historical punishments can be saved later.",
            }
        ],
    }


def _hall_of_fame(standings: list[dict], league_pulse: dict) -> list[dict]:
    top_team = _top_team(league_pulse)
    most_volatile = league_pulse.get("highlights", {}).get("most_volatile_team")
    most_consistent = league_pulse.get("highlights", {}).get("most_consistent_team")
    leader = standings[0] if standings else None

    entries = []

    if leader:
        entries.append({
            "title": "Current Table Boss",
            "team": leader["team"],
            "description": f'{leader["record"]} with {leader["points_for"]} PF.',
        })

    if top_team:
        entries.append({
            "title": "All-Play Standard",
            "team": top_team["team"],
            "description": f'{top_team["all_play_record"]} in all-play.',
        })

    if most_consistent:
        entries.append({
            "title": "Metronome Manager",
            "team": most_consistent["team"],
            "description": f'{most_consistent["standard_deviation"]} volatility.',
        })

    if most_volatile:
        entries.append({
            "title": "Chaos Trophy",
            "team": most_volatile["team"],
            "description": f'{most_volatile["standard_deviation"]} volatility.',
        })

    return entries


def _commissioner_hq(league_info: dict, playoff_picture: dict) -> dict:
    return {
        "league_name": league_info.get("name", "League"),
        "quick_actions": [
            {
                "title": "Post announcement",
                "description": "Share a league note, weekly reminder, or ruling.",
            },
            {
                "title": "Start rule vote",
                "description": "Create a vote for scoring, playoff, or keeper changes.",
            },
            {
                "title": "Track dues",
                "description": "Mark paid/unpaid managers and export reminders.",
            },
            {
                "title": "Record punishment",
                "description": "Save the last-place punishment and completion status.",
            },
        ],
        "rulebook": [
            f'{playoff_picture.get("playoff_teams", 0)} playoff teams',
            f'Playoffs start week {playoff_picture.get("playoff_week_start", "TBD")}',
            f'Championship week {playoff_picture.get("championship_week", "TBD")}',
        ],
        "open_items": [
            "Confirm punishment rules",
            "Confirm dues status",
            "Pin weekly commissioner note",
        ],
    }


def _rivalry_center(league_pulse: dict) -> list[dict]:
    rivalries = []
    seen = set()

    for team in league_pulse.get("teams", []):
        for rivalry in team.get("rivalries", []):
            key = tuple(sorted([team["roster_id"], rivalry["opponent_roster_id"]]))

            if key in seen:
                continue

            seen.add(key)
            margin = abs(
                rivalry.get("points_for", 0)
                - rivalry.get("points_against", 0)
            )
            rivalries.append({
                "name": f'{team["team"]} vs {rivalry["opponent"]}',
                "team": team["team"],
                "opponent": rivalry["opponent"],
                "record": (
                    f'{rivalry["wins"]}-{rivalry["losses"]}'
                    + (f'-{rivalry["ties"]}' if rivalry["ties"] else "")
                ),
                "games": rivalry["games"],
                "points_for": rivalry["points_for"],
                "points_against": rivalry["points_against"],
                "heat": max(100 - margin, 1),
                "story": (
                    "A tight rivalry with plenty of receipts."
                    if margin < 50
                    else "One side has had the louder scoreboard so far."
                ),
            })

    rivalries.sort(
        key=lambda rivalry: (
            rivalry["games"],
            rivalry["heat"],
        ),
        reverse=True,
    )

    return rivalries[:6]


def _weekly_pickem(predictions: list[dict]) -> dict:
    return {
        "rules": "Pick each matchup winner. Confidence is prefilled from Pulse.",
        "leaderboard": [
            {
                "manager": "League average",
                "record": "0-0",
                "note": "Live user picks can be stored once voting is connected.",
            }
        ],
        "matchups": [
            {
                **prediction,
                "options": [
                    option.strip()
                    for option in prediction["title"].split(" vs ")
                ],
            }
            for prediction in predictions
        ],
    }


def _team_branding(league_pulse: dict) -> list[dict]:
    palettes = [
        ["#60a5fa", "#22d3ee"],
        ["#a78bfa", "#f472b6"],
        ["#34d399", "#facc15"],
        ["#fb7185", "#f97316"],
        ["#38bdf8", "#818cf8"],
    ]
    branding = []

    for index, team in enumerate(league_pulse.get("teams", [])):
        palette = palettes[index % len(palettes)]
        branding.append({
            "team": team["team"],
            "roster_id": team["roster_id"],
            "tagline": f'{team["label"]}: {team["label_description"]}',
            "primary_color": palette[0],
            "secondary_color": palette[1],
            "banner_text": (
                f'{team["team"]} / {team["actual_record"]} / '
                f'{team["playoff_odds"]}% playoff odds'
            ),
            "identity": team["label"],
        })

    return branding


def _scenario_lab(league_pulse: dict, playoff_picture: dict) -> list[dict]:
    playoff_cutoff = playoff_picture.get("playoff_teams", 6)
    scenarios = []

    for team in league_pulse.get("teams", []):
        odds = team["playoff_odds"]

        if team["pulse_rank"] <= playoff_cutoff:
            summary = "Protect the seed."
            path = [
                "Win the next matchup.",
                "Keep all-play rank inside the playoff cut line.",
                "Avoid a low-score volatility week.",
            ]
        elif odds >= 35:
            summary = "Bubble path is alive."
            path = [
                "Win this week.",
                "Outscore one current playoff team.",
                "Get one loss from a nearby bubble rival.",
            ]
        else:
            summary = "Needs chaos."
            path = [
                "Win out or close to it.",
                "Post top-half weekly scores.",
                "Hope two bubble teams stumble.",
            ]

        scenarios.append({
            "team": team["team"],
            "roster_id": team["roster_id"],
            "playoff_odds": odds,
            "summary": summary,
            "path": path,
        })

    return scenarios


def build_social_hub(
    league_info: dict,
    week: int,
    standings: list[dict],
    matchups: list[dict],
    weekly_awards: dict,
    league_pulse: dict,
    playoff_picture: dict,
) -> dict:
    top_team = _top_team(league_pulse)
    rivalry = _rivalry_spotlight(league_pulse)
    storylines = league_pulse.get("storylines", [])
    predictions = _matchup_predictions(matchups, league_pulse)

    feed = [
        {
            "type": "newspaper",
            "title": f'Week {week} front page is live',
            "body": (
                f'{top_team["team"]} owns the strongest Pulse profile right now.'
                if top_team
                else "The league is waiting for a new main character."
            ),
        },
        {
            "type": "rivalry",
            "title": "Rivalry spotlight",
            "body": (
                f'{rivalry["team"]} vs {rivalry["opponent"]} has '
                f'{rivalry["games"]} tracked game(s).'
            ),
        },
        *[
            {
                "type": "storyline",
                "title": storyline["title"],
                "body": storyline["description"],
            }
            for storyline in storylines[:3]
        ],
    ]

    return {
        "feed": feed,
        "trash_talk_prompts": [
            "Who is the most fraudulent contender this week?",
            "Which manager deserves an apology from the schedule?",
            "What matchup should be flexed into prime time?",
        ],
        "newspaper": {
            "headline": (
                f'{top_team["team"]} Sets The Tone'
                if top_team
                else f'{league_info.get("name", "The league")} Enters Week {week}'
            ),
            "subheadline": (
                f'Week {week} clubhouse report for {league_info.get("name", "your league")}.'
            ),
            "top_story": storylines[0]["description"] if storylines else "No storylines yet.",
            "villain": (
                league_pulse.get("highlights", {})
                .get("luckiest_team", {})
                .get("team", "TBD")
            ),
            "quote": "The standings say one thing. The group chat says another.",
        },
        "weekly_awards": [
            {
                "title": "Main Character",
                "winner": _award_text(weekly_awards, "highest_score", "TBD"),
            },
            {
                "title": "Barely Survived",
                "winner": (
                    weekly_awards.get("closest_game", {})
                    .get("winner", {})
                    .get("team", "TBD")
                ),
            },
            {
                "title": "Group Chat Silence",
                "winner": _award_text(weekly_awards, "lowest_score", "TBD"),
            },
        ],
        "polls": [
            {
                "question": "Who wins the league if the season ended today?",
                "options": [
                    team["team"]
                    for team in league_pulse.get("teams", [])[:4]
                ],
            },
            {
                "question": "Which label is most accurate?",
                "options": ["Fraud Watch", "Juggernaut", "Sleeping Giant"],
            },
        ],
        "manager_profiles": _manager_profiles(league_pulse),
        "rivalry_spotlight": rivalry,
        "predictions": predictions,
        "commissioner_tools": [
            "Post weekly announcement",
            "Start rule vote",
            "Track dues",
            "Record league punishment",
        ],
        "commissioner_hq": _commissioner_hq(league_info, playoff_picture),
        "season_archive": [
            {
                "week": week,
                "headline": storylines[0]["title"] if storylines else "Week logged",
                "summary": storylines[0]["description"] if storylines else "No summary yet.",
            }
        ],
        "share_graphics": [
            *league_pulse.get("share_cards", []),
            {
                "title": "Playoff Race",
                "body": (
                    f'{playoff_picture.get("weeks_until_playoffs", 0)} week(s) '
                    "until the playoff picture locks in."
                ),
            },
        ],
        "punishment_tracker": _punishment_tracker(league_pulse),
        "punishment_hub": _punishment_hub(league_pulse),
        "hall_of_fame": _hall_of_fame(standings, league_pulse),
        "rivalry_center": _rivalry_center(league_pulse),
        "weekly_pickem": _weekly_pickem(predictions),
        "team_branding": _team_branding(league_pulse),
        "scenario_lab": _scenario_lab(league_pulse, playoff_picture),
        "trade_court": {
            "prompt": "Submit a trade and let the league vote who won.",
            "status": "Ready for league votes once trade data is connected.",
        },
    }
