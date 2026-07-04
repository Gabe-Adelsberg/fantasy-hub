import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-8 py-4">
        <h1 className="text-2xl font-bold">Fantasy Hub</h1>
      </header>

      <main className="p-8">
        <Outlet />
      </main>
    </div>
  );
}