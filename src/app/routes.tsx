import { createBrowserRouter, Navigate } from "react-router";
import LandingPage from "./pages/LandingPage";
import TalentNetworkPage from "./pages/TalentNetworkPage";
import AdminOverviewPage from "./pages/AdminOverviewPage";
import AdminTalentPage from "./pages/AdminTalentPage";
import AdminPartnersPage from "./pages/AdminPartnersPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";

export const router = createBrowserRouter([
  { path: "/",                   Component: LandingPage       },
  { path: "/talent-network",     Component: TalentNetworkPage },
  { path: "/admin",              element: <Navigate to="/admin/overview" replace /> },
  { path: "/admin/overview",     Component: AdminOverviewPage  },
  { path: "/admin/talent",       Component: AdminTalentPage    },
  { path: "/admin/partners",     Component: AdminPartnersPage  },
  { path: "/admin/settings",     Component: AdminSettingsPage  },
]);
