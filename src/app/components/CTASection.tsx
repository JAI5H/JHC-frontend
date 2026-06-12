import { ArrowRight, MessageCircle, ShieldCheck, Zap, Globe } from "lucide-react";

export function CTASection() {
  return (
    <section id="contact" className="py-8 pb-10 px-4 lg:px-6" style={{ background: "#F8FAFC" }}>
      <div className="max-w-7xl mx-auto">
        {/* Clean dark card — no photography */}
        <div
          className="rounded-3xl overflow-hidden relative"
          style={{ background: "#0B1F4D" }}
        >
          {/* Subtle geometric pattern overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 80% 20%, rgba(96,165,250,0.08) 0%, transparent 55%),
                                radial-gradient(circle at 20% 80%, rgba(29,78,216,0.12) 0%, transparent 50%)`,
            }}
          />
          {/* Faint grid texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
              backgroundSize: "64px 64px",
            }}
          />

          <div className="relative z-10 flex flex-col items-center text-center px-8 lg:px-20 py-20 lg:py-24 gap-10">

            {/* Eyebrow */}
            <span
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full"
              style={{ background: "rgba(96,165,250,0.12)", color: "#60A5FA", border: "1px solid rgba(96,165,250,0.2)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#60A5FA" }} />
              Ready to Start?
            </span>

            {/* Headline */}
            <div className="max-w-2xl">
              <h2
                style={{
                  fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
                  fontWeight: 800,
                  color: "#ffffff",
                  lineHeight: 1.1,
                  letterSpacing: "-0.025em",
                }}
              >
                Build Your Workforce
                <br />
                with <span style={{ color: "#60A5FA" }}>Confidence</span>
              </h2>
              <p
                className="mt-5 text-base leading-relaxed"
                style={{ color: "#94A3B8", maxWidth: "540px", margin: "1.25rem auto 0" }}
              >
                JHC partners with forward-thinking organizations to design resilient, scalable human capital frameworks — enabling you to focus on growth while we manage the talent behind it.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:info@jhc-group.com"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200"
                style={{ background: "#1D4ED8" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#60A5FA")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")}
              >
                Start Your Partnership <ArrowRight size={15} />
              </a>
              <a
                href="tel:+966112345678"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-semibold border transition-all duration-200"
                style={{ borderColor: "rgba(255,255,255,0.18)", color: "#ffffff" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.45)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <MessageCircle size={15} /> Talk to Our Team
              </a>
            </div>

            {/* Trust signals */}
            <div
              className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 pt-8 border-t w-full"
              style={{ borderColor: "rgba(255,255,255,0.08)", maxWidth: "480px" }}
            >
              {[
                { icon: <ShieldCheck size={13} />, text: "GCC Compliant" },
                { icon: <Zap size={13} />, text: "No Long-Term Lock-in" },
                { icon: <Globe size={13} />, text: "6 Market Presence" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2">
                  <span style={{ color: "#60A5FA" }}>{item.icon}</span>
                  <span className="text-xs font-medium" style={{ color: "#64748B" }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
