import { useState } from "react";
import { Save, User, Settings2, DollarSign, ChevronDown } from "lucide-react";
import { AdminLayout } from "../components/admin/AdminLayout";

type Tab = "profile" | "system" | "pricing";

const TABS: { key: Tab; icon: React.ReactNode; label: string }[] = [
  { key: "profile", icon: <User size={15} />,     label: "Profile Settings"              },
  { key: "system",  icon: <Settings2 size={15} />, label: "System Configurations"        },
  { key: "pricing", icon: <DollarSign size={15} />,label: "GCC Regional Pricing & Fees"  },
];

const REGIONS = ["GCC & Egypt Hubs","Saudi Arabia Only","Egypt Only","UAE Only","Full GCC (6 Markets)"];

const inputSt: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: "10px",
  border: "1px solid #E2E8F0", background: "#F8FAFC",
  fontSize: "0.875rem", color: "#0F172A", outline: "none",
  fontFamily: "'Inter', system-ui, sans-serif", transition: "border-color 0.15s",
};

const disabledSt: React.CSSProperties = {
  ...inputSt, background: "#F1F5F9", color: "#94A3B8", cursor: "not-allowed",
};

const labelSt: React.CSSProperties = {
  display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748B",
  marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.07em",
};

function ProfileTab() {
  const [form, setForm] = useState({ name: "JHC Admin", email: "admin@jhc-group.com", region: "GCC & Egypt Hubs" });
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2200); };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="font-bold" style={{ fontSize: "1rem", color: "#0B1F4D" }}>Profile Settings</h3>
        <p className="text-sm mt-1" style={{ color: "#64748B" }}>Manage your admin account information and regional target.</p>
      </div>

      {/* Avatar row */}
      <div className="flex items-center gap-5 p-5 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-bold flex-shrink-0" style={{ background: "#1D4ED8", color: "#60A5FA" }}>JA</div>
        <div>
          <div className="font-semibold" style={{ color: "#0B1F4D" }}>JHC Admin</div>
          <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>Super Administrator · GCC & Egypt Hubs</div>
        </div>
        <button className="ml-auto text-xs font-semibold px-4 py-2 rounded-lg border transition-colors" style={{ borderColor: "#E2E8F0", color: "#64748B" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#0B1F4D"; (e.currentTarget as HTMLElement).style.color = "#0B1F4D"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLElement).style.color = "#64748B"; }}>
          Change Avatar
        </button>
      </div>

      {/* Form */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label style={labelSt}>Admin Full Name</label>
          <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            style={inputSt} onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
        </div>
        <div>
          <label style={labelSt}>Official Contact Email</label>
          <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            style={inputSt} onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
        </div>
        <div>
          <label style={labelSt}>System Role Access Level</label>
          <input value="Super Administrator" disabled style={disabledSt} />
          <p className="text-xs mt-1.5" style={{ color: "#94A3B8" }}>Role is set by the system. Contact support to modify.</p>
        </div>
        <div>
          <label style={labelSt}>Primary Region Target</label>
          <div className="relative">
            <select value={form.region} onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))}
              style={{ ...inputSt, cursor: "pointer", appearance: "none" }}
              onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#94A3B8" }} />
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div className="pt-4 border-t flex items-center justify-between gap-4" style={{ borderColor: "#E2E8F0" }}>
        {saved && (
          <span className="text-sm font-medium" style={{ color: "#16A34A" }}>✓ Preferences saved successfully</span>
        )}
        {!saved && <span />}
        <button onClick={save}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ background: "#1D4ED8" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#0B1F4D")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")}>
          <Save size={14} /> Save Preferences
        </button>
      </div>
    </div>
  );
}

