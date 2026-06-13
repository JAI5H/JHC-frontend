import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { TrustedPartners } from "../components/TrustedPartners";
import { MetricsSection } from "../components/MetricsSection";
import { WorkforceSection } from "../components/WorkforceSection";
import { ServicesSection } from "../components/ServicesSection";
import { MarqueeTicker } from "../components/MarqueeTicker";
import { WhyChooseSection } from "../components/WhyChooseSection";
import { HowWeWork } from "../components/HowWeWork";
import { Testimonials } from "../components/Testimonials";
import { CTASection } from "../components/CTASection";
import { ContactSection } from "../components/ContactSection";
import { Footer } from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#F8FAFC" }}>
      <Navbar />
      <main>
        <HeroSection />
        <TrustedPartners />
        <MetricsSection />
        <WorkforceSection />
        <ServicesSection />
        <MarqueeTicker />
        <WhyChooseSection />
        <HowWeWork />
        <Testimonials />
        <CTASection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
