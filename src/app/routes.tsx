import { createBrowserRouter, Navigate } from "react-router";
import LandingPage from "./pages/LandingPage";
import TalentNetworkPage from "./pages/TalentNetworkPage";
import AdminEntryPage from "./pages/AdminEntryPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminOverviewPage from "./pages/AdminOverviewPage";
import AdminTalentPage from "./pages/AdminTalentPage";
import AdminAdministratorsPage from "./pages/AdminAdministratorsPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import RemoteWorkforcePage from "./pages/services/RemoteWorkforcePage";
import OperationsManagementPage from "./pages/services/OperationsManagementPage";
import RecruitmentPage from "./pages/services/RecruitmentPage";
import ProjectBasedHiringPage from "./pages/services/ProjectBasedHiringPage";
import StrategicConsultingPage from "./pages/services/StrategicConsultingPage";

export const router = createBrowserRouter([
  { path: "/",                   Component: LandingPage       },
  { path: "/talent-network",     Component: TalentNetworkPage },
  { path: "/services/remote-workforce", Component: RemoteWorkforcePage },
  { path: "/services/operations-management", Component: OperationsManagementPage },
  { path: "/services/recruitment", Component: RecruitmentPage },
  { path: "/services/project-based-hiring", Component: ProjectBasedHiringPage },
  { path: "/services/strategic-consulting", Component: StrategicConsultingPage },
  { path: "/admin",              Component: AdminEntryPage },
  { path: "/admin/login",        Component: AdminLoginPage },
  { path: "/admin/overview",     Component: AdminOverviewPage  },
  { path: "/admin/talent",       Component: AdminTalentPage    },
  { path: "/admin/administrators", Component: AdminAdministratorsPage },
  { path: "/admin/settings",     Component: AdminSettingsPage  },
  { path: "*",                   Component: () => <Navigate replace to="/" /> },
]);
