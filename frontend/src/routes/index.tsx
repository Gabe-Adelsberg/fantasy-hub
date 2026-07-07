import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "../layouts/AppLayout";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import TeamDetailPage from "../features/dashboard/pages/TeamDetailPage";
import { LoginPage } from "../features/auth/LoginPage";
import LeaguesPage from "../features/leagues/pages/LeaguesPage";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/leagues" replace />} />
            <Route path="/leagues" element={<LeaguesPage />} />
            <Route
              path="/leagues/:leagueId/dashboard"
              element={<DashboardPage />}
            />
            <Route
              path="/leagues/:leagueId/teams/:rosterId"
              element={<TeamDetailPage />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
