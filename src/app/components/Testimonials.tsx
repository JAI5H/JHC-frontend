import { Quote, Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

/* Small avatar photos — 80px render size, realistic portraits */
const PHOTO_T1 = "https://images.unsplash.com/photo-1585846416120-3a7354ed7d39?w=160&h=160&fit=crop&crop=face&auto=format";
const PHOTO_T2 = "https://images.unsplash.com/photo-1604904612715-47bf9d9bc670?w=160&h=160&fit=crop&crop=face&auto=format";
const PHOTO_T3 = "https://images.unsplash.com/photo-1581065178047-8ee15951ede6?w=160&h=160&fit=crop&crop=face&auto=format";

const testimonials = [
  {
    quote: "JHC gave us the regulatory expertise and talent infrastructure to scale in Saudi Arabia 40% faster than any internal team could have managed.",
    name: "Khalid Al-Mansouri",
    title: "Chief People Officer",
    company: "Momentum Energy Group",
    companyInitials: "MEG",
    photo: PHOTO_T1,
    metric: "40% faster scaling",
    stars: 5,
  },
  {
    quote: "They redesigned our operating model end-to-end — reducing overhead by 28% while materially improving service delivery quality across MENA.",
    name: "Layla Hassan",
    title: "VP Operations, MENA",
    company: "Nexus Digital Solutions",
    companyInitials: "NDS",
    photo: PHOTO_T2,
    metric: "28% cost reduction",
    stars: 5,
  },
  {
    quote: "From 12 to 80+ distributed professionals across 3 markets in under 6 months. The JHC team made it seamless, compliant, and fast.",
    name: "Sara Al-Fadhel",
    title: "Director of Human Resources",
    company: "Gulf Innovations Corp",
    companyInitials: "GIC",
    photo: PHOTO_T3,
    metric: "80+ professionals deployed",
    stars: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-8 px-4 lg:px-6" style={{ background: "#F8FAFC" }}>
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: "#0B1F4D" }}
        >
          {/* Header */}
          <div
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 p-10 lg:p-14 border-b"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#60A5FA" }}>
                Client Stories
              </span>
              <h2
                className="mt-2"
                style={{
                  fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                  fontWeight: 800,
                  color: "#ffffff",
                  lineHeight: 1.15,
                  letterSpacing: "-0.025em",
                }}
              >
                What Our Clients Say
              </h2>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "#64748B" }}>
              Real results. Real partnerships. Organizations across the GCC who trusted JHC to transform their workforce.
            </p>
          </div>

          {/* Testimonial cards */}
          <div className="grid lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="flex flex-col gap-7 p-10 lg:p-12"
                style={{ borderRight: i < testimonials.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}
              >
                {/* Stars + metric */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, si) => (
                      <Star key={si} size={12} fill="#60A5FA" style={{ color: "#60A5FA" }} />
                    ))}
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(96,165,250,0.1)", color: "#60A5FA", border: "1px solid rgba(96,165,250,0.2)" }}
                  >
                    {t.metric}
                  </span>
                </div>

                <Quote size={22} style={{ color: "#60A5FA", opacity: 0.35 }} />

                <p
                  className="italic leading-relaxed flex-1"
                  style={{ fontSize: "1rem", color: "rgba(255,255,255,0.88)", lineHeight: 1.7 }}
                >
                  "{t.quote}"
                </p>

                <div style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} />

                {/* Author — small avatar */}
                <div className="flex items-center gap-3">
                  {/* Small avatar: 40×40px */}
                  <div
                    className="overflow-hidden rounded-full flex-shrink-0"
                    style={{ width: "40px", height: "40px", border: "1.5px solid rgba(96,165,250,0.3)" }}
                  >
                    <ImageWithFallback
                      src={t.photo}
                      alt={t.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: "#ffffff" }}>{t.name}</div>
                    <div className="text-xs truncate" style={{ color: "#64748B" }}>{t.title}</div>
                  </div>

                  {/* Company badge */}
                  <div
                    className="flex items-center justify-center rounded-lg px-2.5 py-1.5 flex-shrink-0 text-xs font-bold"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      color: "#94A3B8",
                      border: "1px solid rgba(255,255,255,0.08)",
                      minWidth: "42px",
                    }}
                  >
                    {t.companyInitials}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
