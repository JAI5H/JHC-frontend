import { useState } from "react";
import { Link, useLocation } from "react-router";
import { LayoutDashboard, Users, Building2, Settings, LogOut } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { AccountSettingsModal } from "./AccountSettingsModal";
import jhcLogo from "figma:asset/jhc-logo.png";

const NAV = [
  { icon: <LayoutDashboard size={17} />, label: "Overview",          path: "/admin/overview" },
  { icon: <Users           size={17} />, label: "Talent Pool",       path: "/admin/talent"   },
  { icon: <Building2       size={17} />, label: "Partner Companies", path: "/admin/partners" },
  { icon: <Settings        size={17} />, label: "Settings",          path: "/admin/settings" },
];

export function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const { pathname } = useLocation();
  const [showAccountModal, setShowAccountModal] = useState(false);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#F8F9FA", minHeight: "100vh", display: "flex" }}>

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
          {NAV.map((item) => {
            const active = pathname === item.path || (item.path === "/admin/talent" && pathname === "/admin");
            return (
              <Link
                key={item.label}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                style={{
                  background: active ? "rgba(255,255,255,0.1)" : "transparent",
                  color: active ? "#ffffff" : "rgba(255,255,255,0.5)",
                  borderLeft: active ? "2px solid #60A5FA" : "2px solid transparent",
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span style={{ color: active ? "#60A5FA" : "rgba(255,255,255,0.35)" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Admin profile block — click opens Account Settings */}
        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <button
            onClick={() => setShowAccountModal(true)}
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
              <div className="text-sm font-semibold truncate" style={{ color: "#ffffff" }}>JHC Admin</div>
              <div className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>Account Settings</div>
            </div>
            <LogOut size={15} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
          </button>
        </div>
      </aside>

      {/* ── Right: header + content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="flex-shrink-0 flex items-center gap-4 px-6 lg:px-8 bg-white"
          style={{ height: "64px", borderBottom: "1px solid #E2E8F0" }}
        >
          <h1 className="font-bold flex-1" style={{ fontSize: "1.0625rem", color: "#0B1F4D", letterSpacing: "-0.01em" }}>
            {title}
          </h1>
          <Link
            to="/"
            className="text-xs font-medium transition-colors hidden sm:block"
            style={{ color: "#94A3B8" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#0B1F4D")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#94A3B8")}
          >
            ← Back to main site
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Account Settings Modal */}
      {showAccountModal && (
        <AccountSettingsModal onClose={() => setShowAccountModal(false)} />
      )}
    </div>
  );
}
