import { useState } from "react";
import { Link } from "react-router";
import {
  LayoutDashboard, Users, Building2, Settings, Bell, Search,
  Download, ChevronLeft, ChevronRight, ChevronDown, X,
  LogOut, Filter, SlidersHorizontal,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import jhcLogo from "figma:asset/jhc-logo.png";

/* ─── Data ─── */
const METRICS = [
  { label: "Total Applicants", value: "1,240", delta: "+48 this week",  deltaUp: true,  color: "#1D4ED8" },
  { label: "Pending Review",   value: "312",   delta: "24 need action", deltaUp: false, color: "#D97706" },
  { label: "Shortlisted",      value: "87",    delta: "+12 this week",  deltaUp: true,  color: "#16A34A" },
];

type Status = "Shortlisted" | "Pending" | "Rejected" | "Interview";

const CANDIDATES: {
  id: number; name: string; initials: string; title: string;
  exp: string; location: string; flag: string; status: Status;
}[] = [
  { id: 1, name: "Ahmed Al-Rashid",  initials: "AA", title: "Senior UI/UX Designer",   exp: "6+ Yrs", location: "Egypt",        flag: "🇪🇬", status: "Shortlisted" },
  { id: 2, name: "Sarah Smith",      initials: "SS", title: "Operations Manager",       exp: "4+ Yrs", location: "Saudi Arabia", flag: "🇸🇦", status: "Pending"     },
  { id: 3, name: "Mohamed Ali",      initials: "MA", title: "Full-Stack Developer",     exp: "5+ Yrs", location: "Egypt",        flag: "🇪🇬", status: "Shortlisted" },
  { id: 4, name: "Omar Hassan",      initials: "OH", title: "HR Consultant",            exp: "2+ Yrs", location: "Jordan",       flag: "🇯🇴", status: "Rejected"    },
];

const STATUS_CONFIG: Record<Status, { bg: string; text: string; dot: string; label: string }> = {
  Shortlisted: { bg: "#F0FDF4", text: "#16A34A", dot: "#16A34A", label: "Shortlisted" },
  Pending:     { bg: "#FFFBEB", text: "#D97706", dot: "#D97706", label: "Pending Review" },
  Rejected:    { bg: "#F8FAFC", text: "#64748B", dot: "#94A3B8", label: "Rejected"    },
  Interview:   { bg: "#EFF6FF", text: "#1D4ED8", dot: "#1D4ED8", label: "Interview"   },
};

const NAV = [
  { icon: <LayoutDashboard size={18} />, label: "Overview",         path: "/admin" },
  { icon: <Users           size={18} />, label: "Talent Pool",      path: "/admin/talent" },
  { icon: <Building2       size={18} />, label: "Partner Companies",path: "/admin/partners" },
  { icon: <Settings        size={18} />, label: "Settings",         path: "/admin/settings" },
];

const INDUSTRIES  = ["Energy & Oil","Technology","Finance","Healthcare","Real Estate","Telecom","Government","Education","Consulting"];
const EXP_LEVELS  = ["0–2 Years","3–5 Years","6–9 Years","10+ Years"];
const LOCATIONS   = ["Egypt","Saudi Arabia","UAE","Qatar","Kuwait","Bahrain","Oman","Jordan"];

/* ─── Sub-components ─── */
function StatusBadge({ status }: { status: Status }) {
  const c = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: c.bg, color: c.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}

function FilterDropdown({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all"
        style={{
          borderColor: value ? "#1D4ED8" : "#E2E8F0",
          color: value ? "#1D4ED8" : "#64748B",
          background: value ? "#EFF6FF" : "#ffffff",
        }}
      >
        <Filter size={13} />
        {value || label}
        <ChevronDown size={13} />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-20 rounded-xl overflow-hidden"
          style={{ background: "#ffffff", border: "1px solid #E2E8F0", minWidth: "180px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt === value ? "" : opt); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm transition-colors"
              style={{
                background: opt === value ? "#EFF6FF" : "transparent",
                color: opt === value ? "#1D4ED8" : "#0F172A",
                fontWeight: opt === value ? 600 : 400,
              }}
              onMouseEnter={(e) => { if (opt !== value) (e.currentTarget as HTMLElement).style.background = "#F8FAFC"; }}
              onMouseLeave={(e) => { if (opt !== value) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ MAIN PAGE ═══════════════════ */
export default function AdminDashboardPage() {
  const [search,   setSearch]   = useState("");
  const [industry, setIndustry] = useState("");
  const [expLevel, setExpLevel] = useState("");
  const [location, setLocation] = useState("");
  const [page,     setPage]     = useState(1);
  const activeNav = "Talent Pool";

  const clearFilters = () => { setIndustry(""); setExpLevel(""); setLocation(""); setSearch(""); };
  const hasFilters   = industry || expLevel || location || search;

  const filtered = CANDIDATES.filter((c) => {
    const q = search.toLowerCase();
    const matchQ = !q || c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.location.toLowerCase().includes(q);
    const matchL = !location || c.location === location;
    return matchQ && matchL;
  });

  return (
    <div
      style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#F8F9FA", minHeight: "100vh", display: "flex" }}
    >
      {/* ══════════ LEFT SIDEBAR ══════════ */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0"
        style={{ width: "240px", background: "#0B1F4D", height: "100vh", position: "sticky", top: 0, borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <ImageWithFallback src={jhcLogo} alt="JHC" className="h-8 w-auto object-contain" style={{ filter: "brightness(0) invert(1)" }} />
          <div className="text-xs mt-1.5 font-medium" style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>ADMIN PORTAL</div>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {NAV.map((item) => {
            const active = item.label === activeNav;
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
                <span style={{ color: active ? "#60A5FA" : "rgba(255,255,255,0.4)" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Admin profile */}
        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: "#1D4ED8", color: "#60A5FA" }}>
              JA
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: "#ffffff" }}>JHC Admin</div>
              <div className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>admin@jhc-group.com</div>
            </div>
            <button className="p-1.5 rounded-lg transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ffffff")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)")}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Top Header Bar ── */}
        <header
          className="flex-shrink-0 flex items-center gap-4 px-6 lg:px-8 bg-white"
          style={{ height: "64px", borderBottom: "1px solid #E2E8F0" }}
        >
          <div className="flex-1">
            <h1 className="font-bold" style={{ fontSize: "1.0625rem", color: "#0B1F4D", letterSpacing: "-0.01em" }}>
              Talent Pool Management
            </h1>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, title, or skills..."
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm"
              style={{ border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#0F172A", outline: "none", fontFamily: "inherit" }}
              onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
              onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={13} style={{ color: "#94A3B8" }} />
              </button>
            )}
          </div>

          {/* Notification */}
          <button
            className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ border: "1px solid #E2E8F0", background: "#ffffff" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#0B1F4D")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0")}
          >
            <Bell size={16} style={{ color: "#64748B" }} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: "#1D4ED8" }} />
          </button>
        </header>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 flex flex-col gap-6">

          {/* ── Metrics Row ── */}
          <div className="grid sm:grid-cols-3 gap-4">
            {METRICS.map((m) => (
              <div
                key={m.label}
                className="flex flex-col gap-3 rounded-xl p-5 bg-white"
                style={{ border: "1px solid #E2E8F0" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#94A3B8" }}>{m.label}</span>
                  <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 900, color: "#0B1F4D", lineHeight: 1, letterSpacing: "-0.025em" }}>
                  {m.value}
                </div>
                <div className="text-xs font-medium" style={{ color: m.deltaUp ? "#16A34A" : "#D97706" }}>
                  {m.deltaUp ? "↑" : "●"} {m.delta}
                </div>
              </div>
            ))}
          </div>

          {/* ── Table Card ── */}
          <div className="rounded-xl bg-white flex flex-col" style={{ border: "1px solid #E2E8F0" }}>

            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b" style={{ borderColor: "#E2E8F0" }}>
              <SlidersHorizontal size={15} style={{ color: "#64748B" }} />
              <FilterDropdown label="Industry"    options={INDUSTRIES} value={industry} onChange={setIndustry} />
              <FilterDropdown label="Experience"  options={EXP_LEVELS} value={expLevel} onChange={setExpLevel} />
              <FilterDropdown label="Location"    options={LOCATIONS}  value={location} onChange={setLocation} />
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors"
                  style={{ borderColor: "#E2E8F0", color: "#64748B" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#0B1F4D"; (e.currentTarget as HTMLElement).style.color = "#0B1F4D"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLElement).style.color = "#64748B"; }}
                >
                  <X size={11} /> Clear Filters
                </button>
              )}
              <div className="ml-auto text-xs" style={{ color: "#94A3B8" }}>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                    {["Candidate Name","Job Title","Experience","Location","Status","Actions"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider"
                        style={{ color: "#94A3B8", letterSpacing: "0.08em", background: "#F8FAFC", whiteSpace: "nowrap" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-sm" style={{ color: "#94A3B8" }}>
                        No candidates match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c, i) => (
                      <tr
                        key={c.id}
                        style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F1F5F9" : "none" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#FAFBFC")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                      >
                        {/* Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                              style={{ background: "#EFF6FF", color: "#1D4ED8" }}
                            >
                              {c.initials}
                            </div>
                            <div>
                              <div className="text-sm font-semibold" style={{ color: "#0B1F4D" }}>{c.name}</div>
                              <div className="text-xs" style={{ color: "#94A3B8" }}>ID #{String(c.id).padStart(4, "0")}</div>
                            </div>
                          </div>
                        </td>
                        {/* Title */}
                        <td className="px-6 py-4">
                          <span className="text-sm" style={{ color: "#0F172A" }}>{c.title}</span>
                        </td>
                        {/* Experience */}
                        <td className="px-6 py-4">
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                            style={{ background: "#F1F5F9", color: "#0B1F4D" }}
                          >
                            {c.exp}
                          </span>
                        </td>
                        {/* Location */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm" style={{ color: "#64748B" }}>
                            <span>{c.flag}</span>
                            {c.location}
                          </div>
                        </td>
                        {/* Status */}
                        <td className="px-6 py-4">
                          <StatusBadge status={c.status} />
                        </td>
                        {/* Actions */}
                        <td className="px-6 py-4">
                          <button
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150"
                            style={{ borderColor: "#E2E8F0", color: "#0B1F4D" }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.background = "#0B1F4D";
                              (e.currentTarget as HTMLElement).style.color = "#ffffff";
                              (e.currentTarget as HTMLElement).style.borderColor = "#0B1F4D";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.background = "transparent";
                              (e.currentTarget as HTMLElement).style.color = "#0B1F4D";
                              (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0";
                            }}
                          >
                            <Download size={12} />
                            Download CV
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination Footer ── */}
            <div
              className="flex items-center justify-between px-6 py-4 border-t"
              style={{ borderColor: "#E2E8F0" }}
            >
              <span className="text-xs" style={{ color: "#94A3B8" }}>
                Showing {(page - 1) * 4 + 1}–{Math.min(page * 4, 1240)} of 1,240 candidates
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors border"
                  style={{ borderColor: "#E2E8F0", color: page === 1 ? "#CBD5E1" : "#64748B", cursor: page === 1 ? "not-allowed" : "pointer" }}
                >
                  <ChevronLeft size={14} />
                </button>

                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all border"
                    style={{
                      borderColor: page === n ? "#1D4ED8" : "#E2E8F0",
                      background: page === n ? "#1D4ED8" : "transparent",
                      color: page === n ? "#ffffff" : "#64748B",
                    }}
                  >
                    {n}
                  </button>
                ))}

                <span className="px-1 text-xs" style={{ color: "#CBD5E1" }}>…</span>

                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-colors"
                  style={{ borderColor: "#E2E8F0", color: "#64748B" }}
                  onClick={() => setPage(310)}
                >
                  310
                </button>

                <button
                  onClick={() => setPage((p) => Math.min(310, p + 1))}
                  disabled={page === 310}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors border"
                  style={{ borderColor: "#E2E8F0", color: page === 310 ? "#CBD5E1" : "#64748B", cursor: page === 310 ? "not-allowed" : "pointer" }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
