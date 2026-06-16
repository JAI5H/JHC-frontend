// chart imports kept for future use
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BadgeCheck, Building2, FileText, Handshake, UserPlus } from "lucide-react";
import { AdminLayout } from "../components/admin/AdminLayout";

const TOP_METRICS = [
  { label: "Active Managed Squads",   value: "42 Teams",  delta: "+4 this month",       color: "#1D4ED8" },
  { label: "Talent Utilization Rate", value: "94.2%",     delta: "Optimal efficiency",  color: "#16A34A" },
  { label: "Total Operational Savings",value: "$142.5K",  delta: "Saved for GCC partners",color: "#0B1F4D" },
  { label: "New Corporate Inquiries", value: "18 Requests",delta: "Pending review",      color: "#D97706" },
];

const BAR_DATA = [
  { month: "Jan", apps: 72 },
  { month: "Feb", apps: 88 },
  { month: "Mar", apps: 95 },
  { month: "Apr", apps: 110 },
  { month: "May", apps: 134 },
  { month: "Jun", apps: 158 },
  { month: "Jul", apps: 142 },
  { month: "Aug", apps: 167 },
  { month: "Sep", apps: 180 },
  { month: "Oct", apps: 195 },
  { month: "Nov", apps: 214 },
  { month: "Dec", apps: 230 },
];

const PIE_DATA = [
  { name: "Saudi Arabia 🇸🇦", value: 42, color: "#0B1F4D" },
  { name: "Egypt 🇪🇬",         value: 31, color: "#1D4ED8" },
  { name: "UAE 🇦🇪",           value: 18, color: "#60A5FA" },
  { name: "Jordan 🇯🇴",        value: 9,  color: "#BFDBFE" },
];

const ACTIVITY = [
  { id: 1, icon: <UserPlus size={15} />, text: "Ahmed Al-Rashid joined the Talent Network",       time: "2 min ago",  type: "join" },
  { id: 2, icon: <Building2 size={15} />, text: "Aramco requested a new Operations Squad",          time: "18 min ago", type: "request" },
  { id: 3, icon: <BadgeCheck size={15} />, text: "Sarah Smith was shortlisted for Operations Manager", time: "1 hr ago",  type: "status" },
  { id: 4, icon: <Handshake size={15} />, text: "NEOM signed a Remote Workforce contract",          time: "3 hr ago",   type: "contract" },
  { id: 5, icon: <FileText size={15} />, text: "Mohamed Ali submitted his updated CV",             time: "5 hr ago",   type: "upload" },
];

const TYPE_COLORS: Record<string, string> = {
  join: "#EFF6FF", request: "#FFF7ED", status: "#F0FDF4", contract: "#F0FDF4", upload: "#F8FAFC",
};
const TYPE_TEXT: Record<string, string> = {
  join: "#1D4ED8", request: "#D97706", status: "#16A34A", contract: "#16A34A", upload: "#64748B",
};

export default function AdminOverviewPage() {
  return (
    <AdminLayout title="Overview">
      <div className="flex flex-col gap-6">

        {/* ── Top 4 metric cards ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOP_METRICS.map((m) => (
            <div key={m.label} className="rounded-xl p-5 bg-white flex flex-col gap-3" style={{ border: "1px solid #E2E8F0" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#94A3B8" }}>{m.label}</span>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0B1F4D", lineHeight: 1, letterSpacing: "-0.025em" }}>
                {m.value}
              </div>
              <div className="text-xs font-medium" style={{ color: "#64748B" }}>{m.delta}</div>
            </div>
          ))}
        </div>

        {/* charts section removed */}
        {false && <div className="grid lg:grid-cols-2 gap-4">

          {/* Bar chart: Monthly Applications */}
          <div className="rounded-xl bg-white p-6 flex flex-col gap-5" style={{ border: "1px solid #E2E8F0" }}>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#94A3B8" }}>Applications Volume</div>
              <div className="font-bold" style={{ fontSize: "1rem", color: "#0B1F4D" }}>Monthly Applications — 2026</div>
            </div>
            <ResponsiveContainer width="100%" height={220} key="monthly-apps-chart">
              <BarChart data={BAR_DATA} barSize={18}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={32} />
                <Tooltip
                  contentStyle={{ background: "#ffffff", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "12px", boxShadow: "none" }}
                  cursor={{ fill: "#F8FAFC" }}
                  formatter={(v: number) => [`${v} applications`, ""]}
                />
                <Bar dataKey="apps" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Donut chart: Talent Distribution by Market */}
          <div className="rounded-xl bg-white p-6 flex flex-col gap-5" style={{ border: "1px solid #E2E8F0" }}>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#94A3B8" }}>Market Distribution</div>
              <div className="font-bold" style={{ fontSize: "1rem", color: "#0B1F4D" }}>Talent Distribution by Market</div>
            </div>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={200} key="talent-dist-chart">
                <PieChart>
                  <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" nameKey="name">
                    {PIE_DATA.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#ffffff", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "12px", boxShadow: "none" }}
                    formatter={(v: number) => [`${v}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3 flex-1">
                {PIE_DATA.map((d) => (
                  <div key={d.name} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-xs" style={{ color: "#64748B" }}>{d.name}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: "#0B1F4D" }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>}

        {/* ── Recent Activity Feed ── */}
        <div className="rounded-xl bg-white flex flex-col" style={{ border: "1px solid #E2E8F0" }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "#E2E8F0" }}>
            <div>
              <div className="font-bold" style={{ fontSize: "0.9375rem", color: "#0B1F4D" }}>Recent Activity</div>
              <div className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>Last 5 system events</div>
            </div>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}
            >
              Live
            </span>
          </div>
          {ACTIVITY.map((a, i) => (
            <div
              key={a.id}
              className="flex items-start gap-4 px-6 py-4 transition-colors"
              style={{ borderBottom: i < ACTIVITY.length - 1 ? "1px solid #F1F5F9" : "none" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#FAFBFC")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                style={{ background: TYPE_COLORS[a.type], color: TYPE_TEXT[a.type] }}
              >
                {a.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: "#0F172A" }}>{a.text}</p>
              </div>
              <span className="text-xs flex-shrink-0" style={{ color: "#94A3B8" }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
