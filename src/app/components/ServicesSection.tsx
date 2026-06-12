import { Settings2, Wifi, UserSearch, Layers, Lightbulb, ArrowRight } from "lucide-react";

const services = [
  {
    icon: <Settings2 size={22} />,
    num: "01",
    title: "Operations Management",
    desc: "End-to-end management of business operations, workforce performance, and processes — tailored to your industry and scale.",
  },
  {
    icon: <Wifi size={22} />,
    num: "02",
    title: "Remote Workforce Solutions",
    desc: "Compliant, tech-enabled distributed teams across the GCC. Full payroll, HR infrastructure, and real-time operational oversight.",
  },
  {
    icon: <UserSearch size={22} />,
    num: "03",
    title: "Recruitment Services",
    desc: "Executive and mid-level talent acquisition with deep GCC market networks, cultural fit assessment, and rigorous vetting.",
  },
  {
    icon: <Layers size={22} />,
    num: "04",
    title: "Project-Based Staffing",
    desc: "Agile, on-demand staffing for short-term initiatives, seasonal peaks, and specialized project requirements across any discipline.",
  },
  {
    icon: <Lightbulb size={22} />,
    num: "05",
    title: "Strategic Consulting",
    desc: "Advisory services that align your human capital strategy with business objectives and Saudization compliance requirements.",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-8 px-4 lg:px-6" style={{ background: "#F8FAFC" }}>
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: "#ffffff", border: "1px solid #E2E8F0" }}
        >
          {/* Section header */}
          <div
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 p-10 lg:p-14 border-b"
            style={{ borderColor: "#E2E8F0" }}
          >
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#1D4ED8" }}>
                What We Offer
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
                Our Services
              </h2>
            </div>
            <div className="flex flex-col gap-4 max-w-sm">
              <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
                Comprehensive human capital solutions built for the regulatory, cultural, and talent demands of the GCC market.
              </p>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white w-fit transition-colors duration-150"
                style={{ background: "#0B1F4D" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#0B1F4D")}
              >
                Book a Consultation <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* Service cards grid — icons + text only, no photos */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <div
                key={i}
                className="group flex flex-col gap-5 p-8 lg:p-10 transition-colors duration-150 cursor-pointer"
                style={{
                  borderRight: (i % 3 !== 2) ? "1px solid #E2E8F0" : "none",
                  borderBottom: i < services.length - (services.length % 3 || 3) ? "1px solid #E2E8F0" : "none",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#F8FAFC")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                {/* Number + icon row */}
                <div className="flex items-center justify-between">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}
                  >
                    {s.icon}
                  </div>
                  <span
                    className="font-black"
                    style={{ fontSize: "1.5rem", color: "#F1F5F9", lineHeight: 1, userSelect: "none" }}
                  >
                    {s.num}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="font-bold" style={{ fontSize: "1rem", color: "#0B1F4D" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>{s.desc}</p>
                </div>

                <a
                  href="#contact"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold mt-auto transition-colors duration-150"
                  style={{ color: "#1D4ED8" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#0B1F4D")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#1D4ED8")}
                >
                  Learn More <ArrowRight size={13} />
                </a>
              </div>
            ))}

            {/* 6th cell — CTA filler */}
            <div
              className="flex flex-col items-center justify-center p-10 text-center"
              style={{ background: "#F8FAFC", borderTop: "1px solid #E2E8F0" }}
            >
              <p className="text-sm font-medium mb-4" style={{ color: "#64748B" }}>
                Need a custom workforce solution?
              </p>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors duration-150"
                style={{ borderColor: "#E2E8F0", color: "#0B1F4D" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#0B1F4D")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0")}
              >
                Talk to Our Team <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
