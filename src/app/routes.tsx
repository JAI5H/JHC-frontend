import { createBrowserRouter, Navigate } from "react-router";
import LandingPage from "./pages/LandingPage";
import TalentNetworkPage from "./pages/TalentNetworkPage";
import AdminEntryPage from "./pages/AdminEntryPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminOverviewPage from "./pages/AdminOverviewPage";
import AdminTalentPage from "./pages/AdminTalentPage";
import AdminAdministratorsPage from "./pages/AdminAdministratorsPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";

export const router = createBrowserRouter([
  { path: "/",                   Component: LandingPage       },
  { path: "/talent-network",     Component: TalentNetworkPage },
  { path: "/admin",              Component: AdminEntryPage },
  { path: "/admin/login",        Component: AdminLoginPage },
  { path: "/admin/overview",     Component: AdminOverviewPage  },
  { path: "/admin/talent",       Component: AdminTalentPage    },
  { path: "/admin/administrators", Component: AdminAdministratorsPage },
  { path: "/admin/settings",     Component: AdminSettingsPage  },
  { path: "*",                   Component: () => <Navigate replace to="/" /> },
]);
