import { createBrowserRouter, Navigate } from "react-router";
import LandingPage from "./pages/LandingPage";
import TalentNetworkPage from "./pages/TalentNetworkPage";
import AdminEntryPage from "./pages/AdminEntryPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminOverviewPage from "./pages/AdminOverviewPage";
import AdminTalentPage from "./pages/AdminTalentPage";
import AdminAdministratorsPage from "./pages/AdminAdministratorsPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminArticlesPage from "./pages/AdminArticlesPage";
import AdminArticleFormPage from "./pages/AdminArticleFormPage";
import AdminJobsPage from "./pages/AdminJobsPage";
import AdminJobDetailsPage from "./pages/AdminJobDetailsPage";
import AdminJobFormPage from "./pages/AdminJobFormPage";
import AdminJobApplicantsPage from "./pages/AdminJobApplicantsPage";
import ArticlesPage from "./pages/ArticlesPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import CareersPage from "./pages/CareersPage";
import JobDetailPage from "./pages/JobDetailPage";
import JobApplicationPage from "./pages/JobApplicationPage";
import RemoteWorkforcePage from "./pages/services/RemoteWorkforcePage";
import OperationsManagementPage from "./pages/services/OperationsManagementPage";
import RecruitmentPage from "./pages/services/RecruitmentPage";
import ProjectBasedHiringPage from "./pages/services/ProjectBasedHiringPage";
import StrategicConsultingPage from "./pages/services/StrategicConsultingPage";

export const router = createBrowserRouter([
  { path: "/",                   Component: LandingPage       },
  { path: "/talent-network",     Component: TalentNetworkPage },
  { path: "/articles",           Component: ArticlesPage },
  { path: "/articles/:slug",      Component: ArticleDetailPage },
  { path: "/careers",            Component: CareersPage },
  { path: "/careers/:slug",       Component: JobDetailPage },
  { path: "/careers/:slug/apply", Component: JobApplicationPage },
  { path: "/services/remote-workforce", Component: RemoteWorkforcePage },
  { path: "/services/operations-management", Component: OperationsManagementPage },
  { path: "/services/recruitment", Component: RecruitmentPage },
  { path: "/services/project-based-hiring", Component: ProjectBasedHiringPage },
  { path: "/services/strategic-consulting", Component: StrategicConsultingPage },
  { path: "/admin",              Component: AdminEntryPage },
  { path: "/admin/login",        Component: AdminLoginPage },
  { path: "/admin/overview",     Component: AdminOverviewPage  },
  { path: "/admin/talent",       Component: AdminTalentPage    },
  { path: "/admin/articles",     Component: AdminArticlesPage },
  { path: "/admin/articles/new", Component: AdminArticleFormPage },
  { path: "/admin/articles/:id/edit", Component: AdminArticleFormPage },
  { path: "/admin/jobs",         Component: AdminJobsPage },
  { path: "/admin/jobs/new",     Component: AdminJobFormPage },
  { path: "/admin/jobs/:id",     Component: AdminJobDetailsPage },
  { path: "/admin/jobs/:id/edit", Component: AdminJobFormPage },
  { path: "/admin/jobs/:id/applicants", Component: AdminJobApplicantsPage },
  { path: "/admin/administrators", Component: AdminAdministratorsPage },
  { path: "/admin/settings",     Component: AdminSettingsPage  },
  { path: "*",                   Component: () => <Navigate replace to="/" /> },
]);
