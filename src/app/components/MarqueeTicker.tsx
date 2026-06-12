import { useEffect, useRef } from "react";

const items = [
  "Strategic Partnership",
  "Flexible Workforce Models",
  "GCC-Native Expertise",
  "Saudization Compliance",
  "Remote Workforce",
  "Talent Deployment",
  "Operations Management",
  "Executive Consulting",
];

export function MarqueeTicker() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let raf: number;
    let pos = 0;
    const speed = 0.45;

    const firstTrack = wrap.children[0] as HTMLElement;
    if (!firstTrack) return;
    const clone = firstTrack.cloneNode(true) as HTMLElement;
    wrap.appendChild(clone);

    const animate = () => {
      pos -= speed;
      if (Math.abs(pos) >= firstTrack.offsetWidth) pos = 0;
      wrap.style.transform = `translateX(${pos}px)`;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const track = (
    <div className="flex items-center gap-0 flex-shrink-0">
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span
            className="px-8 py-0 text-sm font-semibold uppercase tracking-widest whitespace-nowrap"
            style={{ color: "#0B1F4D", letterSpacing: "0.1em" }}
          >
            {item}
          </span>
          <span
            className="flex-shrink-0"
            style={{ color: "#BFDBFE", fontSize: "6px", padding: "0 4px" }}
          >
            ●
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <section className="py-8 px-4 lg:px-6" style={{ background: "#F8FAFC" }}>
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid #E2E8F0", background: "#ffffff" }}
        >
          <div className="overflow-hidden py-5">
            <div ref={wrapRef} style={{ display: "flex", width: "max-content" }}>
              {track}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
