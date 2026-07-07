import { Outlet } from "react-router-dom";
import TopNav from "../components/layout/TopNav";

export default function AppLayout() {
  return (
    <div className="app-shell">
      <TopNav />

      <main className="mx-auto max-w-7xl p-5 md:p-8 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
}
