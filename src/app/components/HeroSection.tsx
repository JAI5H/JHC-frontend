import { ArrowRight, Play } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const HERO_PHOTO    = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=860&h=1000&fit=crop&crop=top&auto=format";
const MEETING_THUMB = "https://images.unsplash.com/photo-1622675363311-3e1904dc1885?w=160&h=100&fit=crop&auto=format";

const BOTTOM_STATS = [
  { value: "15+",  label: "Years of Experience" },
  { value: "500+", label: "Professionals" },
  { value: "95%",  label: "Client Retention" },
  { value: "6",    label: "GCC Markets" },
  { value: "120+", label: "Enterprise Clients" },
];

const PARTNERS = ["aramco", "SABIC", "MAADEN", "stc", "EMAAR", "Masdar", "Roshn"];

export function HeroSection() {
  return (
    <>
      {/* ═══════════════════ DARK NAVY HERO ═══════════════════ */}
      <section
        id="home"
        className="relative overflow-hidden"
        style={{ background: "#0B1F4D", paddingTop: "64px" /* navbar height */ }}
      >
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* Radial glow behind photo area */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: 0, right: 0,
            width: "55%", height: "100%",
            background: "radial-gradient(ellipse 80% 90% at 90% 40%, rgba(29,78,216,0.22) 0%, transparent 70%)",
          }}
        />

        {/* ── Content grid ── */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div
            className="grid lg:grid-cols-2 gap-0 items-end"
            style={{ minHeight: "calc(100vh - 64px - 96px)" /* leave room for stats row */ }}
          >

            {/* ── LEFT: copy ── */}
            <div className="flex flex-col justify-center gap-8 py-16 lg:py-20 pr-0 lg:pr-12">

              {/* Eyebrow */}
              <span
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest w-fit"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#60A5FA" }} />
                GCC's Premiere Workforce Partner
              </span>

              {/* Headline */}
              <h1
                style={{
                  fontSize: "clamp(2.75rem, 5.5vw, 4.25rem)",
                  fontWeight: 800,
                  color: "#ffffff",
                  lineHeight: 1.07,
                  letterSpacing: "-0.03em",
                }}
              >
                Human Capital
                <br />
                Solutions
                <br />
                <span style={{ color: "#60A5FA" }}>That Drive</span>
                <br />
                <span style={{ color: "#60A5FA" }}>Real Impact</span>
              </h1>

              {/* Sub-copy */}
              <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.75, maxWidth: "420px" }}>
                We partner with leading enterprises across Saudi Arabia and the GCC to design, deploy, and manage high-performance workforce solutions that accelerate growth.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                  style={{ background: "#1D4ED8" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#60A5FA")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")}
                >
                  Book a Consultation <ArrowRight size={15} />
                </a>
                <a
                  href="#services"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{ color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#ffffff";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                  }}
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    <Play size={10} fill="currentColor" />
                  </span>
                  Explore Services
                </a>
              </div>
            </div>

            {/* ── RIGHT: photo embedded in dark bg ── */}
            <div
              className="hidden lg:block relative self-end"
              style={{ height: "calc(100vh - 64px - 96px)" }}
            >
              {/* Left fade — photo bleeds into navy */}
              <div
                className="absolute inset-y-0 left-0 z-10 pointer-events-none"
                style={{ width: "140px", background: "linear-gradient(to right, #0B1F4D 0%, transparent 100%)" }}
              />
              {/* Bottom fade */}
              <div
                className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
                style={{ height: "100px", background: "linear-gradient(to top, #0B1F4D 0%, transparent 100%)" }}
              />
              {/* Top fade */}
              <div
                className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
                style={{ height: "60px", background: "linear-gradient(to bottom, #0B1F4D 0%, transparent 100%)" }}
              />

              {/* Portrait photo */}
              <ImageWithFallback
                src={HERO_PHOTO}
                alt="JHC executive workforce partner"
                className="w-full h-full object-cover"
                style={{ objectPosition: "center top" }}
              />

              {/* ── TOP floating card: Enterprise Clients ── */}
              <div
                className="absolute z-20 flex overflow-hidden rounded-2xl"
                style={{
                  top: "40px",
                  left: "32px",
                  background: "rgba(255,255,255,0.97)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                  width: "200px",
                }}
              >
                <div className="flex-shrink-0 overflow-hidden" style={{ width: "68px" }}>
                  <ImageWithFallback
                    src={MEETING_THUMB}
                    alt="Enterprise client meeting"
                    className="w-full h-full object-cover"
                    style={{ minHeight: "68px" }}
                  />
                </div>
                <div className="flex flex-col justify-center px-3 py-3">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: "#EFF6FF" }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <rect x="0.5" y="0.5" width="3" height="3" rx="0.75" fill="#1D4ED8"/>
                        <rect x="4.5" y="0.5" width="3" height="3" rx="0.75" fill="#1D4ED8" fillOpacity=".5"/>
                        <rect x="0.5" y="4.5" width="3" height="3" rx="0.75" fill="#1D4ED8" fillOpacity=".5"/>
                        <rect x="4.5" y="4.5" width="3" height="3" rx="0.75" fill="#1D4ED8"/>
                      </svg>
                    </div>
                    <span className="text-xs font-bold" style={{ color: "#0B1F4D" }}>Enterprise Clients</span>
                  </div>
                  <span className="text-xs" style={{ color: "#64748B" }}>Across 6 GCC Markets</span>
                </div>
              </div>

              {/* ── BOTTOM floating card: 15+ Years ── */}
              <div
                className="absolute z-20 rounded-2xl px-5 py-4"
                style={{
                  bottom: "40px",
                  right: "20px",
                  background: "rgba(255,255,255,0.97)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                  minWidth: "158px",
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5"
                  style={{ background: "#EFF6FF" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1.5L2.5 3.5V8C2.5 11 5 13.5 8 14.5C11 13.5 13.5 11 13.5 8V3.5L8 1.5Z"
                      fill="#1D4ED8" fillOpacity=".15" stroke="#1D4ED8" strokeWidth="1.2" strokeLinejoin="round"/>
                    <path d="M5.5 8L7 9.5L10.5 6" stroke="#1D4ED8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 900, color: "#0B1F4D", lineHeight: 1, letterSpacing: "-0.03em" }}>
                  15+
                </div>
                <div className="text-xs font-semibold mt-1.5" style={{ color: "#1D4ED8" }}>Years of Excellence</div>
                <div className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>Serving GCC Markets</div>
              </div>
            </div>
          </div>

          {/* ── STATS ROW — bottom of dark section ── */}
          <div
            className="flex flex-wrap items-center gap-0 border-t relative z-10"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            {BOTTOM_STATS.map((s, i) => (
              <div
                key={s.label}
                className="flex flex-col py-6 flex-1 min-w-[120px]"
                style={{
                  borderRight: i < BOTTOM_STATS.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
                  paddingLeft: i === 0 ? "0" : "24px",
                  paddingRight: "24px",
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(1.5rem, 3vw, 2rem)",
                    fontWeight: 900,
                    color: "#60A5FA",
                    lineHeight: 1,
                    letterSpacing: "-0.025em",
                  }}
                >
                  {s.value}
                </div>
                <div className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TRUSTED BY STRIP ═══════════════════ */}
      <section style={{ background: "#F1F5F9", borderBottom: "1px solid #E2E8F0" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-6 text-center" style={{ color: "#94A3B8" }}>
            Trusted by Leading Enterprises Across the GCC
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {PARTNERS.map((name) => (
              <div
                key={name}
                className="px-4 py-2 rounded-lg transition-opacity duration-200"
                style={{ border: "1px solid #E2E8F0", background: "#ffffff", opacity: 0.65 }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.65")}
              >
                <span
                  className="font-black"
                  style={{
                    fontSize: "0.8125rem",
                    color: "#475569",
                    letterSpacing: name === "stc" ? "0.06em" : "-0.01em",
                  }}
                >
                  {name}
                </span>
              </div>
            ))}
            <div
              className="px-3 py-2 rounded-lg flex items-center gap-1.5"
              style={{ border: "1px solid #BFDBFE", background: "#EFF6FF" }}
            >
              <span className="text-xs font-bold" style={{ color: "#1D4ED8" }}>+120</span>
              <span className="text-xs" style={{ color: "#60A5FA" }}>clients</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
