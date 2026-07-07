import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Trophy } from "lucide-react";

import { useLeagues } from "../../features/leagues/hooks";

export default function TopNav() {
  const location = useLocation();
  const { leagues } = useLeagues();
  const dashboardLeague = leagues.find((league) => league.sleeper_league_id)
    ?? leagues[0];
  const dashboardPath = dashboardLeague
    ? `/leagues/${dashboardLeague.id}/dashboard`
    : "/leagues";
  const items = [
    { icon: LayoutDashboard, label: "Dashboard", to: dashboardPath },
    { icon: Trophy, label: "Leagues", to: "/leagues" },
  ];

  return (
    <header className="nav-surface sticky top-0 z-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow">Fantasy Hub</p>
          <h1 className="text-xl font-semibold tracking-tight text-white">
            League Command Center
          </h1>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => {
                  const dashboardActive =
                    item.label === "Dashboard" &&
                    location.pathname.includes("/dashboard");

                  return [
                    "nav-link",
                    isActive || dashboardActive ? "nav-link-active" : "",
                  ].join(" ");
                }}
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
