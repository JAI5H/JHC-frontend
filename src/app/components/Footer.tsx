import { MapPin, Phone, Mail, Linkedin, Twitter, Facebook } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import jhcLogo from "figma:asset/jhc-logo.png";

const companyLinks = [
  "About JHC",
  "Leadership Team",
  "Careers",
  "News & Insights",
  "Partners",
  "Privacy Policy",
];

const serviceLinks = [
  "Operations Management",
  "Remote Workforce Solutions",
  "Recruitment Services",
  "Project-Based Staffing",
  "Strategic Consulting",
];

const locations = [
  {
    city: "New Cairo",
    country: "Egypt",
    address: "5th Settlement, New Cairo\nCairo Governorate",
    phone: "+20 100 000 0000",
  },
  {
    city: "Riyadh",
    country: "Saudi Arabia",
    address: "King Fahd Road, Al Olaya\nRiyadh 11564",
    phone: "+966 11 234 5678",
  },
];

const socials = [
  { icon: <Linkedin size={16} />, label: "LinkedIn", href: "#" },
  { icon: <Twitter size={16} />, label: "Twitter / X", href: "#" },
  { icon: <Facebook size={16} />, label: "Facebook", href: "#" },
];

export function Footer() {
  return (
    <footer style={{ background: "#0F172A" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Top brand strip */}
        <div
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 py-10 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <ImageWithFallback
            src={jhcLogo}
            alt="JHC – Jisr Human Capital"
            className="h-8 w-auto object-contain"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <p className="text-sm leading-relaxed max-w-md" style={{ color: "#475569" }}>
            Strategic human capital partner for leading organizations across the GCC — delivering talent, operations, and sustainable growth since 2009.
          </p>
          {/* Social icons */}
          <div className="flex gap-2 flex-shrink-0">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150"
                style={{ background: "rgba(255,255,255,0.05)", color: "#64748B" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#1D4ED8";
                  (e.currentTarget as HTMLElement).style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                  (e.currentTarget as HTMLElement).style.color = "#64748B";
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* 4-column grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 py-14 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>

          {/* Column 1: Company */}
          <div>
            <div
              className="text-xs font-bold uppercase tracking-widest mb-6 pb-3 border-b"
              style={{ color: "#60A5FA", borderColor: "rgba(96,165,250,0.2)" }}
            >
              Company
            </div>
            <ul className="flex flex-col gap-3.5">
              {companyLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm transition-colors duration-150"
                    style={{ color: "#64748B" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ffffff")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#64748B")}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Services */}
          <div>
            <div
              className="text-xs font-bold uppercase tracking-widest mb-6 pb-3 border-b"
              style={{ color: "#60A5FA", borderColor: "rgba(96,165,250,0.2)" }}
            >
              Services
            </div>
            <ul className="flex flex-col gap-3.5">
              {serviceLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#services"
                    className="text-sm transition-colors duration-150"
                    style={{ color: "#64748B" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ffffff")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#64748B")}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Locations */}
          <div>
            <div
              className="text-xs font-bold uppercase tracking-widest mb-6 pb-3 border-b"
              style={{ color: "#60A5FA", borderColor: "rgba(96,165,250,0.2)" }}
            >
              Locations
            </div>
            <div className="flex flex-col gap-7">
              {locations.map((loc) => (
                <div key={loc.city}>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={13} style={{ color: "#60A5FA", flexShrink: 0 }} />
                    <span className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
                      {loc.city},{" "}
                      <span style={{ color: "#64748B", fontWeight: 400 }}>{loc.country}</span>
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed ml-5 mb-2" style={{ color: "#475569", whiteSpace: "pre-line" }}>
                    {loc.address}
                  </p>
                  <a
                    href={`tel:${loc.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 text-xs ml-5 transition-colors"
                    style={{ color: "#64748B" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#60A5FA")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#64748B")}
                  >
                    <Phone size={11} style={{ color: "#60A5FA" }} />
                    {loc.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: Contact */}
          <div>
            <div
              className="text-xs font-bold uppercase tracking-widest mb-6 pb-3 border-b"
              style={{ color: "#60A5FA", borderColor: "rgba(96,165,250,0.2)" }}
            >
              Contact
            </div>
            <div className="flex flex-col gap-5">
              <div>
                <div className="text-xs font-semibold mb-2" style={{ color: "#94A3B8" }}>General Enquiries</div>
                <a
                  href="mailto:info@jhc-group.com"
                  className="flex items-center gap-2 text-sm transition-colors"
                  style={{ color: "#64748B" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ffffff")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#64748B")}
                >
                  <Mail size={13} style={{ color: "#60A5FA" }} />
                  info@jhc-group.com
                </a>
              </div>
              <div>
                <div className="text-xs font-semibold mb-2" style={{ color: "#94A3B8" }}>Talent Network</div>
                <a
                  href="mailto:talent@jhc-group.com"
                  className="flex items-center gap-2 text-sm transition-colors"
                  style={{ color: "#64748B" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ffffff")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#64748B")}
                >
                  <Mail size={13} style={{ color: "#60A5FA" }} />
                  talent@jhc-group.com
                </a>
              </div>
              <div>
                <div className="text-xs font-semibold mb-2" style={{ color: "#94A3B8" }}>Business Partnerships</div>
                <a
                  href="mailto:partners@jhc-group.com"
                  className="flex items-center gap-2 text-sm transition-colors"
                  style={{ color: "#64748B" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ffffff")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#64748B")}
                >
                  <Mail size={13} style={{ color: "#60A5FA" }} />
                  partners@jhc-group.com
                </a>
              </div>

              {/* CTA */}
              <a
                href="#contact"
                className="mt-2 inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold text-white text-center transition-all duration-200"
                style={{ background: "#1D4ED8" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#0B1F4D")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")}
              >
                Book a Consultation
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <p className="text-xs" style={{ color: "#334155" }}>
            © 2026 JHC – Jisr Human Capital. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Terms of Use", "Privacy Policy", "Cookie Policy"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs transition-colors"
                style={{ color: "#334155" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#64748B")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#334155")}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
