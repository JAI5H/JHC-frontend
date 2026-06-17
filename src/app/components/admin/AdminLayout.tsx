import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { LayoutDashboard, Users, Settings, LogOut, Menu, X } from "lucide-react";
import { ImageWithFallback } from "../shared/ImageWithFallback";
import {
  clearAdminSession,
  clearAdminSessionAndRedirect,
  getAdminSession,
  isSuperAdmin,
  updateAdminSession,
} from "./adminSession";
import jhcLogo from "../../../imgs/logo.png";
import { logoutAdmin } from "../../../services/api/authApi";
import { getSystemSettings } from "../../../services/api/settingsApi";

const NAV = [
  { icon: <LayoutDashboard size={17} />, label: "Overview",          path: "/admin/overview" },
  { icon: <Users           size={17} />, label: "Talent Pool",       path: "/admin/talent"   },
  { icon: <Users           size={17} />, label: "Administrator Management", path: "/admin/administrators" },
  { icon: <Settings        size={17} />, label: "Settings",          path: "/admin/settings" },
];

export function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const session = getAdminSession();
  const superAdmin = session ? isSuperAdmin(session.role) : false;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileAccountMenuOpen, setMobileAccountMenuOpen] = useState(false);
  const [resolvedSessionTimeoutMinutes, setResolvedSessionTimeoutMinutes] = useState<number | null>(
    session?.sessionTimeoutMinutes ?? null,
  );

  const visibleNav = NAV.filter((item) => superAdmin || item.path !== "/admin/administrators");

  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
    setMobileAccountMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleWindowClick = () => {
      setAccountMenuOpen(false);
      setMobileAccountMenuOpen(false);
    };

    window.addEventListener("click", handleWindowClick);
    return () => window.removeEventListener("click", handleWindowClick);
  }, []);

  useEffect(() => {
    const previousLang = document.documentElement.lang;
    const previousDir = document.documentElement.dir;

    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";

    return () => {
      document.documentElement.lang = previousLang;
      document.documentElement.dir = previousDir;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!session || resolvedSessionTimeoutMinutes !== null) {
      return () => {
        active = false;
      };
    }

    const loadSessionTimeout = async () => {
      try {
        const settings = await getSystemSettings();
        if (!active) return;

        setResolvedSessionTimeoutMinutes(settings.sessionTimeoutMinutes);
        updateAdminSession({ sessionTimeoutMinutes: settings.sessionTimeoutMinutes });
      } catch {
        if (!active) return;

        setResolvedSessionTimeoutMinutes(30);
        updateAdminSession({ sessionTimeoutMinutes: 30 });
      }
    };

    void loadSessionTimeout();

    return () => {
      active = false;
    };
  }, [resolvedSessionTimeoutMinutes, session]);

  useEffect(() => {
    if (!session || !resolvedSessionTimeoutMinutes) return;

    const timeoutMs = resolvedSessionTimeoutMinutes * 60 * 1000;
    let idleTimer: number | undefined;

    const handleSessionTimeout = () => {
      clearAdminSessionAndRedirect();
    };

    const resetIdleTimer = () => {
      if (idleTimer) {
        window.clearTimeout(idleTimer);
      }

      idleTimer = window.setTimeout(handleSessionTimeout, timeoutMs);
    };

    const activityEvents: Array<keyof WindowEventMap> = ["mousemove", "keydown", "click", "scroll"];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetIdleTimer, { passive: true });
    });

    resetIdleTimer();

    return () => {
      if (idleTimer) {
        window.clearTimeout(idleTimer);
      }

      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetIdleTimer);
      });
    };
  }, [resolvedSessionTimeoutMinutes, session]);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch {
      // Clear local auth state even if the backend session is already invalid.
    } finally {
      clearAdminSession();
      setAccountMenuOpen(false);
      setMobileAccountMenuOpen(false);
      setMobileMenuOpen(false);
      navigate("/admin/login", { replace: true });
    }
  };

  if (!session) {
    return <Navigate replace to="/admin/login" />;
  }

  if (!superAdmin && pathname === "/admin/administrators") {
    return <Navigate replace to="/admin/overview" />;
  }

  const mobileNavPanel = (
    <div
      className="border-b bg-white lg:hidden"
      style={{ borderColor: "#E2E8F0" }}
    >
      <div className="max-h-[calc(100svh-64px)] overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-2">
          {visibleNav.map((item) => {
            const active = pathname === item.path || (item.path === "/admin/talent" && pathname === "/admin");

            return (
              <Link
                key={item.label}
                to={item.path}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-150"
                style={{
                  background: active ? "#EFF6FF" : "transparent",
                  color: active ? "#0B1F4D" : "#64748B",
                  border: active ? "1px solid #BFDBFE" : "1px solid transparent",
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span style={{ color: active ? "#1D4ED8" : "#94A3B8" }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 border-t pt-6" style={{ borderColor: "#E2E8F0" }}>
          <Link
            to="/"
            className="flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-colors"
            style={{ color: "#0B1F4D", background: "#F8FAFC" }}
            onClick={() => setMobileMenuOpen(false)}
          >
            ← Back to Main Site
          </Link>
        </div>

        <div className="mt-6 border-t pt-6" style={{ borderColor: "#E2E8F0" }}>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setMobileAccountMenuOpen((prev) => !prev);
            }}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl p-2 text-left transition-colors"
            style={{ background: "transparent", border: "none", cursor: "pointer", outline: "none" }}
          >
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold"
              style={{ background: "#1D4ED8", color: "#60A5FA" }}
            >
              JA
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold" style={{ color: "#0B1F4D" }}>{session.name}</div>
              <div className="truncate text-xs" style={{ color: "#94A3B8" }}>Account Actions</div>
            </div>
            <LogOut size={15} style={{ color: "#94A3B8", flexShrink: 0 }} />
          </button>

          {mobileAccountMenuOpen && (
            <div
              className="relative z-10 mt-3 rounded-xl border p-2"
              style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                style={{ color: "#0B1F4D", background: "transparent", border: "none", cursor: "pointer" }}
                onClick={(event) => {
                  event.stopPropagation();
                  void handleLogout();
                }}
              >
                <LogOut size={14} style={{ color: "#1D4ED8" }} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div dir="ltr" lang="en" style={{ fontFamily: "'Sora', system-ui, sans-serif", background: "#F8F9FA", minHeight: "100vh", display: "flex" }}>

      {/* ── Fixed Left Sidebar ── */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0"
        style={{ width: "240px", background: "#0B1F4D", height: "100vh", position: "sticky", top: 0, borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Logo area */}
        <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <ImageWithFallback src={jhcLogo} alt="JHC" className="h-8 w-auto object-contain" style={{ filter: "brightness(0) invert(1)" }} />
          <div className="text-xs mt-1.5 font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Admin Portal</div>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {visibleNav.map((item) => {
            const active = pathname === item.path || (item.path === "/admin/talent" && pathname === "/admin");
            return (
              <Link
                key={item.label}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200"
                style={{
                  background: active ? "rgba(37, 99, 235, 0.32)" : "transparent",
                  color: active ? "#ffffff" : "rgba(255,255,255,0.5)",
                  fontWeight: active ? 600 : 500,
                  borderRadius: "16px",
                  border: active ? "1px solid rgba(147, 197, 253, 0.35)" : "1px solid transparent",
                  boxShadow: active ? "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(191,219,254,0.04)" : "none",
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span style={{ color: active ? "#ffffff" : "rgba(255,255,255,0.35)" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Admin profile block — click opens account actions */}
        <div className="relative p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <button
            onClick={(event) => {
              event.stopPropagation();
              setAccountMenuOpen((prev) => !prev);
            }}
            className="w-full flex items-center gap-3 rounded-xl p-2 transition-colors text-left"
            style={{ background: "transparent", border: "none", cursor: "pointer", outline: "none" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
              style={{ background: "#1D4ED8", color: "#60A5FA" }}
            >
              JA
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: "#ffffff" }}>{session.name}</div>
              <div className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>Account Actions</div>
            </div>
            <LogOut size={15} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
          </button>

          {accountMenuOpen && (
            <div
              className="absolute inset-x-4 bottom-[72px] rounded-xl border p-2"
              style={{ background: "#102556", borderColor: "rgba(255,255,255,0.08)", boxShadow: "0 14px 30px rgba(3,10,30,0.35)" }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                style={{ color: "#ffffff", background: "transparent", border: "none", cursor: "pointer" }}
                onClick={() => {
                  void handleLogout();
                }}
              >
                <LogOut size={14} style={{ color: "#60A5FA" }} />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Right: header + content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="relative flex-shrink-0 bg-white"
          style={{ height: "64px", borderBottom: "1px solid #E2E8F0" }}
        >
          <div className="flex h-full items-center gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors lg:hidden"
                style={{ color: "#0B1F4D", background: mobileMenuOpen ? "#EFF6FF" : "transparent" }}
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label="Toggle admin navigation"
                aria-expanded={mobileMenuOpen}
              >
                <span className="relative flex h-5 w-5 items-center justify-center">
                  <Menu
                    size={20}
                    className={`absolute transition-all duration-200 ${mobileMenuOpen ? "scale-75 opacity-0" : "scale-100 opacity-100"}`}
                  />
                  <X
                    size={20}
                    className={`absolute transition-all duration-200 ${mobileMenuOpen ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
                  />
                </span>
              </button>
              <h1 className="min-w-0 flex-1 truncate font-bold" style={{ fontSize: "1.0625rem", color: "#0B1F4D", letterSpacing: "-0.01em" }}>
                {title}
              </h1>
            </div>
            <Link
              to="/"
              className="hidden text-xs font-medium transition-colors sm:block"
              style={{ color: "#94A3B8" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#0B1F4D")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#94A3B8")}
            >
              ← Back to main site
            </Link>
          </div>

        </header>

        {mobileMenuOpen && mobileNavPanel}

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
