import { motion } from "motion/react";

/* Animated workforce-platform illustration */
export function HeroIllustration() {
  return (
    <div className="w-full h-full flex items-center justify-center p-8 lg:p-10" style={{ background: "#F8FAFC", borderRadius: "0 40px 40px 0" }}>
      <div className="relative w-full" style={{ maxWidth: "460px" }}>

        {/* ── Central org-chart node ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto flex flex-col items-center gap-3 rounded-3xl px-6 py-5 relative z-20"
          style={{
            background: "#0B1F4D",
            border: "1px solid rgba(255,255,255,0.08)",
            width: "220px",
          }}
        >
          {/* Logo mark */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1D4ED8" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1.5" fill="#60A5FA" />
                <rect x="9" y="2" width="5" height="5" rx="1.5" fill="#60A5FA" opacity=".6" />
                <rect x="2" y="9" width="5" height="5" rx="1.5" fill="#60A5FA" opacity=".6" />
                <rect x="9" y="9" width="5" height="5" rx="1.5" fill="#60A5FA" />
              </svg>
            </div>
            <span className="text-sm font-bold" style={{ color: "#ffffff" }}>JHC Platform</span>
          </div>
          <div className="w-full h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="flex items-center gap-2 w-full">
            <div className="w-2 h-2 rounded-full" style={{ background: "#60A5FA" }} />
            <span className="text-xs" style={{ color: "#94A3B8" }}>500+ Active Professionals</span>
          </div>
          <div className="flex items-center gap-2 w-full">
            <div className="w-2 h-2 rounded-full" style={{ background: "#34D399" }} />
            <span className="text-xs" style={{ color: "#94A3B8" }}>6 GCC Markets Live</span>
          </div>
        </motion.div>

        {/* ── Connector lines (SVG) ── */}
        <svg
          className="absolute left-0 right-0 mx-auto"
          style={{ top: "86px", width: "100%", height: "60px", overflow: "visible", zIndex: 10 }}
          viewBox="0 0 460 60"
        >
          {/* line center-left */}
          <line x1="230" y1="0" x2="80" y2="60" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="4 3" />
          {/* line center */}
          <line x1="230" y1="0" x2="230" y2="60" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="4 3" />
          {/* line center-right */}
          <line x1="230" y1="0" x2="380" y2="60" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="4 3" />
        </svg>

        {/* ── Three service cards below ── */}
        <div className="grid grid-cols-3 gap-3 mt-14 relative z-20">
          {[
            { label: "Operations", icon: "⚙️", color: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8", stat: "88%" },
            { label: "Recruitment", icon: "🔍", color: "#F0FDF4", border: "#BBF7D0", text: "#16A34A", stat: "240+" },
            { label: "Consulting", icon: "💡", color: "#FFF7ED", border: "#FED7AA", text: "#EA580C", stat: "15yr" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 + i * 0.08 }}
              className="rounded-2xl p-4 flex flex-col gap-2"
              style={{ background: s.color, border: `1px solid ${s.border}` }}
            >
              <span style={{ fontSize: "1.1rem" }}>{s.icon}</span>
              <div className="text-xs font-semibold" style={{ color: s.text }}>{s.label}</div>
              <div className="font-black" style={{ fontSize: "1.125rem", color: "#0B1F4D", lineHeight: 1 }}>{s.stat}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Activity feed card ── */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="absolute rounded-2xl p-4 z-30"
          style={{
            background: "#ffffff",
            border: "1px solid #E2E8F0",
            right: "-16px",
            top: "0px",
            width: "160px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          <div className="text-xs font-semibold mb-3" style={{ color: "#0B1F4D" }}>Live Activity</div>
          {[
            { dot: "#60A5FA", text: "Talent deployed" },
            { dot: "#34D399", text: "SLA achieved" },
            { dot: "#F59E0B", text: "Model updated" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 mb-2 last:mb-0">
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: item.dot }}
              />
              <span className="text-xs" style={{ color: "#64748B" }}>{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* ── KPI badge — bottom left ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="absolute rounded-2xl px-4 py-3 z-30 flex items-center gap-3"
          style={{
            background: "#0B1F4D",
            left: "-16px",
            bottom: "-20px",
            boxShadow: "0 4px 24px rgba(11,31,77,0.18)",
          }}
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#1D4ED8" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 12 L6 7 L9 10 L13 4" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold" style={{ color: "#ffffff" }}>95% Retention</div>
            <div className="text-xs" style={{ color: "#60A5FA" }}>↑ 3pts this year</div>
          </div>
        </motion.div>

        {/* ── Floating GCC badge ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.65 }}
          className="absolute rounded-full px-3 py-1.5 z-30 flex items-center gap-2"
          style={{
            background: "#EFF6FF",
            border: "1px solid #BFDBFE",
            top: "-18px",
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: "0.75rem" }}>🌍</span>
          <span className="text-xs font-semibold" style={{ color: "#1D4ED8" }}>6 GCC Markets</span>
        </motion.div>

        {/* ── Progress bar card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="mt-8 rounded-2xl p-5"
          style={{ background: "#ffffff", border: "1px solid #E2E8F0" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold" style={{ color: "#0B1F4D" }}>Workforce Utilization</span>
            <span className="text-xs font-bold" style={{ color: "#1D4ED8" }}>Q2 2025</span>
          </div>
          {[
            { label: "KSA Operations", pct: 91, color: "#0B1F4D" },
            { label: "UAE Remote Teams", pct: 78, color: "#1D4ED8" },
            { label: "Qatar Projects", pct: 64, color: "#60A5FA" },
          ].map((bar, i) => (
            <div key={i} className="mb-2.5 last:mb-0">
              <div className="flex justify-between mb-1">
                <span className="text-xs" style={{ color: "#64748B" }}>{bar.label}</span>
                <span className="text-xs font-semibold" style={{ color: bar.color }}>{bar.pct}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: "#F1F5F9" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${bar.pct}%` }}
                  transition={{ duration: 0.8, delay: 0.8 + i * 0.12, ease: "easeOut" }}
                  className="h-1.5 rounded-full"
                  style={{ background: bar.color }}
                />
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