function SystemTab() {
  const [vals, setVals] = useState({ sessionTimeout: "30", maxUploadMB: "5", defaultLang: "English", notifyEmail: true, notifyBell: true });
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="font-bold" style={{ fontSize: "1rem", color: "#0B1F4D" }}>System Configurations</h3>
        <p className="text-sm mt-1" style={{ color: "#64748B" }}>Control platform-wide behavior, security, and defaults.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label style={labelSt}>Session Timeout (minutes)</label>
          <input type="number" value={vals.sessionTimeout} onChange={(e) => setVals((p) => ({ ...p, sessionTimeout: e.target.value }))}
            style={inputSt} onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
        </div>
        <div>
          <label style={labelSt}>Max CV Upload Size (MB)</label>
          <input type="number" value={vals.maxUploadMB} onChange={(e) => setVals((p) => ({ ...p, maxUploadMB: e.target.value }))}
            style={inputSt} onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
        </div>
        <div>
          <label style={labelSt}>Default Platform Language</label>
          <select value={vals.defaultLang} onChange={(e) => setVals((p) => ({ ...p, defaultLang: e.target.value }))} style={{ ...inputSt, cursor: "pointer", appearance: "none" }}>
            {["English","Arabic","English + Arabic"].map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-5 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "#94A3B8" }}>Notification Channels</div>
        {[{ key: "notifyEmail", label: "Email Notifications" }, { key: "notifyBell", label: "In-App Bell Alerts" }].map((opt) => (
          <label key={opt.key} className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setVals((p) => ({ ...p, [opt.key]: !p[opt.key as keyof typeof p] }))}
              className="w-10 h-6 rounded-full transition-colors relative flex-shrink-0"
              style={{ background: vals[opt.key as keyof typeof vals] ? "#1D4ED8" : "#E2E8F0", cursor: "pointer" }}
            >
              <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: vals[opt.key as keyof typeof vals] ? "22px" : "2px" }} />
            </div>
            <span className="text-sm" style={{ color: "#0F172A" }}>{opt.label}</span>
          </label>
        ))}
      </div>
      <div className="pt-4 border-t flex justify-end" style={{ borderColor: "#E2E8F0" }}>
        <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ background: "#1D4ED8" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#0B1F4D")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")}>
          <Save size={14} /> Save System Config
        </button>
      </div>
    </div>
  );
}

function PricingTab() {
  const TIERS = [
    { market: "Saudi Arabia 🇸🇦", base: "$4,500", remote: "$2,800", recruit: "$3,200" },
    { market: "Egypt 🇪🇬",         base: "$2,200", remote: "$1,400", recruit: "$1,800" },
    { market: "UAE 🇦🇪",           base: "$5,200", remote: "$3,100", recruit: "$3,900" },
    { market: "Qatar 🇶🇦",         base: "$4,800", remote: "$2,950", recruit: "$3,500" },
    { market: "Kuwait 🇰🇼",        base: "$4,200", remote: "$2,600", recruit: "$3,100" },
    { market: "Bahrain 🇧🇭",       base: "$3,800", remote: "$2,300", recruit: "$2,700" },
  ];
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="font-bold" style={{ fontSize: "1rem", color: "#0B1F4D" }}>GCC Regional Pricing & Fees</h3>
        <p className="text-sm mt-1" style={{ color: "#64748B" }}>Monthly base rates per market for JHC service tiers (USD).</p>
      </div>
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
              {["Market","Operations Mgmt","Remote Workforce","Recruitment"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider"
                  style={{ color: "#94A3B8", background: "#F8FAFC", letterSpacing: "0.08em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIERS.map((row, i) => (
              <tr key={row.market} style={{ borderBottom: i < TIERS.length - 1 ? "1px solid #F1F5F9" : "none" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#FAFBFC")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                <td className="px-5 py-3 text-sm font-semibold" style={{ color: "#0B1F4D" }}>{row.market}</td>
                {[row.base, row.remote, row.recruit].map((val, vi) => (
                  <td key={vi} className="px-5 py-3">
                    <span className="text-sm font-mono font-semibold" style={{ color: "#1D4ED8" }}>{val}</span>
                    <span className="text-xs ml-1" style={{ color: "#94A3B8" }}>/mo</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pt-4 border-t flex justify-end" style={{ borderColor: "#E2E8F0" }}>
        <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ background: "#1D4ED8" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#0B1F4D")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")}>
          <Save size={14} /> Save Pricing
        </button>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <AdminLayout title="Settings">
      <div className="flex flex-col gap-5">
        {/* Tab bar */}
        <div className="rounded-xl bg-white flex overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
          {TABS.map((t, i) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex items-center gap-2.5 flex-1 justify-center px-5 py-3.5 text-sm font-medium transition-all duration-150"
                style={{
                  background: active ? "#EFF6FF" : "transparent",
                  color: active ? "#1D4ED8" : "#64748B",
                  borderRight: i < TABS.length - 1 ? "1px solid #E2E8F0" : "none",
                  borderBottom: active ? "2px solid #1D4ED8" : "2px solid transparent",
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "#F8FAFC"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span>{t.icon}</span>
                <span className="hidden sm:block">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="rounded-xl bg-white p-7 lg:p-9" style={{ border: "1px solid #E2E8F0" }}>
          {tab === "profile" && <ProfileTab />}
          {tab === "system"  && <SystemTab />}
          {tab === "pricing" && <PricingTab />}
        </div>
      </div>
    </AdminLayout>
  );
}
