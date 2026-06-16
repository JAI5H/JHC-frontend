import { useState } from "react";
import { Search, Plus, FileText, X, FileDown } from "lucide-react";
// Future feature: Partner Companies dashboard temporarily disabled.

function exportCSV(rows: typeof PARTNERS, filename: string) {
  const headers = ["Company", "Service", "Talents", "Country", "Status", "Since"];
  const lines = [
    headers.join(","),
    ...rows.map((r) => [r.name, `"${r.service}"`, r.talents, r.country, r.status, r.since].join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
import { AdminLayout } from "../components/admin/AdminLayout";

type PartnerStatus = "Active Partner" | "Onboarding" | "Prospect";

const STATUS_CFG: Record<PartnerStatus, { bg: string; text: string; dot: string }> = {
  "Active Partner": { bg: "#F0FDF4", text: "#16A34A", dot: "#16A34A" },
  "Onboarding":     { bg: "#FFFBEB", text: "#D97706", dot: "#D97706" },
  "Prospect":       { bg: "#F8FAFC", text: "#64748B", dot: "#94A3B8" },
};

const PARTNERS = [
  {
    id: 1, initials: "SA", name: "Saudi Aramco",     service: "Operations Management", talents: 24, country: "Saudi Arabia", flag: "🇸🇦", status: "Active Partner" as PartnerStatus,
    since: "Jan 2022",
  },
  {
    id: 2, initials: "NM", name: "NEOM Group",       service: "Remote Workforce",      talents: 12, country: "UAE",          flag: "🇦🇪", status: "Onboarding"     as PartnerStatus,
    since: "Oct 2025",
  },
  {
    id: 3, initials: "EA", name: "Emaar Properties", service: "HR Consulting",         talents: 0,  country: "Egypt",        flag: "🇪🇬", status: "Prospect"       as PartnerStatus,
    since: "Mar 2026",
  },
  {
    id: 4, initials: "SC", name: "stc Group",        service: "Recruitment Services",  talents: 38, country: "Saudi Arabia", flag: "🇸🇦", status: "Active Partner" as PartnerStatus,
    since: "Jun 2021",
  },
  {
    id: 5, initials: "AL", name: "Aldar Properties", service: "Project-Based Staffing",talents: 7,  country: "UAE",          flag: "🇦🇪", status: "Onboarding"     as PartnerStatus,
    since: "Feb 2026",
  },
];

function StatusBadge({ status }: { status: PartnerStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: c.bg, color: c.text }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
      {status}
    </span>
  );
}

export default function AdminPartnersPage() {
  const [search, setSearch] = useState("");

  const filtered = PARTNERS.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.service.toLowerCase().includes(q) || p.country.toLowerCase().includes(q);
  });

  const counts = {
    total:   PARTNERS.length,
    active:  PARTNERS.filter((p) => p.status === "Active Partner").length,
    boarding: PARTNERS.filter((p) => p.status === "Onboarding").length,
    prospect: PARTNERS.filter((p) => p.status === "Prospect").length,
  };

  return (
    <AdminLayout title="Partner Companies">
      <div className="flex flex-col gap-6">

        {/* ── Summary badges ── */}
        <div className="grid sm:grid-cols-4 gap-4">
          {[
            { label: "Total Partners",    value: counts.total,   color: "#1D4ED8" },
            { label: "Active Partners",   value: counts.active,  color: "#16A34A" },
            { label: "Onboarding",        value: counts.boarding, color: "#D97706" },
            { label: "Prospects",         value: counts.prospect, color: "#64748B" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl p-5 bg-white flex flex-col gap-2" style={{ border: "1px solid #E2E8F0" }}>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#94A3B8" }}>{m.label}</span>
              <div style={{ fontSize: "1.875rem", fontWeight: 900, color: "#0B1F4D", lineHeight: 1, letterSpacing: "-0.025em" }}>{m.value}</div>
              <div className="w-8 h-0.5 rounded" style={{ background: m.color }} />
            </div>
          ))}
        </div>

        {/* ── Table card ── */}
        <div className="rounded-xl bg-white flex flex-col" style={{ border: "1px solid #E2E8F0" }}>
          {/* Actions bar */}
          <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: "#E2E8F0" }}>
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search corporate partners..."
                className="w-full pl-8 pr-4 py-2 rounded-lg text-sm"
                style={{ border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#0F172A", outline: "none", fontFamily: "inherit" }}
                onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={12} style={{ color: "#94A3B8" }} />
                </button>
              )}
            </div>
            <div className="flex-1" />
            <button
              onClick={() => exportCSV(filtered, "jhc-partners.csv")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all"
              style={{ borderColor: "#E2E8F0", color: "#64748B" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#0B1F4D"; (e.currentTarget as HTMLElement).style.color = "#0B1F4D"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLElement).style.color = "#64748B"; }}
            >
              <FileDown size={14} /> Export Partners
            </button>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ background: "#1D4ED8" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#0B1F4D")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")}
            >
              <Plus size={15} /> Add New Partner Account
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                  {["Company Name","Core Requested Service","Active Managed Talents","Country Hub","Partnership Status","Actions"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: "#94A3B8", background: "#F8FAFC", letterSpacing: "0.08em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-14 text-center text-sm" style={{ color: "#94A3B8" }}>No partners match your search.</td></tr>
                ) : (
                  filtered.map((p, i) => (
                    <tr key={p.id}
                      style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F1F5F9" : "none" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#FAFBFC")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                    >
                      {/* Company */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                            style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                            {p.initials}
                          </div>
                          <div>
                            <div className="text-sm font-semibold" style={{ color: "#0B1F4D" }}>{p.name}</div>
                            <div className="text-xs" style={{ color: "#94A3B8" }}>Since {p.since}</div>
                          </div>
                        </div>
                      </td>
                      {/* Service */}
                      <td className="px-6 py-4 text-sm" style={{ color: "#0F172A" }}>{p.service}</td>
                      {/* Talents */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.talents > 0 ? "#16A34A" : "#E2E8F0" }} />
                          <span className="text-sm font-semibold" style={{ color: "#0B1F4D" }}>
                            {p.talents > 0 ? `${p.talents} Professionals` : "–"}
                          </span>
                        </div>
                      </td>
                      {/* Country */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm" style={{ color: "#64748B" }}>
                          <span>{p.flag}</span>{p.country}
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                      {/* Actions */}
                      <td className="px-6 py-4">
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                          style={{ borderColor: "#E2E8F0", color: "#0B1F4D" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#0B1F4D"; (e.currentTarget as HTMLElement).style.color = "#ffffff"; (e.currentTarget as HTMLElement).style.borderColor = "#0B1F4D"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#0B1F4D"; (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; }}
                        >
                          <FileText size={12} /> View Contracts
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
