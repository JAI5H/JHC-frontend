import { Handshake, Sliders, MapPin, CheckCircle2, ArrowRight } from "lucide-react";

const pillars = [
  {
    icon: <Handshake size={24} />,
    title: "Strategic Partnership",
    desc: "We embed into your leadership structure — not as a vendor, but as a long-term partner accountable for outcomes, not just deliverables.",
    points: ["Executive-level engagement", "Dedicated account teams", "Quarterly business reviews"],
  },
  {
    icon: <Sliders size={24} />,
    title: "Flexible Operating Models",
    desc: "Fully outsourced, hybrid, or advisory — we design the model that fits your business reality today and scales with you tomorrow.",
    points: ["Fully managed operations", "Hybrid workforce models", "Scalable on demand"],
  },
  {
    icon: <MapPin size={24} />,
    title: "Deep GCC Market Expertise",
    desc: "15+ years across KSA, UAE, Qatar, Kuwait, Bahrain, and Oman — with regulatory, cultural, and talent market mastery that matters.",
    points: ["Saudization compliance", "6 GCC markets active", "Local regulatory know-how"],
  },
];

export function WhyChooseSection() {
  return (
    <section className="py-8 px-4 lg:px-6" style={{ background: "#F8FAFC" }}>
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: "#ffffff", border: "1px solid #E2E8F0" }}
        >
          {/* Header row */}
          <div
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 p-10 lg:p-14 border-b"
            style={{ borderColor: "#E2E8F0" }}
          >
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#1D4ED8" }}>
                Our Difference
              </span>
              <h2
                className="mt-3"
                style={{
                  fontSize: "clamp(1.875rem, 3vw, 2.5rem)",
                  fontWeight: 800,
                  color: "#0B1F4D",
                  lineHeight: 1.12,
                  letterSpacing: "-0.025em",
                }}
              >
                Why Leading Organizations
                <br />
                Choose <span style={{ color: "#1D4ED8" }}>JHC</span>
              </h2>
            </div>
            <div className="flex flex-col gap-4 max-w-sm">
              <p className="text-base leading-relaxed" style={{ color: "#64748B" }}>
                Three foundational pillars that define how we engage, deliver, and sustain value for every client engagement.
              </p>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-150 w-fit"
                style={{ color: "#1D4ED8" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#0B1F4D")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#1D4ED8")}
              >
                Start a Partnership <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* Three pillar cards — icon + content only, no photos */}
          <div className="grid md:grid-cols-3">
            {pillars.map((p, i) => (
              <div
                key={i}
                className="flex flex-col gap-6 p-10 lg:p-12 transition-colors duration-150"
                style={{
                  borderRight: i < pillars.length - 1 ? "1px solid #E2E8F0" : "none",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#F8FAFC")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                {/* Icon */}
                <div
                  className="w-13 h-13 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ width: "52px", height: "52px", background: "#0B1F4D", color: "#60A5FA" }}
                >
                  {p.icon}
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="font-bold" style={{ fontSize: "1.0625rem", color: "#0B1F4D", lineHeight: 1.3 }}>
                    {p.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>{p.desc}</p>
                </div>

                {/* Checkpoints */}
                <ul className="flex flex-col gap-2.5 pt-4 border-t mt-auto" style={{ borderColor: "#E2E8F0" }}>
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-2.5">
                      <CheckCircle2 size={14} style={{ color: "#1D4ED8", flexShrink: 0 }} />
                      <span className="text-sm font-medium" style={{ color: "#0F172A" }}>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
