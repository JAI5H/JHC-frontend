const partners = [
  "Saudi Aramco",
  "NEOM",
  "Emaar Group",
  "stc Group",
  "Aldar Properties",
  "SABIC",
  "Mubadala",
  "Al Rajhi Bank",
];

export function TrustedPartners() {
  return (
    <section className="py-14 px-4 lg:px-6" style={{ background: "#F8FAFC" }}>
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-3xl px-10 py-10"
          style={{ background: "#ffffff", border: "1px solid #E2E8F0" }}
        >
          <p className="text-center text-xs font-semibold uppercase tracking-widest mb-8" style={{ color: "#94A3B8" }}>
            Trusted by Leading Organizations Across the GCC
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-5">
            {partners.map((name) => (
              <div
                key={name}
                className="flex items-center gap-2.5 group cursor-default transition-opacity duration-200 opacity-50 hover:opacity-100"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: "#EFF6FF", color: "#1D4ED8" }}
                >
                  {name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <span className="text-sm font-semibold" style={{ color: "#0F172A" }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
