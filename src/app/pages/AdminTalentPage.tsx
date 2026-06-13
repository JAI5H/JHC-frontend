import { useState } from "react";
import { Search, Download, ChevronLeft, ChevronRight, Filter, SlidersHorizontal, ChevronDown, X, FileDown } from "lucide-react";

function exportCSV(rows: typeof CANDIDATES, filename: string) {
  const headers = ["Name", "Job Title", "Experience", "Location", "Status"];
  const lines = [
    headers.join(","),
    ...rows.map((r) => [r.name, `"${r.title}"`, r.exp, r.location, r.status].join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
import { AdminLayout } from "../components/admin/AdminLayout";

type Status = "Shortlisted" | "Pending" | "Rejected" | "Interview";

const CANDIDATES: {
  id: number; name: string; initials: string; title: string;
  exp: string; location: string; flag: string; status: Status;
}[] = [
  { id: 1, name: "Ahmed Al-Rashid", initials: "AA", title: "Senior UI/UX Designer",   exp: "6+ Yrs", location: "Egypt",        flag: "🇪🇬", status: "Shortlisted" },
  { id: 2, name: "Sarah Smith",     initials: "SS", title: "Operations Manager",       exp: "4+ Yrs", location: "Saudi Arabia", flag: "🇸🇦", status: "Pending"     },
  { id: 3, name: "Mohamed Ali",     initials: "MA", title: "Full-Stack Developer",     exp: "5+ Yrs", location: "Egypt",        flag: "🇪🇬", status: "Shortlisted" },
  { id: 4, name: "Omar Hassan",     initials: "OH", title: "HR Consultant",            exp: "2+ Yrs", location: "Jordan",       flag: "🇯🇴", status: "Rejected"    },
];

const STATUS_CONFIG: Record<Status, { bg: string; text: string; dot: string; label: string }> = {
  Shortlisted: { bg: "#F0FDF4", text: "#16A34A", dot: "#16A34A", label: "Shortlisted"   },
  Pending:     { bg: "#FFFBEB", text: "#D97706", dot: "#D97706", label: "Pending Review" },
  Rejected:    { bg: "#F8FAFC", text: "#64748B", dot: "#94A3B8", label: "Rejected"       },
  Interview:   { bg: "#EFF6FF", text: "#1D4ED8", dot: "#1D4ED8", label: "Interview"      },
};

const METRICS = [
  { label: "Total Applicants", value: "1,240", delta: "+48 this week",  up: true,  color: "#1D4ED8" },
  { label: "Pending Review",   value: "312",   delta: "24 need action", up: false, color: "#D97706" },
  { label: "Shortlisted",      value: "87",    delta: "+12 this week",  up: true,  color: "#16A34A" },
];

const INDUSTRIES = ["Energy & Oil","Technology","Finance","Healthcare","Real Estate","Telecom","Government","Education","Consulting"];
const EXP_LEVELS = ["0–2 Years","3–5 Years","6–9 Years","10+ Years"];
const LOCATIONS  = ["Egypt","Saudi Arabia","UAE","Qatar","Kuwait","Bahrain","Oman","Jordan"];

function StatusBadge({ status }: { status: Status }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: c.bg, color: c.text }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}

function FilterDropdown({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all"
        style={{ borderColor: value ? "#1D4ED8" : "#E2E8F0", color: value ? "#1D4ED8" : "#64748B", background: value ? "#EFF6FF" : "#ffffff" }}>
        <Filter size={13} />{value || label}<ChevronDown size={13} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 rounded-xl overflow-hidden"
          style={{ background: "#ffffff", border: "1px solid #E2E8F0", minWidth: "180px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
          {options.map((opt) => (
            <button key={opt} onClick={() => { onChange(opt === value ? "" : opt); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm transition-colors"
              style={{ background: opt === value ? "#EFF6FF" : "transparent", color: opt === value ? "#1D4ED8" : "#0F172A", fontWeight: opt === value ? 600 : 400 }}
              onMouseEnter={(e) => { if (opt !== value) (e.currentTarget as HTMLElement).style.background = "#F8FAFC"; }}
              onMouseLeave={(e) => { if (opt !== value) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminTalentPage() {
  const [search,   setSearch]   = useState("");
  const [industry, setIndustry] = useState("");
  const [expLevel, setExpLevel] = useState("");
  const [location, setLocation] = useState("");
  const [page,     setPage]     = useState(1);
  const hasFilters = industry || expLevel || location || search;

  const filtered = CANDIDATES.filter((c) => {
    const q = search.toLowerCase();
    return (
      (!q || c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.location.toLowerCase().includes(q)) &&
      (!location || c.location === location)
    );
  });

  return (
    <AdminLayout title="Talent Pool Management">
      <div className="flex flex-col gap-6">

        {/* Metrics */}
        <div className="grid sm:grid-cols-3 gap-4">
          {METRICS.map((m) => (
            <div key={m.label} className="flex flex-col gap-3 rounded-xl p-5 bg-white" style={{ border: "1px solid #E2E8F0" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#94A3B8" }}>{m.label}</span>
                <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#0B1F4D", lineHeight: 1, letterSpacing: "-0.025em" }}>{m.value}</div>
              <div className="text-xs font-medium" style={{ color: m.up ? "#16A34A" : "#D97706" }}>{m.up ? "↑" : "●"} {m.delta}</div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="rounded-xl bg-white flex flex-col" style={{ border: "1px solid #E2E8F0" }}>
          {/* Search + filters */}
          <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b" style={{ borderColor: "#E2E8F0" }}>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, title, or skills..."
                className="pl-8 pr-4 py-2 rounded-lg text-sm" style={{ border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#0F172A", outline: "none", fontFamily: "inherit", width: "260px" }}
                onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={12} style={{ color: "#94A3B8" }} /></button>}
            </div>
            <div className="w-px h-5" style={{ background: "#E2E8F0" }} />
            <SlidersHorizontal size={14} style={{ color: "#64748B" }} />
            <FilterDropdown label="Industry"   options={INDUSTRIES} value={industry} onChange={setIndustry} />
            <FilterDropdown label="Experience" options={EXP_LEVELS} value={expLevel} onChange={setExpLevel} />
            <FilterDropdown label="Location"   options={LOCATIONS}  value={location} onChange={setLocation} />
            {hasFilters && (
              <button onClick={() => { setIndustry(""); setExpLevel(""); setLocation(""); setSearch(""); }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors"
                style={{ borderColor: "#E2E8F0", color: "#64748B" }}>
                <X size={11} /> Clear
              </button>
            )}
            <button
              onClick={() => exportCSV(filtered, "jhc-talent-pool.csv")}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all"
              style={{ borderColor: "#E2E8F0", color: "#64748B" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#0B1F4D"; (e.currentTarget as HTMLElement).style.color = "#0B1F4D"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLElement).style.color = "#64748B"; }}
            >
              <FileDown size={13} /> Export CSV
            </button>
            <span className="text-xs" style={{ color: "#94A3B8" }}>{filtered.length} results</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                  {["Candidate Name","Job Title","Experience","Location","Status","Actions"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: "#94A3B8", background: "#F8FAFC", letterSpacing: "0.08em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F1F5F9" : "none" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#FAFBFC")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>{c.initials}</div>
                        <div>
                          <div className="text-sm font-semibold" style={{ color: "#0B1F4D" }}>{c.name}</div>
                          <div className="text-xs" style={{ color: "#94A3B8" }}>ID #{String(c.id).padStart(4, "0")}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "#0F172A" }}>{c.title}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: "#F1F5F9", color: "#0B1F4D" }}>{c.exp}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm" style={{ color: "#64748B" }}><span>{c.flag}</span>{c.location}</div>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                    <td className="px-6 py-4">
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                        style={{ borderColor: "#E2E8F0", color: "#0B1F4D" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#0B1F4D"; (e.currentTarget as HTMLElement).style.color = "#ffffff"; (e.currentTarget as HTMLElement).style.borderColor = "#0B1F4D"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#0B1F4D"; (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; }}>
                        <Download size={12} /> Download CV
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: "#E2E8F0" }}>
            <span className="text-xs" style={{ color: "#94A3B8" }}>
              Showing {(page - 1) * 4 + 1}–{Math.min(page * 4, 1240)} of 1,240 candidates
            </span>
            <div className="flex items-center gap-1">
              {/* Previous */}
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors"
                style={{ borderColor: "#E2E8F0", color: page === 1 ? "#CBD5E1" : "#64748B", cursor: page === 1 ? "not-allowed" : "pointer" }}>
                <ChevronLeft size={14} />
              </button>
              {/* Page numbers */}
              {[1, 2, 3].map((n) => (
                <button key={n} onClick={() => setPage(n)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium border transition-all"
                  style={{ borderColor: page === n ? "#1D4ED8" : "#E2E8F0", background: page === n ? "#1D4ED8" : "transparent", color: page === n ? "#ffffff" : "#64748B" }}>
                  {n}
                </button>
              ))}
              <span className="px-1 text-xs" style={{ color: "#CBD5E1" }}>…</span>
              <button onClick={() => setPage(310)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-colors"
                style={{ borderColor: page === 310 ? "#1D4ED8" : "#E2E8F0", background: page === 310 ? "#1D4ED8" : "transparent", color: page === 310 ? "#ffffff" : "#64748B" }}>
                310
              </button>
              {/* Next */}
              <button onClick={() => setPage((p) => Math.min(310, p + 1))} disabled={page === 310}
                className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors"
                style={{ borderColor: "#E2E8F0", color: page === 310 ? "#CBD5E1" : "#64748B", cursor: page === 310 ? "not-allowed" : "pointer" }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
