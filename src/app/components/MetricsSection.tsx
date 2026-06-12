const metrics = [
  { value: "500+", label: "Professionals Deployed", desc: "Across the GCC" },
  { value: "15+", label: "Years of Experience", desc: "In GCC markets" },
  { value: "95%", label: "Client Retention", desc: "Long-term partners" },
  { value: "30%", label: "Cost Reduction", desc: "Average client savings" },
];

export function MetricsSection() {
  return (
    <section className="px-4 lg:px-6 pb-6" style={{ background: "#F8FAFC" }}>
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-3xl px-8 py-12 lg:py-16"
          style={{ background: "#0B1F4D" }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x divide-white/10">
            {metrics.map((m, i) => (
              <div key={i} className="flex flex-col items-center lg:items-start lg:px-10 text-center lg:text-left">
                <div
                  style={{
                    fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
                    fontWeight: 900,
                    color: "#60A5FA",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {m.value}
                </div>
                <div className="text-sm font-semibold mt-3" style={{ color: "#ffffff" }}>{m.label}</div>
                <div className="text-xs mt-1" style={{ color: "#60A5FA", opacity: 0.7 }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
