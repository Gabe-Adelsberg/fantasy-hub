import { LayoutDashboard, Trophy, BarChart3, Settings } from "lucide-react";

export default function Sidebar() {
  const items = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: Trophy, label: "Leagues" },
    { icon: BarChart3, label: "Analytics" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">
          Fantasy Hub
        </h1>
      </div>

      <nav className="space-y-2 px-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}