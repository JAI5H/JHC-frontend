import { ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const PHOTO_TEAM = "https://images.unsplash.com/photo-1622675363311-3e1904dc1885?w=1400&h=640&fit=crop&auto=format";

export function WorkforceSection() {
  return (
    <section id="about" className="py-8 px-4 lg:px-6" style={{ background: "#F8FAFC" }}>
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: "#ffffff", border: "1px solid #E2E8F0" }}
        >
          {/* Top: two-column content row */}
          <div className="grid lg:grid-cols-2 gap-0 border-b" style={{ borderColor: "#E2E8F0" }}>
            <div className="p-10 lg:p-14 flex flex-col justify-center gap-5 border-r" style={{ borderColor: "#E2E8F0" }}>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#1D4ED8" }}>
                Our Approach
              </span>
              <h2
                style={{
                  fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                  fontWeight: 800,
                  color: "#0B1F4D",
                  lineHeight: 1.12,
                  letterSpacing: "-0.025em",
                }}
              >
                Workforce
                <br />
                <span style={{ color: "#1D4ED8" }}>Reimagined</span> for
                <br />
                the GCC Era
              </h2>
            </div>

            <div className="p-10 lg:p-14 flex flex-col justify-center gap-5">
              <p className="text-base leading-relaxed" style={{ color: "#64748B" }}>
                We don't just place talent — we redesign how organizations operate. JHC brings 15+ years of on-the-ground GCC expertise to architect human capital frameworks that are resilient, compliant, and built for sustainable growth.
              </p>
              <p className="text-base leading-relaxed" style={{ color: "#64748B" }}>
                From remote workforce infrastructure to full operations management, our flexible models adapt to your industry, scale, and regulatory environment — not the other way around.
              </p>
              <a
                href="#services"
                className="inline-flex items-center gap-2 text-sm font-semibold w-fit transition-colors duration-150"
                style={{ color: "#1D4ED8" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#0B1F4D")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#1D4ED8")}
              >
                Explore Our Services <ArrowRight size={15} />
              </a>
            </div>
          </div>

          {/* Bottom: single full-width photo */}
          <div className="relative overflow-hidden" style={{ height: "380px" }}>
            <ImageWithFallback
              src={PHOTO_TEAM}
              alt="JHC executive team in a strategic boardroom session"
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 30%" }}
            />
            {/* Subtle bottom gradient for depth */}
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{ height: "120px", background: "linear-gradient(to top, rgba(255,255,255,0.12), transparent)" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
