import { useState } from "react";
import { ArrowRight, MapPin, Phone, Mail, CheckCircle2, Loader } from "lucide-react";

const SERVICES = [
  "Operations Management",
  "Remote Workforce Solutions",
  "Recruitment Services",
  "Project-Based Staffing",
  "Strategic Consulting",
];

const OFFICES = [
  {
    city: "New Cairo",
    country: "Egypt",
    address: "5th Settlement, New Cairo, Cairo Governorate",
    phone: "+20 100 000 0000",
    email: "cairo@jhc-group.com",
  },
  {
    city: "Riyadh",
    country: "Saudi Arabia",
    address: "King Fahd Road, Al Olaya, Riyadh 11564",
    phone: "+966 11 234 5678",
    email: "riyadh@jhc-group.com",
  },
];

export function ContactSection() {
  const [form, setForm] = useState({
    name: "", company: "", email: "", phone: "", service: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1400);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #E2E8F0",
    background: "#F8FAFC",
    fontSize: "0.875rem",
    color: "#0F172A",
    outline: "none",
    transition: "border-color 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#64748B",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };

  return (
    <section id="contact" className="py-8 px-4 lg:px-6" style={{ background: "#F8FAFC" }}>
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: "#ffffff", border: "1px solid #E2E8F0" }}
        >
          {/* ── Header — same pattern as HowWeWork ── */}
          <div className="px-10 lg:px-14 pt-12 pb-10 border-b" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex flex-col lg:flex-row lg:items-end gap-6 justify-between">
              <div>
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#1D4ED8" }}
                >
                  Get in Touch
                </span>
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
                  Start Your Partnership
                </h2>
              </div>
              <p className="text-sm leading-relaxed max-w-sm" style={{ color: "#64748B" }}>
                Tell us about your workforce challenge and our GCC team will reach out within one business day.
              </p>
            </div>
          </div>

          {/* ── Body: form left | offices right ── */}
          <div className="grid lg:grid-cols-3">

            {/* ── Form (spans 2 cols) ── */}
            <div className="lg:col-span-2 p-10 lg:p-14 border-r" style={{ borderColor: "#E2E8F0" }}>
              {submitted ? (
                /* Success state */
                <div className="flex flex-col items-center justify-center text-center py-16 gap-5">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}
                  >
                    <CheckCircle2 size={28} style={{ color: "#1D4ED8" }} />
                  </div>
                  <div>
                    <div className="font-bold text-lg" style={{ color: "#0B1F4D" }}>Message Received</div>
                    <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                      Our team will be in touch within one business day.
                    </p>
                  </div>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", company: "", email: "", phone: "", service: "", message: "" }); }}
                    className="text-sm font-semibold transition-colors"
                    style={{ color: "#1D4ED8" }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  {/* Row 1: Name + Company */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label style={labelStyle}>Full Name *</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Ahmed Al-Rashid"
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                        onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Company *</label>
                      <input
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        required
                        placeholder="Your Organization"
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                        onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                      />
                    </div>
                  </div>

                  {/* Row 2: Email + Phone */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label style={labelStyle}>Work Email *</label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="you@company.com"
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                        onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone Number</label>
                      <input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+966 5X XXX XXXX"
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                        onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                      />
                    </div>
                  </div>

                  {/* Row 3: Service selector */}
                  <div>
                    <label style={labelStyle}>Service of Interest</label>
                    <select
                      name="service"
                      value={form.service}
                      onChange={handleChange}
                      style={{ ...inputStyle, cursor: "pointer" }}
                      onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                      onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                    >
                      <option value="">Select a service…</option>
                      {SERVICES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Row 4: Message */}
                  <div>
                    <label style={labelStyle}>Message *</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      placeholder="Tell us about your workforce needs, team size, and goals…"
                      style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                      onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                      onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                    />
                  </div>

                  {/* Submit */}
                  <div className="flex items-center justify-between gap-4 pt-2">
                    <p className="text-xs" style={{ color: "#94A3B8" }}>
                      We respond within 1 business day. No spam, ever.
                    </p>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition-all duration-150"
                      style={{
                        background: loading ? "#64748B" : "#0B1F4D",
                        cursor: loading ? "not-allowed" : "pointer",
                      }}
                      onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#1D4ED8"; }}
                      onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#0B1F4D"; }}
                    >
                      {loading ? (
                        <><Loader size={15} className="animate-spin" /> Sending…</>
                      ) : (
                        <>Send Message <ArrowRight size={15} /></>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ── Offices sidebar ── */}
            <div className="flex flex-col" style={{ background: "#F8FAFC" }}>
              {/* Top: offices */}
              <div className="flex flex-col gap-0 flex-1">
                {OFFICES.map((office, i) => (
                  <div
                    key={office.city}
                    className="p-8 flex flex-col gap-4"
                    style={{ borderBottom: i < OFFICES.length - 1 ? "1px solid #E2E8F0" : "none" }}
                  >
                    {/* City label */}
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "#0B1F4D" }}
                      >
                        <MapPin size={13} style={{ color: "#60A5FA" }} />
                      </div>
                      <div>
                        <div className="text-sm font-bold" style={{ color: "#0B1F4D" }}>{office.city}</div>
                        <div className="text-xs" style={{ color: "#94A3B8" }}>{office.country}</div>
                      </div>
                    </div>

                    {/* Address */}
                    <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>{office.address}</p>

                    {/* Contact details */}
                    <div className="flex flex-col gap-2">
                      <a
                        href={`tel:${office.phone.replace(/\s/g, "")}`}
                        className="inline-flex items-center gap-2 text-xs font-medium transition-colors"
                        style={{ color: "#0B1F4D" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#1D4ED8")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#0B1F4D")}
                      >
                        <Phone size={12} style={{ color: "#1D4ED8", flexShrink: 0 }} />
                        {office.phone}
                      </a>
                      <a
                        href={`mailto:${office.email}`}
                        className="inline-flex items-center gap-2 text-xs font-medium transition-colors"
                        style={{ color: "#0B1F4D" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#1D4ED8")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#0B1F4D")}
                      >
                        <Mail size={12} style={{ color: "#1D4ED8", flexShrink: 0 }} />
                        {office.email}
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom: response-time badge */}
              <div
                className="m-6 rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: "#1D4ED8" }} />
                  <span className="text-xs font-semibold" style={{ color: "#1D4ED8" }}>
                    Typical Response Time
                  </span>
                </div>
                <div
                  style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0B1F4D", lineHeight: 1, letterSpacing: "-0.02em" }}
                >
                  &lt; 24hrs
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>
                  Our GCC team responds to all enquiries within one business day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
