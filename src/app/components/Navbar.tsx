import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import jhcLogo from "figma:asset/jhc-logo.png";

const navLinks = [
  { label: "About Us", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "How We Work", href: "#how-we-work" },
  { label: "Careers", href: "#careers" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #E2E8F0" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between" style={{ height: "72px" }}>
        <a href="#home" className="flex items-center flex-shrink-0">
          <ImageWithFallback src={jhcLogo} alt="JHC – Jisr Human Capital" className="h-9 w-auto object-contain" />
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium transition-colors duration-150"
              style={{ color: "#64748B" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#0B1F4D")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#64748B")}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href="#contact"
            className="text-sm font-medium px-4 py-2 rounded-xl border transition-all duration-150"
            style={{ borderColor: "#E2E8F0", color: "#64748B" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#0B1F4D";
              (e.currentTarget as HTMLElement).style.color = "#0B1F4D";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0";
              (e.currentTarget as HTMLElement).style.color = "#64748B";
            }}
          >
            Join Talent Network
          </a>
          <a
            href="#contact"
            className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-all duration-200"
            style={{ background: "#0B1F4D" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#0B1F4D")}
          >
            Start Your Partnership
          </a>
        </div>

        <button
          className="lg:hidden p-2 rounded-lg transition-colors"
          style={{ color: "#0B1F4D" }}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t px-6 py-5 flex flex-col gap-4" style={{ borderColor: "#E2E8F0" }}>
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-sm font-medium" style={{ color: "#0F172A" }} onClick={() => setMobileOpen(false)}>
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-3 border-t" style={{ borderColor: "#E2E8F0" }}>
            <a href="#contact" className="text-sm font-medium px-4 py-2.5 rounded-xl border text-center" style={{ borderColor: "#0B1F4D", color: "#0B1F4D" }} onClick={() => setMobileOpen(false)}>Join Talent Network</a>
            <a href="#contact" className="text-sm font-semibold px-4 py-2.5 rounded-xl text-white text-center" style={{ background: "#0B1F4D" }} onClick={() => setMobileOpen(false)}>Start Your Partnership</a>
          </div>
        </div>
      )}
    </header>
  );
}
