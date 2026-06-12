import { ClipboardList, Cpu, UserCheck, Cog, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: <ClipboardList size={24} />,
    num: "01",
    title: "Understand Business Needs",
    desc: "Deep discovery sessions to map your strategic goals, operational constraints, workforce gaps, and growth ambitions.",
    detail: "Stakeholder interviews · Gap analysis · KPI definition",
  },
  {
    icon: <Cpu size={24} />,
    num: "02",
    title: "Design the Operating Model",
    desc: "We architect a bespoke human capital framework tailored to your industry, scale, and regulatory environment.",
    detail: "Model design · Compliance mapping · Cost modeling",
  },
  {
    icon: <UserCheck size={24} />,
    num: "03",
    title: "Deploy Talent",
    desc: "Source, screen, and onboard the right professionals — swiftly, compliantly, and with full cultural fit assessment.",
    detail: "Talent sourcing · Vetting · Onboarding",
  },
  {
    icon: <Cog size={24} />,
    num: "04",
    title: "Manage Operations",
    desc: "Hands-on operational oversight with real-time reporting, SLA management, and full transparency at every level.",
    detail: "Performance tracking · Reporting · Issue resolution",
  },
  {
    icon: <TrendingUp size={24} />,
    num: "05",
    title: "Continuously Optimize",
    desc: "Ongoing performance reviews, model refinements, and strategic recommendations to maximize ROI over time.",
    detail: "Quarterly reviews · Model evolution · Expansion support",
  },
];

export function HowWeWork() {
  return (
    <section id="how-we-work" className="py-8 px-4 lg:px-6" style={{ background: "#F8FAFC" }}>
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: "#ffffff", border: "1px solid #E2E8F0" }}
        >
          {/* Header */}
          <div className="px-10 lg:px-14 pt-12 pb-10 border-b" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex flex-col lg:flex-row lg:items-end gap-6 justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#1D4ED8" }}>Our Process</span>
                <h2
                  className="mt-2"
                  style={{
                    fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                    fontWeight: 800,
                    color: "#0B1F4D",
                    lineHeight: 1.15,
                    letterSpacing: "-0.02em",
                  }}
                >
                  How We Work
                </h2>
              </div>
              <p className="text-sm leading-relaxed max-w-sm" style={{ color: "#64748B" }}>
                A proven five-step methodology that turns workforce challenges into measurable competitive advantages.
              </p>
            </div>
          </div>

          {/* Steps — equal height grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-0 divide-y sm:divide-y-0 divide-x-0 sm:divide-x" style={{ borderColor: "#E2E8F0", '--tw-divide-opacity': '1' } as React.CSSProperties}>
            {steps.map((step, i) => (
              <div
                key={i}
                className="flex flex-col gap-5 p-8"
                style={{
                  borderRight: i < steps.length - 1 ? "1px solid #E2E8F0" : "none",
                  borderBottom: "none",
                }}
              >
                {/* Number + icon row */}
                <div className="flex items-start justify-between">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: i === 0 ? "#0B1F4D" : "#F8FAFC",
                      color: i === 0 ? "#60A5FA" : "#1D4ED8",
                      border: i === 0 ? "none" : "1px solid #E2E8F0",
                    }}
                  >
                    {step.icon}
                  </div>
                  <span
                    className="font-black"
                    style={{ fontSize: "1.75rem", color: "#E2E8F0", lineHeight: 1, userSelect: "none" }}
                  >
                    {step.num}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="font-bold leading-snug"
                  style={{ fontSize: "1rem", color: "#0B1F4D" }}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed flex-1" style={{ color: "#64748B" }}>
                  {step.desc}
                </p>

                {/* Detail pills */}
                <div
                  className="text-xs font-medium px-3 py-2 rounded-xl leading-relaxed"
                  style={{ background: "#F8FAFC", color: "#64748B", border: "1px solid #E2E8F0" }}
                >
                  {step.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
