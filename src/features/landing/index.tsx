import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Facebook,
  Globe,
  Layers,
  Layers3,
  Lightbulb,
  Linkedin,
  Mail,
  Menu,
  MapPin,
  Phone,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  UserSearch,
  Users,
  Wifi,
  Workflow,
  X,
} from "lucide-react";
import logo from "../../imgs/logo.png";
import heroCenterLogo from "../../imgs/undraw_business-call_w1gr1.svg";
import { CEOMessage } from "../../app/components/CEOMessage";
import CountUp from "../../app/components/CountUp";
import { useTranslation } from "../../app/hooks/useTranslation";
import { useLanguage } from "../../app/providers/LanguageProvider";
import { translations } from "../../locales";
import { submitContactForm } from "../../services/api/contactApi";
import { getAxiosErrorMessage } from "../../services/api/utils";

type Metric = {
  value: string;
  label: string;
  icon: LucideIcon;
};

type FeatureCard = {
  title: string;
  description: string;
  bullets: string[];
  icon: LucideIcon;
};

type ServiceCard = {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

type ProcessStep = {
  number: string;
  title: string;
  description: string;
  tags: string[];
  icon: LucideIcon;
};

type Testimonial = {
  quote: string;
  author: string;
  role: string;
  tag: string;
};

type OrbitCard = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  width: number;
  angleOffset: number;
};

type NavSection = {
  href: "#services" | "#why-jhc" | "#how-we-work" | "#about-us" | "#contact";
  label: string;
};

type FooterAccordionSection = "company" | "services" | "locations" | "contact";
type FooterSectionTitles = Record<FooterAccordionSection, string>;

type ContactField = {
  label: string;
  placeholder: string;
  required?: boolean;
};

type OfficeLocation = {
  city: string;
  country: string;
  phone: string;
  email: string;
};

type ContactFormFieldKey = "fullName" | "company" | "phone" | "email";

const LANDING_ICON_MAP: Record<string, LucideIcon> = {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  Globe,
  Layers,
  Layers3,
  Lightbulb,
  Settings2,
  ShieldCheck,
  UserSearch,
  Users,
  Wifi,
  Workflow,
};

const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/company/jisr-human-capital",
  facebook: "https://www.facebook.com/profile.php?id=61589755710048",
} as const;

const CONTACT_FORM_FIELDS: ContactField[] = [
  { label: "Full Name", placeholder: "Ahmed Maher", required: true },
  { label: "Company", placeholder: "Your Organization", required: true },
  { label: "Work Email", placeholder: "you@company.com", required: true },
  { label: "Phone Number", placeholder: "+966 55 000 0000", required: true },
];

const CONTACT_SERVICE_OPTIONS = [
  "Recruitment",
  "Remote Teams from Egypt",
  "Operations Management",
  "Project-Based Services",
  "HR Consulting",
  "Other",
];

const OFFICE_LOCATIONS: OfficeLocation[] = [
  {
    city: "New Cairo",
    country: "Egypt",
    phone: "+201080004343",
    email: "info@jisrhc.com",
  },
  {
    city: "Riyadh",
    country: "Saudi Arabia",
    phone: "+966592368363",
    email: "info@jisrhc.com",
  },
];

const FOOTER_COMPANY_LINKS = [
  { label: "About JHC", href: "#about-us" },
  { label: "Join Talent Network", href: "/talent-network" },
];

const FOOTER_SERVICE_LINKS = [
  { label: "Operations Management", href: "#services" },
  { label: "Remote Workforce Solutions", href: "#services" },
  { label: "Recruitment Services", href: "#services" },
  { label: "Project-Based Staffing", href: "#services" },
  { label: "Strategic Consulting", href: "#services" },
];

const FOOTER_CONTACT_CHANNELS = [
  ["General Enquiries", "info@jisrhc.com"],
  ["Talent Network", "info@jisrhc.com"],
  ["Business Partnerships", "info@jisrhc.com"],
] as const;

const FOOTER_POLICY_LINKS = ["Terms of Use", "Privacy Policy", "Cookie Policy"] as const;

const CONTACT_SECTION_COPY = {
  eyebrow: "Get In Touch",
  title: "Start Your Partnership",
  description:
    "Tell us about your workforce challenge and our GCC team will reach out with next steps within one business day.",
  serviceLabel: "Service of Interest",
  servicePlaceholder: "Select a service",
  customServiceLabel: "Specify Service",
  customServicePlaceholder: "Please describe the specific service requirement you need...",
  messageLabel: "Message",
  messagePlaceholder: "Tell us about your workforce needs, team size, and goals...",
  responseNote: "We respond within 1 business day. No spam, ever.",
  submitLabel: "Send Message",
};

const FINAL_CTA_COPY = {
  title: "Build Your Workforce with Confidence.",
  description:
    "Join industry leaders who trust JHC to navigate complex human capital challenges and drive sustainable growth.",
  primaryCta: "Contact Sales Team",
  secondaryCta: "Explore Solutions",
};

const FOOTER_COPY = {
  description:
    "Jisr Human Capital. Strategic workforce solutions for the modern enterprise in the GCC region, combining regional expertise with global standards.",
  copyright: "© 2026 JHC – Jisr Human Capital. All Rights Reserved.",
};

const metrics: Metric[] = [
  { value: "15+", label: "Years of Experience", icon: BadgeCheck },
  { value: "500+", label: "Managed Talents", icon: Users },
  { value: "94%", label: "Client Retention Rate", icon: Workflow },
  { value: "Up to 98%", label: "Operational Cost Savings", icon: CircleDollarSign },
  { value: "120+", label: "Strategic Partnerships", icon: Building2 },
];

const featureCards: FeatureCard[] = [
  {
    title: "Strategic Partnership",
    description:
      "We embed into your leadership structure not as a vendor, but as a long-term partner in workforce transformation, risk reduction, and talent execution.",
    bullets: ["Executive-level engagement", "Dedicated account teams", "Quarterly business reviews"],
    icon: ShieldCheck,
  },
  {
    title: "Flexible Operating Models",
    description:
      "Fully outsourced, hybrid, or advisory we design the model that fits your business reality today and evolves with your growth.",
    bullets: ["Fully managed operations", "Hybrid workforce models", "Scalable on demand"],
    icon: Layers3,
  },
  {
    title: "Deep GCC Market Expertise",
    description:
      "15+ years across KSA, UAE, Qatar, Kuwait, Bahrain, and Oman with regulatory, cultural, and talent market mastery that matters.",
    bullets: ["Saudization compliance", "6 GCC markets active", "Local regulatory know-how"],
    icon: Globe,
  },
];

const services: ServiceCard[] = [
  {
    number: "01",
    title: "Operations Management",
    description:
      "End-to-end management of business operations, workforce performance, and processes tailored to your industry and scale.",
    icon: Settings2,
  },
  {
    number: "02",
    title: "Remote Workforce Solutions",
    description:
      "Compliant, tech-enabled distributed teams across the GCC, EU, and beyond with infrastructure, onboarding, and real-time oversight.",
    icon: Wifi,
  },
  {
    number: "03",
    title: "Recruitment Services",
    description:
      "Executive and mid-level talent acquisition with deep GCC market intelligence, fast placement, and role-fit assurance.",
    icon: UserSearch,
  },
  {
    number: "04",
    title: "Project-Based Staffing",
    description:
      "Agile, on-demand staffing for short-term initiatives, seasonal peaks, and specialized project teams across key disciplines.",
    icon: Layers,
  },
  {
    number: "05",
    title: "Strategic Consulting",
    description:
      "Advisory services that align your human capital strategy with business objectives and sustainable operating excellence.",
    icon: Lightbulb,
  },
];

const servicePageRoutes = [
  "/services/operations-management",
  "/services/remote-workforce",
  "/services/recruitment",
  "/services/project-based-hiring",
  "/services/strategic-consulting",
] as const;

const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Understand Business Needs",
    description:
      "Deep discovery sessions to map your strategic goals, operational constraints, workforce gaps, and growth ambitions.",
    tags: ["Workforce Review", "Gap Analysis", "Stakeholder Mapping"],
    icon: BriefcaseBusiness,
  },
  {
    number: "02",
    title: "Design the Operating Model",
    description:
      "We architect a bespoke human capital framework that matches your industry, regulatory needs, and growth stage.",
    tags: ["Model Design", "Compliance Mapping", "Governance"],
    icon: Layers3,
  },
  {
    number: "03",
    title: "Deploy Talent",
    description:
      "Source, hire, and onboard the right professionals at speed, compliant with all GCC labor and local market requirements.",
    tags: ["Talent Sourcing", "Vetting", "Onboarding"],
    icon: Users,
  },
  {
    number: "04",
    title: "Manage Operations",
    description:
      "Hands-on operational oversight with real-time reporting, SLA management, payroll support, and quality assurance.",
    tags: ["Performance Tracking", "Reporting", "Issue Resolution"],
    icon: Workflow,
  },
  {
    number: "05",
    title: "Continuously Optimize",
    description:
      "Ongoing performance reviews, strategic recalibration, and workforce recommendations to maximize ROI over time.",
    tags: ["Quarterly Reviews", "Scale Planning", "Optimization"],
    icon: ArrowRight,
  },
];

const testimonials: Testimonial[] = [
  {
    quote:
      "JHC gave us the regulatory expertise and talent infrastructure to scale in Saudi Arabia 60% faster than any internal team could have managed.",
    author: "Alaa Mohamed",
    role: "Human Capital Director",
    tag: "MED",
  },
  {
    quote:
      "They redesigned our operating model end-to-end, reducing overhead by 28% while materially improving service delivery quality across MENA.",
    author: "Layla Hassan",
    role: "VP, Operations",
    tag: "MFG",
  },
  {
    quote:
      "From 12 to 80 distributed professionals across 3 markets in under 5 months. The JHC team made it seamless, compliant, and fast.",
    author: "Sara El Fadhel",
    role: "Director of Business Operations",
    tag: "GCC",
  },
];

const marqueeItems = [
  "BPO",
  "•",
  "Flexible Workforce Models",
  "•",
  "GCC-Native Expertise",
  "•",
  "Saudization Compliance",
  "•",
  "Remote Workforce",
  "•",
];

const orbitCards: OrbitCard[] = [
  {
    title: "Enterprise Clients",
    subtitle: "Across 6 GCC Markets",
    icon: Building2,
    width: 248,
    angleOffset: -Math.PI / 2,
  },
  {
    title: "Up to 40%",
    subtitle: "Operational Cost Savings",
    icon: CircleDollarSign,
    width: 248,
    angleOffset: -Math.PI / 2 + (2 * Math.PI) / 3,
  },
  {
    title: "15+ Years of Excellence",
    subtitle: "Serving GCC Markets",
    icon: BadgeCheck,
    width: 248,
    angleOffset: -Math.PI / 2 + (4 * Math.PI) / 3,
  },
];

const navSections: NavSection[] = [
  { href: "#about-us", label: "About Us" },
  { href: "#why-jhc", label: "Why JHC" },
  { href: "#services", label: "Our Services" },
  { href: "#how-we-work", label: "How We Work" },
  { href: "#contact", label: "Contact" },
];

const mobileNavSections: Array<Pick<NavSection, "href" | "label">> = [
  { href: "#about-us", label: "About Us" },
  { href: "#services", label: "Our Services" },
  { href: "#how-we-work", label: "How We Work" },
  { href: "#contact", label: "Contact" },
];

const mobileHeroMetricCardClass =
  "w-full rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))] p-4";

const mobileHeroPrimaryButtonClass =
  "inline-flex h-[56px] items-center justify-center whitespace-nowrap rounded-[18px] bg-[linear-gradient(180deg,#4f8cff,#2563eb)] px-4 text-[12px] font-semibold text-white min-[390px]:flex-[1.08]";

const mobileHeroSecondaryButtonClass =
  "inline-flex h-[56px] items-center justify-center whitespace-nowrap rounded-[18px] border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-4 text-[12px] font-medium text-white/90 backdrop-blur-[12px] min-[390px]:flex-[0.92]";

function iconWrap(Icon: LucideIcon, tone: "light" | "dark" = "light") {
  return (
    <div
      className={[
        "flex items-center justify-center rounded-full border",
        tone === "dark"
          ? "border-white/10 bg-white/10 text-[#60a5fa]"
          : "border-[#dbeafe] bg-[#eff6ff] text-[#2563eb]",
      ].join(" ")}
    >
      <Icon size={18} strokeWidth={1.9} />
    </div>
  );
}

function logoStrip() {
  return Array.from({ length: 7 }, (_, index) => (
    <div key={index} className="flex h-[42px] w-[101px] items-center justify-center">
      <img alt="JHC" className="h-[24px] w-auto opacity-95" src={logo} />
    </div>
  ));
}

function socialButton(
  Icon: LucideIcon,
  options?: {
    className?: string;
    iconClassName?: string;
    iconSize?: number;
    strokeWidth?: number;
    fill?: boolean;
    href?: string;
  }
) {
  const {
    className = "",
    iconClassName = "",
    iconSize = 15,
    strokeWidth = 1.9,
    fill = false,
    href = "#",
  } = options ?? {};

  return (
    <a
      className={[
        "flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#94a3b8] transition hover:border-white/20 hover:text-white",
        className,
      ].join(" ")}
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <Icon
        className={iconClassName}
        fill={fill ? "currentColor" : "none"}
        size={iconSize}
        strokeWidth={strokeWidth}
      />
    </a>
  );
}

function languageSwitcher({
  language,
  isArabic,
  onLight,
  setLanguage,
  className = "",
}: {
  language: "en" | "ar";
  isArabic: boolean;
  onLight: boolean;
  setLanguage: (language: "en" | "ar") => void;
  className?: string;
}) {
  const baseTextColor = onLight ? "#64748b" : "rgba(255,255,255,0.72)";
  const activeBackground = onLight ? "#EFF6FF" : "rgba(255,255,255,0.08)";
  const activeBorder = onLight ? "rgba(96,165,250,0.38)" : "rgba(255,255,255,0.14)";
  const arabicScriptPattern = /[\u0600-\u06FF]/;
  const languageOptions = isArabic
    ? [
        { code: "ar", label: "العربية" },
        { code: "en", label: "EN" },
      ]
    : [
        { code: "en", label: "EN" },
        { code: "ar", label: "العربية" },
      ];

  return (
    <div
      aria-label={isArabic ? "تبديل اللغة" : "Language switcher"}
      role="group"
      className={["inline-flex items-center rounded-[14px] border p-1", className].join(" ")}
      style={{
        borderColor: onLight ? "rgba(11,31,77,0.10)" : "rgba(255,255,255,0.14)",
        background: onLight ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.04)",
        direction: isArabic ? "rtl" : "ltr",
      }}
    >
      {languageOptions.map((option) => {
        const active = language === option.code;
        const optionUsesArabicFont = arabicScriptPattern.test(option.label);
        return (
          <button
            key={option.code}
            className="subtle-button-hover rounded-[10px] px-3 py-[8px] text-[12px] font-bold transition-colors duration-200"
            onClick={() => setLanguage(option.code as "en" | "ar")}
            aria-label={option.code === "ar" ? "Switch language to Arabic" : "Switch language to English"}
            aria-pressed={active}
            lang={option.code}
            style={{
              color: active ? (onLight ? "#0B1F4D" : "#ffffff") : baseTextColor,
              background: active ? activeBackground : "transparent",
              border: active ? `1px solid ${activeBorder}` : "1px solid transparent",
              fontFamily: optionUsesArabicFont ? "'Cairo', system-ui, sans-serif" : undefined,
            }}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function statChip(title: string, subtitle: string, icon: LucideIcon, className: string) {
  const Icon = icon;
  const iconSize =
    icon === Building2 || icon === CircleDollarSign
      ? 16
      : 17;
  const iconStrokeWidth =
    icon === Building2 || icon === CircleDollarSign
      ? 1.85
      : 2;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[18px] border border-[#3b82f6]/40 bg-[linear-gradient(180deg,rgba(20,33,68,0.96),rgba(13,24,54,0.92))] px-[14px] py-[15px] backdrop-blur-[18px] ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-[40px] items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,#3b82f6,#2563eb)] text-white">
          <Icon size={iconSize} strokeWidth={iconStrokeWidth} />
        </div>
        <div>
          <p className="text-[14px] font-semibold leading-[22px] text-white">{title}</p>
          <p className="whitespace-nowrap text-[13px] leading-[19px] text-[#94a3b8]">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function getMetricCountParts(value: string) {
  const numberMatch = value.match(/(\d+(?:\.\d+)?)/);

  if (!numberMatch) {
    return { from: 0, to: 0, prefix: value, suffix: "" };
  }

  const numericPart = numberMatch[0];
  const startIndex = numberMatch.index ?? 0;
  const endIndex = startIndex + numericPart.length;

  return {
    from: 0,
    to: Number.parseFloat(numericPart),
    prefix: value.slice(0, startIndex),
    suffix: value.slice(endIndex),
  };
}

function getArabicMobileMetricValue(value: string) {
  if (value === "15+") return "أكثر من 15";
  if (value === "500+") return "+500";
  if (value === "98%" || value === "Up to 98%") return "حتى 98%";
  return value;
}

function getArabicMarqueePhrases(items: readonly string[]) {
  const phrases: string[] = [];

  for (let index = 0; index < items.length; index += 2) {
    const bullet = items[index];
    const phrase = items[index + 1];

    if ((bullet === "●" || bullet === "•") && phrase) {
      phrases.push(phrase);
    }
  }

  return phrases;
}

export default function JhcLandingPage() {
  const { landing } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const isArabic = language === "ar";
  const heroCopy = landing.hero;
  const SOCIAL_LINKS = landing.socialLinks;
  const CONTACT_FORM_FIELDS = landing.contactFormFields as unknown as ContactField[];
  const CONTACT_SERVICE_OPTIONS = landing.contactServiceOptions;
  const OFFICE_LOCATIONS = landing.officeLocations as unknown as OfficeLocation[];
  const FOOTER_COMPANY_LINKS = landing.footerCompanyLinks;
  const FOOTER_SERVICE_LINKS = landing.footerServiceLinks;
  const FOOTER_CONTACT_CHANNELS = landing.footerContactChannels;
  const FOOTER_POLICY_LINKS = landing.footerPolicyLinks;
  const CONTACT_SECTION_COPY = landing.contactSection;
  const FINAL_CTA_COPY = landing.finalCta;
  const FOOTER_COPY = landing.footer;
  const FOOTER_SECTION_TITLES = landing.footerSectionTitles as FooterSectionTitles;
  const metrics: Metric[] = landing.metrics.map((item) => ({ ...item, icon: LANDING_ICON_MAP[item.icon] }));
  const featureCards: FeatureCard[] = landing.featureCards.map((item) => ({ ...item, icon: LANDING_ICON_MAP[item.icon] }));
  const services: ServiceCard[] = landing.services.map((item) => ({ ...item, icon: LANDING_ICON_MAP[item.icon] }));
  const processSteps: ProcessStep[] = landing.processSteps.map((item) => ({ ...item, icon: LANDING_ICON_MAP[item.icon] }));
  const testimonials: Testimonial[] = [...landing.testimonials];
  const marqueeItems = landing.marqueeItems;
  const orbitCards: OrbitCard[] = landing.orbitCards.map((item) => ({ ...item, icon: LANDING_ICON_MAP[item.icon] }));
  const heroOrbitCards: OrbitCard[] = translations.en.landing.hero.orbitCards.map((item) => ({ ...item, icon: LANDING_ICON_MAP[item.icon] }));
  const navSections: NavSection[] = landing.navSections as unknown as NavSection[];
  const heroNavSections: NavSection[] = heroCopy.desktopNav.links as unknown as NavSection[];
  const mobileNavSections: Array<Pick<NavSection, "href" | "label">> = landing.mobileNavSections as unknown as Array<Pick<NavSection, "href" | "label">>;

  const orbitCardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const testimonialsCarouselRef = useRef<HTMLDivElement | null>(null);
  const testimonialCardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const mobileServiceTriggerRef = useRef<HTMLButtonElement | null>(null);
  const desktopServiceTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [contactForm, setContactForm] = useState<Record<ContactFormFieldKey, string>>({
    fullName: "",
    company: "",
    phone: "",
    email: "",
  });
  const [selectedService, setSelectedService] = useState("");
  const [customService, setCustomService] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitState, setContactSubmitState] = useState<"idle" | "success" | "error">("idle");
  const [contactSubmitMessage, setContactSubmitMessage] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [navOnLight, setNavOnLight] = useState(false);
  const [activeSection, setActiveSection] = useState<NavSection["href"] | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFooterSection, setOpenFooterSection] = useState<FooterAccordionSection | null>(null);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);

  const contactFieldKeys: ContactFormFieldKey[] = ["fullName", "company", "phone", "email"];
  const subtleButtonHoverClassName = "subtle-button-hover";
  const cardHoverClassName = "card-hover-lift";

  const updateContactField = (key: ContactFormFieldKey, value: string) => {
    setContactForm((current) => ({ ...current, [key]: value }));
  };

  const handleContactSubmit = async () => {
    if (contactSubmitting) return;

    const serviceValue =
      selectedService === CONTACT_SECTION_COPY.otherServiceOption
        ? customService.trim()
        : selectedService.trim();

    if (
      !contactForm.fullName.trim() ||
      !contactForm.company.trim() ||
      !contactForm.phone.trim() ||
      !contactForm.email.trim() ||
      !contactMessage.trim()
    ) {
      setContactSubmitState("error");
      setContactSubmitMessage(isArabic ? "يرجى استكمال جميع الحقول المطلوبة قبل الإرسال." : "Please complete all required fields before submitting.");
      return;
    }

    setContactSubmitting(true);
    setContactSubmitState("idle");
    setContactSubmitMessage("");

    try {
      await submitContactForm({
        fullName: contactForm.fullName.trim(),
        company: contactForm.company.trim(),
        phone: contactForm.phone.trim(),
        email: contactForm.email.trim(),
        service: serviceValue,
        message: contactMessage.trim(),
      });

      setContactForm({
        fullName: "",
        company: "",
        phone: "",
        email: "",
      });
      setSelectedService("");
      setCustomService("");
      setContactMessage("");
      setIsDropdownOpen(false);
      setContactSubmitState("success");
      setContactSubmitMessage(
        isArabic
          ? "تم إرسال طلبك بنجاح. سيتواصل فريق JHC معك خلال يوم عمل واحد."
          : "Your request has been sent successfully. The JHC team will contact you within one business day.",
      );
    } catch (requestError) {
      setContactSubmitState("error");
      setContactSubmitMessage(
        getAxiosErrorMessage(
          requestError,
          isArabic ? "تعذر إرسال الطلب الآن. يرجى المحاولة مرة أخرى." : "Unable to submit your request right now. Please try again.",
        ),
      );
    } finally {
      setContactSubmitting(false);
    }
  };

  useEffect(() => {
    let frameId = 0;
    const durationMs = 28000;
    const start = performance.now();
    const radius = 237;

    const update = (now: number) => {
      const progress = ((now - start) % durationMs) / durationMs;
      const baseAngle = progress * Math.PI * 2;

      heroOrbitCards.forEach((card, index) => {
        const el = orbitCardRefs.current[index];
        if (!el) return;

        const angle = baseAngle + card.angleOffset;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%)`;
      });

      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    const onScroll = () => setNavOnLight(window.scrollY > 980);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
        mobileServiceTriggerRef.current?.focus();
        desktopServiceTriggerRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    const sectionElements = navSections
      .map(({ href }) => document.querySelector(href))
      .filter((element): element is HTMLElement => element instanceof HTMLElement);

    if (sectionElements.length === 0) return;

    const visibleSections = new Map<string, number>();
    const heroSection = document.querySelector("section");

    const updateActiveSectionFromScroll = () => {
      if (!(heroSection instanceof HTMLElement)) return false;

      const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
      const navOffset = 140;

      if (window.scrollY < heroBottom - navOffset) {
        setActiveSection(null);
        return true;
      }

      return false;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (updateActiveSectionFromScroll()) return;

        entries.forEach((entry) => {
          const id = `#${entry.target.id}`;
          if (entry.isIntersecting) {
            visibleSections.set(id, entry.intersectionRatio);
          } else {
            visibleSections.delete(id);
          }
        });

        let nextSection = activeSection;
        let maxRatio = 0;

        visibleSections.forEach((ratio, id) => {
          if (ratio >= maxRatio) {
            maxRatio = ratio;
            nextSection = id as NavSection["href"];
          }
        });

        if (nextSection !== activeSection) {
          setActiveSection(nextSection);
        }
      },
      {
        threshold: [0.35, 0.5, 0.65, 0.8],
        rootMargin: "-120px 0px -35% 0px",
      },
    );

    sectionElements.forEach((element) => observer.observe(element));
    const handleHeroScroll = () => {
      updateActiveSectionFromScroll();
    };
    window.addEventListener("scroll", handleHeroScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleHeroScroll);
    };
  }, [activeSection]);

  useEffect(() => {
    const carousel = testimonialsCarouselRef.current;
    if (!carousel) return;

    let ticking = false;

    const updateActiveCard = () => {
      ticking = false;
      const carouselRect = carousel.getBoundingClientRect();
      const probeX = carouselRect.left + carouselRect.width * 0.5;

      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      testimonialCardRefs.current.forEach((card, index) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const distance = Math.abs(centerX - probeX);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveTestimonialIndex(closestIndex);
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateActiveCard);
    };

    updateActiveCard();
    carousel.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateActiveCard);

    return () => {
      carousel.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateActiveCard);
    };
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal-on-scroll, .reveal-image"));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-revealed", "true");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [language]);

  useEffect(() => {
    if (window.location.hash !== "#services") return;

    const scrollToServices = () => {
      const servicesSection = document.getElementById("services");
      if (!(servicesSection instanceof HTMLElement)) return;

      servicesSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    const frameId = window.requestAnimationFrame(scrollToServices);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [language]);

  const handleNavClick = (href: NavSection["href"]) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const target = document.querySelector(href);
    if (!(target instanceof HTMLElement)) return;
    setActiveSection(href);
    setMobileMenuOpen(false);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    setMobileMenuOpen(false);
    if (window.location.pathname !== "/") return;
    event.preventDefault();
    setActiveSection(null);
    const heroSection = document.getElementById("hero");
    if (heroSection instanceof HTMLElement) {
      heroSection.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const mobileNavSurfaceStyle = {
    border: navOnLight ? "1px solid rgba(11,31,77,0.10)" : "1px solid rgba(255,255,255,0.25)",
    background: navOnLight
      ? "linear-gradient(180deg,rgba(248,250,252,0.62),rgba(241,245,249,0.56))"
      : "linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
  } as const;

  const mobileDropdownSurfaceStyle = {
    border: navOnLight ? "1px solid rgba(11,31,77,0.10)" : "1px solid rgba(255,255,255,0.25)",
    background: navOnLight
      ? "linear-gradient(180deg,rgba(248,250,252,0.9),rgba(241,245,249,0.88))"
      : "linear-gradient(180deg,rgba(13,28,64,0.96),rgba(11,24,54,0.94))",
    backdropFilter: "blur(28px)",
    WebkitBackdropFilter: "blur(28px)",
  } as const;

  const heroArabicFontStyle = isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined;
  const operatingModelCopy = heroCopy.operatingModelPanel;
  const whyJhcCopy = landing.whyJhc;
  const servicesCopy = landing.servicesSection;
  const processCopy = landing.processSection;
  const arabicContactFontStyle = isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined;
  const arabicMarqueePhrases = isArabic ? getArabicMarqueePhrases(marqueeItems) : [];
  const arabicMarqueeLoopPhrases = isArabic
    ? [
        ...arabicMarqueePhrases,
        ...arabicMarqueePhrases,
        ...arabicMarqueePhrases,
        ...arabicMarqueePhrases,
      ]
    : [];

  return (
    <div
      className="w-full max-w-none min-w-0 overflow-x-hidden bg-[#f8fafc] text-[#0b1f4d]"
      data-mobile-arabic-typography={isArabic ? "true" : undefined}
    >
      <style>{`
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
          will-change: opacity, transform;
        }
        .reveal-image {
          opacity: 0;
          transition: opacity 0.6s ease;
          will-change: opacity;
        }
        .reveal-on-scroll[data-revealed="true"] {
          opacity: 1;
          transform: translateY(0);
        }
        .reveal-image[data-revealed="true"] {
          opacity: 1;
        }
        .card-hover-lift {
          transition: transform 0.3s ease;
          will-change: transform;
        }
        .subtle-button-hover {
          transition: transform 0.3s ease;
          will-change: transform;
        }
        @media (hover: hover) and (pointer: fine) {
          .card-hover-lift:hover {
            transform: translateY(-4px);
          }
          .subtle-button-hover:hover {
            transform: scale(1.02);
          }
        }
        @keyframes hero-logo-pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.96;
            filter: drop-shadow(0 0 0 rgba(59,130,246,0.0));
          }
          50% {
            transform: translate(-50%, -50%) scale(1.045);
            opacity: 1;
            filter: drop-shadow(0 0 18px rgba(59,130,246,0.2));
          }
        }
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes marquee-arabic {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(50%);
          }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee-ticker {
          animation: marquee 14s linear infinite;
        }
        .animate-marquee-ticker-arabic {
          animation: marquee-arabic 56s linear infinite;
        }
        @media (min-width: 768px) {
          .animate-marquee-ticker {
            animation-duration: 28s;
          }
          .animate-marquee-ticker-arabic {
            animation-duration: 56s;
          }
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .animate-marquee-ticker:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal-on-scroll,
          .reveal-image,
          .card-hover-lift,
          .subtle-button-hover {
            opacity: 1;
            transform: none;
            transition: none;
            animation: none;
            will-change: auto;
          }
          .animate-marquee,
          .animate-marquee-ticker,
          .animate-marquee-ticker-arabic {
            animation: none;
          }
        }
        @media (max-width: 767px) {
          [data-mobile-arabic-typography="true"] :is(h1, h2, h3, h4, p, span, a, button, label, li, input, textarea) {
            letter-spacing: normal;
            text-transform: none;
            font-kerning: normal;
            font-feature-settings: normal;
          }
        }
      `}</style>
      <div className="relative">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 bottom-[28%] rounded-b-[24px] bg-[#030e26] md:rounded-b-[24px]"
      />
      <section
        id="hero"
        className={[
          "relative overflow-hidden rounded-b-[24px] bg-[#030e26] pb-10 pt-[112px] md:rounded-b-[24px] md:pb-0 md:pt-0",
          isArabic ? "md:h-[980px]" : "md:h-[1020px]",
        ].join(" ")}
      >
        <div
          className="absolute inset-0 hidden opacity-100 md:block"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.0525) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.0525) 1px, transparent 1px)",
            backgroundPosition: "-18px 0",
            backgroundSize: "70px 68.94px",
          }}
        />
        <div
          className="absolute inset-0 opacity-100 md:hidden"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03255) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03255) 1px, transparent 1px)",
            backgroundPosition: "-10px 0",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="absolute inset-0 bg-[rgba(3,14,38,0.52)] md:bg-[rgba(3,14,38,0.52)]" />
        <div className="absolute left-[-18%] top-[96px] h-[180px] w-[180px] rounded-full bg-[#2563eb]/10 blur-[72px] md:hidden" />
        <div className="absolute right-[-10%] top-[230px] h-[170px] w-[170px] rounded-full bg-[#3b82f6]/8 blur-[80px] md:hidden" />
        <div className="absolute left-[382px] top-[572px] hidden size-[118px] rounded-full bg-[#2563eb]/8 blur-[36px] md:block" />
        <div className="absolute left-[1224px] top-[218px] hidden size-[118px] rounded-full bg-[#2563eb]/8 blur-[36px] md:block" />
        <div className="absolute left-[967px] top-[368px] hidden size-[118px] rounded-full bg-[#2563eb]/8 blur-[36px] md:block" />
        <div className="absolute left-[49px] top-[129px] hidden h-[307px] w-[288px] rounded-full bg-[#2563eb]/10 blur-[46px] md:block" />
        <div className="absolute left-[1013px] top-[129px] hidden h-[307px] w-[288px] rounded-full bg-[#2563eb]/10 blur-[46px] md:block" />
        <div className="absolute left-[531px] top-[73px] hidden h-[307px] w-[288px] rounded-full bg-[#2563eb]/10 blur-[46px] md:block" />
        <div className="absolute left-[223px] top-[711px] hidden h-[307px] w-[288px] rounded-full bg-[#2563eb]/10 blur-[46px] md:block" />
        <div className="absolute left-[1196px] top-[865px] hidden h-[307px] w-[288px] rounded-full bg-[#2563eb]/10 blur-[46px] md:block" />

        <div className="fixed left-1/2 top-6 z-50 w-[calc(100%-24px)] max-w-[1280px] -translate-x-1/2 md:w-[1280px]" dir="ltr">
          <div
            className="relative flex h-[72px] items-center justify-between rounded-[23px] px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors duration-200 md:h-[84px] md:px-[30px]"
            dir={isArabic ? "ltr" : "ltr"}
            style={mobileNavSurfaceStyle}
          >
            <a
              aria-label="JHC home"
              className={["inline-flex shrink-0 items-center", isArabic ? "order-2 md:absolute md:right-[30px]" : ""].join(" ")}
              href="/#hero"
              onClick={handleLogoClick}
            >
              <img
                alt="JHC"
                className="h-[34px] w-auto md:h-[42px]"
                src={logo}
              />
            </a>
            <nav
              className={[
                "hidden items-center gap-8 text-[12px] font-bold transition-colors duration-200 md:flex",
                isArabic ? "absolute left-1/2 -translate-x-1/2" : "flex-1 justify-center",
                isArabic ? "" : "uppercase tracking-[1.7px]",
              ].join(" ")}
              style={{
                color: navOnLight ? "#64748b" : "rgba(255,255,255,0.72)",
                direction: isArabic ? "rtl" : "ltr",
              }}
            >
              {heroNavSections.map(({ href, label }) => {
                const isActive = activeSection === href;
                return (
                  <a
                    key={href}
                    className={[
                      "font-bold transition-colors duration-200",
                      isArabic ? "" : "uppercase tracking-[1.7px]",
                    ].join(" ")}
                    style={{
                      color: isActive ? "#2563eb" : navOnLight ? "#64748b" : "rgba(255,255,255,0.72)",
                    }}
                    href={href}
                    onClick={handleNavClick(href)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span
                      style={{
                        ...heroArabicFontStyle,
                        textDecoration: isActive ? "underline" : "none",
                        textUnderlineOffset: "10px",
                        textDecorationThickness: "1.5px",
                        direction: isArabic ? "rtl" : "ltr",
                      }}
                    >
                      {isArabic ? label : label.toUpperCase()}
                    </span>
                  </a>
                );
              })}
            </nav>
            <div
              className={[
                "hidden items-center gap-3 md:flex",
                isArabic ? "md:absolute md:left-[30px]" : "",
              ].join(" ")}
            >
              {isArabic ? (
                <>
                  <a
                    className="w-auto rounded-[14px] bg-[linear-gradient(180deg,#4f8cff,#2563eb)] px-7 py-[12px] text-[12px] font-bold uppercase tracking-[1.4px] text-white shadow-[0_6px_18px_rgba(37,99,235,0.22)] transition-[box-shadow,transform] duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_34px_rgba(37,99,235,0.42)]"
                    href="/talent-network#application-start"
                    style={heroArabicFontStyle}
                  >
                    {heroCopy.topActions.secondary}
                  </a>
                  {languageSwitcher({ language, isArabic, onLight: navOnLight, setLanguage })}
                </>
              ) : (
                <>
                  {languageSwitcher({ language, isArabic, onLight: navOnLight, setLanguage })}
                  <a
                    className="w-auto rounded-[14px] bg-[linear-gradient(180deg,#4f8cff,#2563eb)] px-7 py-[12px] text-[12px] font-bold uppercase tracking-[1.4px] text-white shadow-[0_6px_18px_rgba(37,99,235,0.22)] transition-[box-shadow,transform] duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_34px_rgba(37,99,235,0.42)]"
                    href="/talent-network#application-start"
                  >
                    {heroCopy.topActions.secondary}
                  </a>
                </>
              )}
            </div>
            <button
              aria-controls="mobile-nav-menu"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className={[`${subtleButtonHoverClassName} inline-flex size-11 items-center justify-center rounded-[14px] border border-white/15 bg-white/[0.05] text-white transition-colors duration-200 md:hidden`, isArabic ? "order-1" : "order-2 ml-auto"].join(" ")}
              style={navOnLight ? { color: "#0B1F4D" } : undefined}
              onClick={() => setMobileMenuOpen((open) => !open)}
              type="button"
            >
              {mobileMenuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
            </button>

            <div
              className={[
                "absolute left-0 right-0 top-[calc(100%+10px)] overflow-hidden rounded-[23px] text-white shadow-[0_18px_50px_rgba(3,14,38,0.28)] transition-all duration-300 ease-out md:hidden isolate",
                mobileMenuOpen
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-2 opacity-0",
              ].join(" ")}
              id="mobile-nav-menu"
            >
              <div
                className="absolute inset-0 rounded-[23px]"
                style={mobileDropdownSurfaceStyle}
              />
	              <div className="relative z-10 flex flex-col gap-2 px-4 py-4">
	                <div className="mb-1">
	                  {languageSwitcher({ language, isArabic, onLight: navOnLight, setLanguage, className: "w-full justify-center" })}
	                </div>
	                <nav className={["flex flex-col gap-2", isArabic ? "text-right" : ""].join(" ")} aria-label="Mobile navigation">
                  {mobileNavSections.map(({ href, label }) => {
                    const isActive = activeSection === href;

                    return (
                      <a
                        key={href}
                        className={["rounded-[16px] border border-white/10 bg-white/[0.03] px-4 py-4 text-[13px] font-bold transition-colors duration-200", isArabic ? "text-right" : "uppercase tracking-[1.4px]"].join(" ")}
                        href={href}
                        onClick={handleNavClick(href)}
                        aria-current={isActive ? "page" : undefined}
                        style={{
                          borderColor: isActive
                            ? navOnLight
                              ? "#BFDBFE"
                              : "rgba(96,165,250,0.28)"
                            : navOnLight
                              ? "rgba(11,31,77,0.08)"
                              : "rgba(255,255,255,0.10)",
                          background: isActive
                            ? navOnLight
                              ? "#EFF6FF"
                              : "rgba(37,99,235,0.18)"
                            : navOnLight
                              ? "rgba(255,255,255,0.7)"
                              : "rgba(255,255,255,0.03)",
                          color: isActive
                            ? navOnLight
                              ? "#0B1F4D"
                              : "#60a5fa"
                            : navOnLight
                              ? "#334155"
                              : "rgba(255,255,255,0.86)",
                          fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : undefined,
                        }}
                      >
                        {label}
                      </a>
                    );
                  })}
                </nav>

                <div className="mt-2 border-t border-white/10 pt-4">
                  <div className="flex flex-col gap-3">
                    <Link
                      className="inline-flex h-[54px] items-center justify-center rounded-[18px] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-5 text-[12px] font-bold uppercase tracking-[1.3px] text-white/90 backdrop-blur-[14px]"
                      onClick={() => setMobileMenuOpen(false)}
                      to="/talent-network#application-start"
                      style={
                        isArabic
                          ? {
                              ...(navOnLight
                                ? {
                                    borderColor: "rgba(11,31,77,0.12)",
                                    background: "linear-gradient(180deg,rgba(255,255,255,0.88),rgba(248,250,252,0.82))",
                                    color: "#0B1F4D",
                                  }
                                : {}),
                              fontFamily: "'Cairo', system-ui, sans-serif",
                              direction: "rtl",
                            }
                          : navOnLight
                            ? {
                                borderColor: "rgba(11,31,77,0.12)",
                                background: "linear-gradient(180deg,rgba(255,255,255,0.88),rgba(248,250,252,0.82))",
                                color: "#0B1F4D",
                              }
                            : undefined
                      }
                    >
                      {heroCopy.mobileMenu.secondaryCta}
                    </Link>
                    <a
                      className="inline-flex h-[54px] items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#4f8cff,#2563eb)] px-5 text-[12px] font-bold uppercase tracking-[1.3px] text-white shadow-[0_6px_18px_rgba(37,99,235,0.22)]"
                      href="#contact"
                      onClick={handleNavClick("#contact")}
                      style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif", direction: "rtl" } : undefined}
                    >
                      {heroCopy.mobileMenu.primaryCta}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-none px-4 md:hidden">
          <div className="w-full max-w-none py-2 text-center">
            <div
              className={[
                "mx-auto text-[34px] font-extrabold leading-[41px] tracking-[-1.1px] text-white",
                isArabic ? "max-w-[352px]" : "max-w-[320px]",
              ].join(" ")}
            >
              {isArabic ? (
                <span
                  style={{
                    ...heroArabicFontStyle,
                    fontSize: "37px",
                    lineHeight: "48px",
                    letterSpacing: "-0.7px",
                    textWrap: "balance",
                  }}
                >
                  <span className="text-white">نماذج تشغيل استراتيجية</span>{" "}
                  <span className="text-[#3b82f6] whitespace-nowrap">تقود نموًا حقيقيًا.</span>
                </span>
              ) : (
                <>
                  Strategic{"\u00A0"}Operating Models <span className="text-[#3b82f6]">{heroCopy.main.highlightedText}</span>
                </>
              )}
            </div>

            <p className="mt-5 text-[16px] leading-[29px] text-[#b8c1d1]" style={heroArabicFontStyle}>
              {heroCopy.main.description}
            </p>

            <div className="mt-6 flex flex-col gap-3 min-[390px]:flex-row min-[390px]:gap-3">
              <a className={mobileHeroPrimaryButtonClass} href="#contact" style={heroArabicFontStyle}>
                {heroCopy.main.primaryCta}
              </a>
              <Link className={mobileHeroSecondaryButtonClass} style={heroArabicFontStyle} to="/talent-network#application-start">
                {heroCopy.main.secondaryCta}
              </Link>
            </div>

            <div className={["mt-8 grid grid-cols-2 gap-3", isArabic ? "text-right" : "text-left"].join(" ")}>
              {metrics.map(({ value, label, icon: Icon }, index) => {
                const metricDisplayValue = isArabic ? getArabicMobileMetricValue(value) : value;
                const metricCount = getMetricCountParts(metricDisplayValue);

                return (
                  <div
                    key={label}
                    className={[
                      mobileHeroMetricCardClass,
                      index === metrics.length - 1 ? "col-span-2 flex items-center gap-4 py-3" : "",
                    ].join(" ")}
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#2563eb]/80 bg-[#112246] text-[#60a5fa]">
                      <Icon size={16} strokeWidth={1.85} />
                    </div>
                    <div
                      className={[index === metrics.length - 1 ? "min-w-0" : "", isArabic ? "text-right" : ""].join(" ")}
                      dir={isArabic ? "rtl" : "ltr"}
                    >
                      <p
                        className={[
                          "whitespace-nowrap text-[26px] font-extrabold leading-[26px] tracking-[-0.5px] text-white",
                          index === metrics.length - 1 ? "" : "mt-3",
                        ].join(" ")}
                        style={isArabic ? { ...heroArabicFontStyle, direction: "rtl", unicodeBidi: "plaintext" } : undefined}
                      >
                        <CountUp
                          className="inline-block"
                          delay={0}
                          duration={1.4}
                          from={metricCount.from}
                          prefix={metricCount.prefix}
                          separator=","
                          suffix={metricCount.suffix}
                          to={metricCount.to}
                        />
                      </p>
                      <p
                        className="mt-[6px] text-[13px] leading-[20px] text-[#c0c8d8]"
                        style={isArabic ? { ...heroArabicFontStyle, direction: "rtl", unicodeBidi: "plaintext" } : undefined}
                      >
                        {label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TEMPORARILY DISABLED - Hero logo ticker will be restored later
            <div className="mt-8 text-left">
              <p className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-[2px] text-[#cbd5e1]" style={heroArabicFontStyle}>
                {heroCopy.trustBanner.text}
              </p>
              <div className="mt-7 overflow-hidden">
                <div className="animate-marquee flex w-max items-center">
                  {[0, 1].map((groupIndex) => (
                    <div key={groupIndex} className="flex shrink-0 items-center gap-10 pr-10">
                      {Array.from({ length: 6 }, (_, index) => (
                        <img
                          key={`${groupIndex}-${index}`}
                          alt="JHC"
                          className="h-[20px] w-auto shrink-0 opacity-80"
                          src={logo}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            */}
          </div>
        </div>

        <div className="relative mx-auto mt-[172px] hidden w-[1301px] md:block">
          <div className="flex items-start justify-between">
            <div className={isArabic ? "w-[634px] text-right" : "w-[634px]"}>
              <div className="inline-flex h-[42px] items-center rounded-[11px] border border-[#2563eb] bg-[rgba(14,29,67,0.7)] px-[16px] backdrop-blur-[18px]">
                <span className="text-[12px] font-semibold uppercase tracking-[3px] text-white" style={heroArabicFontStyle}>
                  {heroCopy.main.eyebrow}
                </span>
              </div>

              <h1
                className="mt-[38px] text-[60px] font-extrabold leading-[72px] tracking-[-1.8px] text-white"
                style={isArabic ? heroArabicFontStyle : undefined}
              >
                {isArabic ? (
                  <>
                    نماذج تشغيل
                    <br />
                    استراتيجية <span className="text-[#3b82f6]">تقود</span>
                    <br />
                    <span className="text-[#3b82f6]">نمواً حقيقياً.</span>
                  </>
                ) : (
                  <>
                    Strategic Operating
                    <br />
                    Models <span className="text-[#3b82f6]">That Drive</span>
                    <br />
                    <span className="text-[#3b82f6]">{heroCopy.main.highlightedText}</span>
                  </>
                )}
              </h1>

              <p
                className="mt-[38px] text-[17px] leading-[32px] text-[#b8c1d1]"
                style={isArabic ? { ...heroArabicFontStyle, maxWidth: "610px" } : { maxWidth: "610px" }}
              >
                {heroCopy.main.description}
              </p>

              <div className="mt-[40px] flex gap-[22px]">
                <a
                  className={[
                    "inline-flex h-[66px] items-center rounded-[22px] bg-[linear-gradient(180deg,#4f8cff,#2563eb)] text-[14px] font-semibold text-white shadow-[0_6px_18px_rgba(37,99,235,0.22)] transition-[box-shadow,transform] duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_34px_rgba(37,99,235,0.42)]",
                    isArabic ? "w-fit justify-center gap-3 px-10" : "min-w-[232px] justify-between pl-[18px] pr-[17px]",
                  ].join(" ")}
                  href="#contact"
                  style={heroArabicFontStyle}
                >
                  {heroCopy.main.primaryCta}
                  <span className="flex size-[33px] items-center justify-center rounded-full border border-white/20 bg-white/10">
                    {isArabic ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                  </span>
                </a>
                <Link
                  className={[
                    "inline-flex h-[66px] items-center rounded-[22px] border border-white/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] text-[14px] font-medium text-white/90 backdrop-blur-[12px]",
                    isArabic ? "w-fit justify-center gap-3 px-10" : "min-w-[220px] justify-between pl-[18px] pr-[17px]",
                  ].join(" ")}
                  style={heroArabicFontStyle}
                  to="/talent-network#application-start"
                >
                  {heroCopy.main.secondaryCta}
                  <span className="flex size-[33px] items-center justify-center rounded-full border border-white/15">
                    {isArabic ? <ArrowLeft size={14} /> : <ArrowRight size={14} className="rotate-[-45deg]" />}
                  </span>
                </Link>
              </div>
            </div>

            <div className="relative mt-[34px] h-[485px] w-[575px]">
              <div className="absolute left-[90px] top-[10px] size-[474px] rounded-full border-[4px] border-[#2563eb]/90">
                <div className="absolute inset-[1px] rounded-full border border-[#60a5fa]/10" />
              </div>
              <div className="absolute left-[327px] top-[247px] will-change-transform">
                {heroOrbitCards.map(({ title, subtitle, icon, width }, index) => (
                  <div
                    key={title}
                    ref={(node) => {
                      orbitCardRefs.current[index] = node;
                    }}
                    className="absolute left-0 top-0 will-change-transform"
                    style={{ width: `${width}px`, transform: "translate3d(0,0,0) translate(-50%, -50%)" }}
                  >
                    {statChip(title, subtitle, icon, "")}
                  </div>
                ))}
              </div>
              <div className="absolute left-1/2 top-1/2 size-[124px] -translate-x-1/2 -translate-y-1/2">
                <div className="absolute inset-[-18px] rounded-full bg-[#2563eb]/8 blur-[22px]" />
                <img
                  alt="JHC logo"
                  className="reveal-image absolute left-1/2 top-1/2 h-auto w-[112px]"
                  src={heroCenterLogo}
                  style={{ animation: "hero-logo-pulse 3.2s ease-in-out infinite", marginLeft: "40px" }}
                />
              </div>
            </div>
          </div>

          <div className="mt-[70px] grid h-[129px] grid-cols-5 items-center rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))] px-8 backdrop-blur-[20px]">
            {metrics.map(({ value, label, icon: Icon }, index) => {
              const metricDisplayValue = isArabic ? getArabicMobileMetricValue(value) : value;
              const metricCount = getMetricCountParts(metricDisplayValue);

              return (
                <div
                  key={label}
                  className={[
                    "flex h-[107px] min-w-0 items-center px-5",
                    index > 0 ? (isArabic ? "border-r border-white/10" : "border-l border-white/10") : "",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "flex size-[40px] shrink-0 items-center justify-center rounded-full border border-[#2563eb]/80 bg-[#112246] text-[#60a5fa]",
                      isArabic ? "ml-[14px]" : "mr-[14px]",
                    ].join(" ")}
                  >
                    <Icon size={16} strokeWidth={1.85} />
                  </div>
                  <div className="min-w-0 max-w-[165px]">
                    <p className="whitespace-nowrap text-[28px] font-extrabold leading-[28px] tracking-[-0.6px] text-white" style={isArabic ? heroArabicFontStyle : undefined}>
                      <CountUp
                        className="inline-block"
                        delay={0}
                        duration={1.4}
                        from={metricCount.from}
                        prefix={metricCount.prefix}
                        separator=","
                        suffix={metricCount.suffix}
                        to={metricCount.to}
                      />
                    </p>
                    <p
                      className={[
                        "mt-[7px] text-[13px] leading-[19px] text-[#c0c8d8]",
                        label === "Strategic Partnerships" || label === "Operational Cost Savings"
                          ? "whitespace-nowrap text-[12px]"
                          : "whitespace-normal",
                      ].join(" ")}
                      style={isArabic ? heroArabicFontStyle : undefined}
                    >
                      {label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TEMPORARILY DISABLED - Hero logo ticker will be restored later
          <div className="mt-[64px] mb-[48px]">
            <div className="flex items-center gap-[18px]">
              <p className="text-[11px] font-semibold uppercase tracking-[4px] text-[#cbd5e1]">
                {heroCopy.trustBanner.text}
              </p>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className="mt-[30px] flex w-[1235px] items-center justify-between">
              {logoStrip()}
            </div>
          </div>
          */}
        </div>
      </section>
      </div>

      <main className="w-full max-w-none min-w-0 overflow-x-hidden bg-[#f8fafc] pb-20">
        <section id="about-us" className="reveal-on-scroll mx-auto mt-20 w-full max-w-none md:h-[334px] md:w-[1280px]">
          <div className="mx-4 rounded-[24px] border border-[#dbe3f0] bg-white flex flex-col gap-9 px-7 py-10 md:hidden">
            <div className={isArabic ? "max-w-none text-right" : "max-w-none text-left"}>
              <p
                className="text-[15px] font-bold uppercase tracking-[1.9px] text-[#2563eb]"
                style={
                  isArabic
                    ? {
                        ...heroArabicFontStyle,
                        letterSpacing: "0",
                        textTransform: "none",
                        fontKerning: "normal",
                        fontFeatureSettings: "normal",
                      }
                    : undefined
                }
              >
                {isArabic ? operatingModelCopy.eyebrow : "Our Approach"}
              </p>
              <h2
                className="mt-4 text-[34px] font-extrabold leading-[42px] tracking-[-1.2px] text-[#0b1f4d]"
                style={isArabic ? heroArabicFontStyle : undefined}
              >
                {isArabic ? (
                  <>
                    إعادة صياغة مفهوم
                    <br />
                    <span className="text-[#2563eb]">القوى</span> <span className="text-[#2563eb]">العاملة</span>
                    <br />
                    لعصر الخليج العربي.
                  </>
                ) : (
                  <>
                    Workforce <span className="text-[#2563eb]">Reimagined</span>
                    <br />
                    for the GCC Era
                  </>
                )}
              </h2>
            </div>

            <div className={isArabic ? "max-w-none text-right" : "max-w-none text-left"}>
              <p className="text-[16px] leading-[28px] text-[#64748b]" style={isArabic ? heroArabicFontStyle : undefined}>
                {isArabic
                  ? operatingModelCopy.description
                  : "We don&apos;t just place talent we redesign how organizations operate. JHC brings 15+ years of on-the-ground GCC expertise to architect human capital frameworks that are resilient, compliant, and built for sustainable growth."}
              </p>
              <p className="mt-5 text-[16px] leading-[28px] text-[#64748b]" style={isArabic ? heroArabicFontStyle : undefined}>
                {isArabic
                  ? operatingModelCopy.secondaryDescription
                  : "From remote workforce infrastructure to full operations management, our flexible models adapt to your industry, scale, and regulatory environment not the other way around."}
              </p>
              <a
                className="mt-6 inline-flex items-center gap-3 text-[16px] font-semibold text-[#2563eb]"
                href="#services"
                style={isArabic ? heroArabicFontStyle : undefined}
              >
                {isArabic ? operatingModelCopy.cta : "Explore Our Services"}
                {isArabic ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
              </a>
            </div>
          </div>

          {isArabic ? (
            <div
              className="hidden h-full rounded-[24px] border border-[#dbe3f0] bg-white md:grid md:grid-cols-2"
              style={{ direction: "ltr" }}
            >
              <div className="flex items-center px-[88px]">
                <div className="max-w-[462px] text-right" dir="rtl">
                  <p
                    className="text-[16px] leading-[26px] text-[#64748b] [word-spacing:0.2px]"
                    style={heroArabicFontStyle}
                  >
                    {operatingModelCopy.description}
                  </p>
                  <p
                    className="mt-[28px] text-[16px] leading-[26px] text-[#64748b] [word-spacing:0.2px]"
                    style={heroArabicFontStyle}
                  >
                    {operatingModelCopy.secondaryDescription}
                  </p>
                  <a
                    className="mt-[30px] inline-flex items-center gap-3 text-[16px] font-semibold text-[#2563eb]"
                    href="#services"
                    style={heroArabicFontStyle}
                  >
                    {operatingModelCopy.cta}
                    <ArrowLeft size={14} />
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-end border-l border-[#e2e8f0] px-[72px]">
                <div className="max-w-[505px] text-right" dir="rtl">
                  <p
                    className="text-[16px] font-bold uppercase tracking-[1.9px] text-[#2563eb]"
                    style={heroArabicFontStyle}
                  >
                    {operatingModelCopy.eyebrow}
                  </p>
                  <h2
                    className="mt-[22px] text-[44px] font-extrabold leading-[52px] tracking-[-1.5px] text-[#0b1f4d]"
                    style={heroArabicFontStyle}
                  >
                    <>
                      إعادة صياغة مفهوم
                      <br />
                      <span className="whitespace-nowrap text-[#2563eb]">القوى العاملة</span>
                      <br />
                      لعصر الخليج العربي.
                    </>
                  </h2>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden h-full rounded-[24px] border border-[#dbe3f0] bg-white md:grid md:grid-cols-2">
              <div className="flex items-center border-r border-[#e2e8f0] px-[72px]">
                <div className="max-w-[505px]">
                  <p className="text-[16px] font-bold uppercase tracking-[1.9px] text-[#2563eb]">
                    Our Approach
                  </p>
                  <h2 className="mt-[22px] text-[44px] font-extrabold leading-[52px] tracking-[-1.5px] text-[#0b1f4d]">
                    <span className="whitespace-nowrap">
                      Workforce <span className="text-[#2563eb]">Reimagined</span>
                    </span>
                    <br />
                    for the GCC Era
                  </h2>
                </div>
              </div>
              <div className="flex items-center px-[88px]">
                <div className="max-w-[462px]">
                  <p className="text-[16px] leading-[26px] text-[#64748b] [word-spacing:0.2px]">
                    We don&apos;t just place talent we redesign how organizations operate. JHC brings
                    15+ years of on-the-ground GCC expertise to architect human capital frameworks
                    that are resilient, compliant, and built for sustainable growth.
                  </p>
                  <p className="mt-[28px] text-[16px] leading-[26px] text-[#64748b] [word-spacing:0.2px]">
                    From remote workforce infrastructure to full operations management, our flexible
                    models adapt to your industry, scale, and regulatory environment not the other
                    way around.
                  </p>
                  <a
                    className="mt-[30px] inline-flex items-center gap-3 text-[16px] font-semibold text-[#2563eb]"
                    href="#services"
                  >
                    Explore Our Services
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </section>

        <CEOMessage />

        <section id="why-jhc" className="reveal-on-scroll mx-auto mt-20 w-full max-w-none md:w-[1280px]">
          <div className="mx-4 rounded-[24px] border border-[#dbe3f0] bg-white md:hidden">
            <div className={["px-6 pb-6 pt-8", isArabic ? "text-right" : ""].join(" ")} dir={isArabic ? "rtl" : "ltr"}>
              <p className="text-[15px] font-bold uppercase tracking-[1.8px] text-[#2563eb]" style={isArabic ? heroArabicFontStyle : undefined}>
                {whyJhcCopy.eyebrow}
              </p>
              <h2 className="mt-4 text-[38px] font-extrabold leading-[40px] tracking-[-1.2px] text-[#0b1f4d]" style={isArabic ? heroArabicFontStyle : undefined}>
                {whyJhcCopy.titleLineOne}
                <br />
                {isArabic ? <span className="text-[#2563eb]">JHC؟</span> : <>{whyJhcCopy.titleLineTwo} <span className="text-[#2563eb]">JHC</span></>}
              </h2>
              <p className="mt-4 text-[15px] leading-[25px] text-[#64748b]" style={isArabic ? heroArabicFontStyle : undefined}>
                {whyJhcCopy.intro}
              </p>
              <a
                className="mt-5 inline-flex items-center gap-2 text-[15px] font-semibold text-[#2563eb]"
                href="#contact"
                style={isArabic ? heroArabicFontStyle : undefined}
              >
                {whyJhcCopy.cta}
                {isArabic ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
              </a>
            </div>

            <div className="border-t border-[#e2e8f0]">
              {featureCards.map(({ title, description, bullets, icon: Icon }, index) => (
                <div
                  key={title}
                  className={[
                    `${cardHoverClassName} px-6 py-6`,
                    index > 0 ? "border-t border-[#e2e8f0]" : "",
                  ].join(" ")}
                >
                  <div
                    className={["flex items-center gap-4", isArabic ? "text-right" : ""].join(" ")}
                    dir={isArabic ? "rtl" : "ltr"}
                  >
                    <div className="flex size-[44px] shrink-0 items-center justify-center rounded-full border border-[#dbeafe] bg-[#eff6ff] text-[#2563eb]">
                      <Icon size={20} strokeWidth={1.8} />
                    </div>
                    <h3 className={isArabic ? "text-right text-[18px] font-bold leading-[22px] text-[#0b1f4d]" : "text-[18px] font-bold leading-[22px] text-[#0b1f4d]"} style={isArabic ? heroArabicFontStyle : undefined}>{title}</h3>
                  </div>
                  <p className={["mt-4 text-[14px] leading-[23px] text-[#64748b]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? heroArabicFontStyle : undefined}>{description}</p>
                  <ul className={["mt-5 space-y-3 text-[14px] leading-5 text-[#0b1f4d]", isArabic ? "text-right" : ""].join(" ")} dir={isArabic ? "rtl" : "ltr"}>
                    {bullets.map((bullet) => (
                      <li key={bullet} className={["flex items-start gap-[10px]", isArabic ? "text-right" : ""].join(" ")}>
                        <CheckCircle2 size={16} className="mt-[2px] shrink-0 text-[#2563eb]" />
                        <span className={isArabic ? "flex-1 text-right" : ""} style={isArabic ? heroArabicFontStyle : undefined}>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden rounded-[24px] border border-[#dbe3f0] bg-white px-14 py-14 md:block">
          <div className="flex justify-between border-b border-[#e2e8f0] pb-[58px]" dir={isArabic ? "rtl" : "ltr"}>
            <div className={["w-[522px]", isArabic ? "text-right" : ""].join(" ")}>
              <p className="text-[16px] font-bold uppercase tracking-[1.8px] text-[#2563eb]" style={isArabic ? heroArabicFontStyle : undefined}>
                {whyJhcCopy.eyebrow}
              </p>
              <h2 className="mt-4 text-[42px] font-extrabold leading-[50px] tracking-[-1.2px] text-[#0b1f4d]" style={isArabic ? heroArabicFontStyle : undefined}>
                <span className="whitespace-nowrap">{whyJhcCopy.titleLineOne}</span>
                <br />
                {isArabic ? <span className="text-[#2563eb]">JHC؟</span> : <>{whyJhcCopy.titleLineTwo} <span className="text-[#2563eb]">JHC</span></>}
              </h2>
            </div>
            <div className={["w-[384px] pt-[6px]", isArabic ? "text-right" : ""].join(" ")}>
              <p className="text-[16px] leading-[26px] text-[#64748b]" style={isArabic ? heroArabicFontStyle : undefined}>
                {whyJhcCopy.intro}
              </p>
              <a
                className="mt-4 inline-flex items-center gap-2 text-[16px] font-semibold text-[#2563eb]"
                href="#contact"
                style={isArabic ? heroArabicFontStyle : undefined}
              >
                {whyJhcCopy.cta}
                {isArabic ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3">
            {featureCards.map(({ title, description, bullets, icon: Icon }, index) => (
              <div
                key={title}
                className={[
                  `${cardHoverClassName} min-h-[396px] px-12 py-12`,
                  index < 2 ? (isArabic ? "border-l border-[#e2e8f0]" : "border-r border-[#e2e8f0]") : "",
                ].join(" ")}
              >
                <div className="flex size-[52px] items-center justify-center rounded-full border border-[#dbeafe] bg-[#eff6ff] text-[#2563eb]">
                  <Icon size={24} strokeWidth={1.8} />
                </div>
                <h3 className={["mt-6 whitespace-nowrap text-[23px] font-bold leading-[23px] text-[#0b1f4d]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? heroArabicFontStyle : undefined}>{title}</h3>
                <p className={["mt-3 text-[14px] leading-[23px] text-[#64748b]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? heroArabicFontStyle : undefined}>{description}</p>
                <ul className={["mt-6 space-y-3 text-[14px] leading-5 text-[#0b1f4d]", isArabic ? "text-right" : ""].join(" ")} dir={isArabic ? "rtl" : "ltr"}>
                  {bullets.map((bullet) => (
                    <li key={bullet} className={["flex items-start gap-[10px]", isArabic ? "text-right" : ""].join(" ")}>
                      <CheckCircle2 size={16} className="mt-[2px] shrink-0 text-[#2563eb]" />
                      <span className={isArabic ? "flex-1 text-right" : ""} style={isArabic ? heroArabicFontStyle : undefined}>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          </div>
        </section>

        <section id="services" className="reveal-on-scroll mx-auto mt-20 w-full max-w-none md:w-[1280px]">
          <div className="mx-4 rounded-[24px] border border-[#dbe3f0] bg-white md:hidden">
            <div className={["px-6 pb-6 pt-8", isArabic ? "text-right" : ""].join(" ")} dir={isArabic ? "rtl" : "ltr"}>
              <p className="text-[15px] font-bold uppercase tracking-[1.8px] text-[#2563eb]" style={isArabic ? heroArabicFontStyle : undefined}>
                {servicesCopy.eyebrow}
              </p>
              <h2 className="mt-4 text-[38px] font-extrabold leading-[40px] tracking-[-1.2px] text-[#0b1f4d]" style={isArabic ? heroArabicFontStyle : undefined}>
                {servicesCopy.title}
              </h2>
              <p className="mt-4 text-[15px] leading-[25px] text-[#64748b]" style={isArabic ? heroArabicFontStyle : undefined}>
                {servicesCopy.intro}
              </p>
            </div>

            <div className="border-t border-[#e2e8f0]">
              {services.map(({ number, title, description, icon: Icon }, index) => (
                <div
                  key={title}
                  className={[
                    `${cardHoverClassName} px-6 py-5`,
                    index > 0 ? "border-t border-[#e2e8f0]" : "",
                  ].join(" ")}
                  dir={isArabic ? "rtl" : "ltr"}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#dbeafe] bg-[#eff6ff] text-[#2563eb]">
                      <Icon size={15} strokeWidth={1.8} />
                    </div>
                    <span className="text-[18px] font-semibold tracking-[-0.2px] text-[#cbd5e1]">{number}</span>
                  </div>
                  <h3 className={["mt-4 text-[16px] font-bold leading-6 text-[#0b1f4d]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? heroArabicFontStyle : undefined}>{title}</h3>
                  <p className={["mt-2 text-[13px] leading-[22px] text-[#64748b]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? heroArabicFontStyle : undefined}>{description}</p>
                  <Link className="mt-3 inline-flex items-center gap-2 text-[13px] font-semibold text-[#2563eb]" style={isArabic ? heroArabicFontStyle : undefined} to={servicePageRoutes[index]}>
                    {servicesCopy.cardCta}
                    {isArabic ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
                  </Link>
                </div>
              ))}

              <div className="border-t border-[#e2e8f0] px-6 py-6" dir={isArabic ? "rtl" : "ltr"}>
                <p className={["text-[13px] leading-[22px] text-[#94a3b8]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? heroArabicFontStyle : undefined}>{servicesCopy.bottomQuestion}</p>
                <a
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-[#dbe3f0] px-5 text-[12px] font-bold uppercase tracking-[1.2px] text-[#0b1f4d]"
                  href="#contact"
                  style={isArabic ? heroArabicFontStyle : undefined}
                >
                  {servicesCopy.bottomButton}
                  {isArabic ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
                </a>
              </div>
            </div>
          </div>

          <div className="hidden rounded-[24px] border border-[#dbe3f0] bg-white px-0 py-0 md:block">
          <div className="flex items-start justify-between px-14 pb-8 pt-14" dir={isArabic ? "rtl" : "ltr"}>
            <div className={isArabic ? "text-right" : ""}>
              <p className="text-[16px] font-bold uppercase tracking-[1.8px] text-[#2563eb]" style={isArabic ? heroArabicFontStyle : undefined}>
                {servicesCopy.eyebrow}
              </p>
              <h2 className="mt-4 text-[48px] font-extrabold leading-[48px] tracking-[-1.2px] text-[#0b1f4d]" style={isArabic ? heroArabicFontStyle : undefined}>
                {servicesCopy.title}
              </h2>
            </div>
            <div className={["w-[384px]", isArabic ? "text-right" : ""].join(" ")}>
              <p className="text-[16px] leading-[26px] text-[#64748b]" style={isArabic ? heroArabicFontStyle : undefined}>
                {servicesCopy.intro}
              </p>
              <a
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-[16px] bg-[#0b1f4d] px-5 text-[12px] font-bold uppercase tracking-[1.2px] text-white transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-[1px] hover:brightness-105 hover:shadow-[0_10px_24px_rgba(11,31,77,0.18)]"
                href="#contact"
                style={isArabic ? heroArabicFontStyle : undefined}
              >
                {servicesCopy.topCta}
                {isArabic ? <ArrowLeft size={12} /> : null}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 border-t border-[#e2e8f0]">
            {services.map(({ number, title, description, icon: Icon }, index) => (
              <div
                key={title}
                className={[
                  `${cardHoverClassName} min-h-[184px] border-[#e2e8f0] px-8 py-7`,
                  index % 3 !== 2 ? (isArabic ? "border-l" : "border-r") : "",
                  index < 3 ? "border-b" : "",
                ].join(" ")}
                dir={isArabic ? "rtl" : "ltr"}
              >
                <div className="flex items-start justify-between">
                  <div className="flex size-8 items-center justify-center rounded-full border border-[#dbeafe] bg-[#eff6ff] text-[#2563eb]">
                    <Icon size={15} strokeWidth={1.8} />
                  </div>
                  <span className="text-[24px] font-semibold text-[#cbd5e1]">{number}</span>
                </div>
                <h3 className={["mt-6 text-[16px] font-bold leading-6 text-[#0b1f4d]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? heroArabicFontStyle : undefined}>{title}</h3>
                <p className={["mt-2 text-[13px] leading-[22px] text-[#64748b]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? heroArabicFontStyle : undefined}>{description}</p>
                <Link className="mt-3 inline-flex items-center gap-2 text-[13px] font-semibold text-[#2563eb]" style={isArabic ? heroArabicFontStyle : undefined} to={servicePageRoutes[index]}>
                  {servicesCopy.cardCta}
                  {isArabic ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
                </Link>
              </div>
            ))}
            <div className={["flex min-h-[184px] flex-col items-center justify-center gap-4 px-8 py-7 text-center", isArabic ? "border-l border-[#e2e8f0]" : ""].join(" ")} dir={isArabic ? "rtl" : "ltr"}>
              <p className="text-[13px] leading-[22px] text-[#94a3b8]" style={isArabic ? heroArabicFontStyle : undefined}>{servicesCopy.bottomQuestion}</p>
              <a
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[#dbe3f0] px-5 text-[12px] font-bold uppercase tracking-[1.2px] text-[#0b1f4d]"
                href="#contact"
                style={isArabic ? heroArabicFontStyle : undefined}
              >
                {servicesCopy.bottomButton}
                {isArabic ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
              </a>
            </div>
          </div>
          </div>
        </section>

        <div className="relative mx-4 mt-20 w-auto overflow-hidden rounded-[16px] border border-[#e2e8f0] bg-white py-6 md:mx-auto md:w-[1280px]">
          {/* Left and Right Gradient Fades */}
          {!isArabic ? <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 hidden w-24 bg-gradient-to-r from-white via-white/94 to-transparent md:block" /> : null}
          {!isArabic ? <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 hidden w-24 bg-gradient-to-l from-white via-white/94 to-transparent md:block" /> : null}

          <div
            className={[
              "inline-flex w-max min-w-max items-center [will-change:transform]",
              !isArabic ? "[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]" : "",
              isArabic ? "animate-marquee-ticker-arabic" : "animate-marquee-ticker",
            ].join(" ")}
            dir="ltr"
          >
            <div
              className={[
                "flex shrink-0 items-center",
                isArabic ? "gap-8 md:gap-10" : "gap-4 pr-4 md:gap-12 md:pr-12",
              ].join(" ")}
              dir={isArabic ? "rtl" : "ltr"}
            >
              {isArabic
                ? arabicMarqueeLoopPhrases.map((phrase, i) => (
                    <span key={i} className="inline-flex items-center gap-4 whitespace-nowrap select-none" style={heroArabicFontStyle}>
                      <span className="text-[14px] text-[#2563eb]/40">●</span>
                      <span className="text-[11px] font-semibold text-[#64748b]">{phrase}</span>
                    </span>
                  ))
                : marqueeItems.map((item, i) => (
                    <span
                      key={i}
                      className={[
                        item === "•" || item === "●"
                          ? "text-[#2563eb]/40 text-[14px]"
                          : "text-[11px] font-semibold uppercase tracking-[1.3px] text-[#64748b]",
                        "whitespace-nowrap select-none",
                      ].join(" ")}
                    >
                      {item}
                    </span>
                  ))}
            </div>
            <div
              aria-hidden="true"
              className={[
                "flex shrink-0 items-center",
                isArabic ? "gap-8 md:gap-10" : "gap-4 pr-4 md:gap-12 md:pr-12",
              ].join(" ")}
              dir={isArabic ? "rtl" : "ltr"}
            >
              {isArabic
                ? arabicMarqueeLoopPhrases.map((phrase, i) => (
                    <span key={`clone-${i}`} className="inline-flex items-center gap-4 whitespace-nowrap select-none" style={heroArabicFontStyle}>
                      <span className="text-[14px] text-[#2563eb]/40">●</span>
                      <span className="text-[11px] font-semibold text-[#64748b]">{phrase}</span>
                    </span>
                  ))
                : marqueeItems.map((item, i) => (
                    <span
                      key={`clone-${i}`}
                      className={[
                        item === "•" || item === "●"
                          ? "text-[#2563eb]/40 text-[14px]"
                          : "text-[11px] font-semibold uppercase tracking-[1.3px] text-[#64748b]",
                        "whitespace-nowrap select-none",
                      ].join(" ")}
                    >
                      {item}
                    </span>
                  ))}
            </div>
          </div>
        </div>

        <section id="how-we-work" className="reveal-on-scroll mx-auto mt-20 w-full max-w-none md:w-[1280px]">
          <div className="mx-4 rounded-[24px] border border-[#dbe3f0] bg-white md:hidden">
            <div className={["px-6 pb-6 pt-8", isArabic ? "text-right" : ""].join(" ")} dir={isArabic ? "rtl" : "ltr"}>
              <p className="text-[15px] font-bold uppercase tracking-[1.8px] text-[#2563eb]" style={isArabic ? heroArabicFontStyle : undefined}>
                {processCopy.eyebrow}
              </p>
              <h2 className="mt-4 text-[38px] font-extrabold leading-[40px] tracking-[-1.2px] text-[#0b1f4d]" style={isArabic ? heroArabicFontStyle : undefined}>
                {processCopy.title}
              </h2>
              <p className="mt-4 text-[15px] leading-[25px] text-[#64748b]" style={isArabic ? heroArabicFontStyle : undefined}>
                {processCopy.intro}
              </p>
            </div>

            <div className="overflow-hidden rounded-b-[24px] border-t border-[#e2e8f0]">
              {processSteps.map(({ number, title, description, tags, icon: Icon }, index) => (
                <div
                  key={title}
                  className={[
                    `${cardHoverClassName} px-6 py-6`,
                    index > 0 ? "border-t border-[#e2e8f0]" : "",
                  ].join(" ")}
                  dir={isArabic ? "rtl" : "ltr"}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-8 items-center justify-center rounded-full border border-[#dbeafe] bg-[#eff6ff] text-[#2563eb]">
                      <Icon size={15} strokeWidth={1.8} />
                    </div>
                    <span className="text-[24px] font-semibold text-[#cbd5e1]">{number}</span>
                  </div>
                  <h3 className={["mt-5 text-[15px] font-bold leading-5 text-[#0b1f4d]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? heroArabicFontStyle : undefined}>{title}</h3>
                  <p className={["mt-3 text-[12px] leading-[20px] text-[#64748b]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? heroArabicFontStyle : undefined}>{description}</p>
                  <div className={["mt-5 flex flex-wrap gap-2", isArabic ? "justify-end flex-row-reverse" : ""].join(" ")}>
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] px-[8px] py-[5px] text-[9px] font-semibold uppercase tracking-[0.8px] text-[#94a3b8]"
                        style={isArabic ? heroArabicFontStyle : undefined}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden rounded-[24px] border border-[#dbe3f0] bg-white px-14 py-14 md:block">
            <div className="flex justify-between pb-8" dir={isArabic ? "rtl" : "ltr"}>
              <div className={isArabic ? "text-right" : ""}>
                <p className="text-[16px] font-bold uppercase tracking-[1.8px] text-[#2563eb]" style={isArabic ? heroArabicFontStyle : undefined}>
                  {processCopy.eyebrow}
                </p>
                <h2 className="mt-4 text-[48px] font-extrabold leading-[48px] tracking-[-1.2px] text-[#0b1f4d]" style={isArabic ? heroArabicFontStyle : undefined}>
                  {processCopy.title}
                </h2>
              </div>
              <p className={["w-[384px] pt-[12px] text-[16px] leading-[26px] text-[#64748b]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? heroArabicFontStyle : undefined}>
                {processCopy.intro}
              </p>
            </div>

            <div className="grid grid-cols-5 overflow-hidden rounded-[16px] border border-[#e2e8f0]">
              {processSteps.map(({ number, title, description, tags, icon: Icon }, index) => (
                <div
                key={title}
                className={[
                  `${cardHoverClassName} min-h-[264px] px-6 py-6`,
                  index < processSteps.length - 1 ? (isArabic ? "border-l border-[#e2e8f0]" : "border-r border-[#e2e8f0]") : "",
                ].join(" ")}
                dir={isArabic ? "rtl" : "ltr"}
              >
                <div className="flex items-center justify-between">
                  <div className="flex size-8 items-center justify-center rounded-full border border-[#dbeafe] bg-[#eff6ff] text-[#2563eb]">
                    <Icon size={15} strokeWidth={1.8} />
                  </div>
                  <span className="text-[24px] font-semibold text-[#cbd5e1]">{number}</span>
                </div>
                  <h3 className={["mt-5 text-[15px] font-bold leading-5 text-[#0b1f4d]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? heroArabicFontStyle : undefined}>{title}</h3>
                  <p className={["mt-3 text-[12px] leading-[20px] text-[#64748b]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? heroArabicFontStyle : undefined}>{description}</p>
                  <div className={["mt-5 flex flex-wrap gap-2", isArabic ? "justify-end flex-row-reverse" : ""].join(" ")}>
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] px-[10px] py-[6px] text-[10px] font-semibold uppercase tracking-[1px] text-[#64748b]"
                        style={isArabic ? heroArabicFontStyle : undefined}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/*
        <section className="mx-auto mt-20 w-full max-w-none md:w-[1280px]">
          <div className="mx-4 rounded-[24px] bg-[#071633] px-6 py-8 text-white md:hidden">
            <div>
              <p className="text-[14px] font-bold uppercase tracking-[1.8px] text-[#60a5fa]">
                Client Stories
              </p>
              <h2 className="mt-4 text-[38px] font-extrabold leading-[40px] tracking-[-1.2px]">
                What Our Clients Say
              </h2>
            </div>
            <p className="mt-4 text-[14px] leading-[23px] text-[#94a3b8]">
              Real results. Real partnerships. Organizations across the GCC that trusted JHC to
              transform their workforce.
            </p>

            <div
              ref={testimonialsCarouselRef}
              className="mt-8 -mx-6 overflow-x-auto overflow-y-hidden px-6 pb-1 touch-pan-y scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex w-max gap-4 pr-6">
                {testimonials.map(({ quote, author, role, tag }, index) => (
                  <div
                    key={author}
                    ref={(node) => {
                      testimonialCardRefs.current[index] = node;
                    }}
                    className="w-[min(78vw,296px)] shrink-0 rounded-[16px] border border-white/10 px-6 py-7"
                  >
                    <p className="text-[13px] tracking-[2px] text-[#60a5fa]">★★★★★</p>
                    <p className="mt-6 text-[15px] leading-[26px] text-[#dbeafe]">"{quote}"</p>
                    <div className="mt-10 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-[12px] font-bold text-[#0b1f4d]">
                          {author
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-white">{author}</p>
                          <p className="truncate text-[12px] text-[#94a3b8]">{role}</p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[1px] text-[#94a3b8]">
                        {tag}
                      </span>
                    </div>
                  </div>
                ))}
                <div aria-hidden="true" className="w-6 shrink-0" />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2">
              {testimonials.map((testimonial, index) => (
                <span
                  key={testimonial.author}
                  className={[
                    "block rounded-full bg-white/20",
                    index === activeTestimonialIndex ? "h-[6px] w-6 bg-white/45" : "size-[6px]",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>

          <div className="hidden rounded-[24px] bg-[#071633] px-14 py-12 text-white md:block">
            <div className="flex justify-between">
              <div>
                <p className="text-[14px] font-bold uppercase tracking-[1.8px] text-[#60a5fa]">Client Stories</p>
                <h2 className="mt-4 text-[44px] font-extrabold leading-[45px] tracking-[-1.2px]">
                  What Our Clients Say
                </h2>
              </div>
              <p className="w-[321px] text-[14px] leading-[23px] text-[#94a3b8]">
                Real results. Real partnerships. Organizations across the GCC that trusted JHC to
                transform their workforce.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-3 overflow-hidden rounded-[16px] border border-white/10">
              {testimonials.map(({ quote, author, role, tag }, index) => (
                <div
                  key={author}
                  className={[
                    "min-h-[244px] px-8 py-8",
                    index < testimonials.length - 1 ? "border-r border-white/10" : "",
                  ].join(" ")}
                >
                  <p className="text-[13px] tracking-[2px] text-[#60a5fa]">★★★★★</p>
                  <p className="mt-6 text-[16px] leading-[28px] text-[#dbeafe]">"{quote}"</p>
                  <div className="mt-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-[#dbeafe] text-[#0b1f4d] text-[12px] font-bold">
                        {author
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-white">{author}</p>
                        <p className="text-[12px] text-[#94a3b8]">{role}</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[1px] text-[#94a3b8]">
                      {tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        */}

        <section id="contact" className="reveal-on-scroll mx-auto mt-20 w-full max-w-none md:w-[1280px]">
          <div className="mx-4 rounded-[24px] border border-[#dbe3f0] bg-white px-6 py-8 md:hidden">
            <div className={isArabic ? "text-right" : "text-left"} dir={isArabic ? "rtl" : "ltr"}>
              <p className="text-[14px] font-bold uppercase tracking-[1.8px] text-[#60a5fa]" style={arabicContactFontStyle}>
                {CONTACT_SECTION_COPY.eyebrow}
              </p>
              <h2 className="mt-4 text-[38px] font-extrabold leading-[40px] tracking-[-1.2px] text-[#0b1f4d]" style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>
                {CONTACT_SECTION_COPY.title}
              </h2>
              <p className="mt-4 text-[14px] leading-[23px] text-[#64748b]" style={arabicContactFontStyle}>
                {CONTACT_SECTION_COPY.description}
              </p>
            </div>

            <div className="mt-8">
              <div className="space-y-4">
                {CONTACT_FORM_FIELDS.map(({ label, placeholder, required }, index) => {
                  const fieldKey = contactFieldKeys[index];
                  return (
                  <label key={label} className="flex flex-col gap-2">
                    <span className={["text-[10px] font-bold uppercase tracking-[1.1px] text-[#94a3b8]", isArabic ? "text-right" : ""].join(" ")} style={arabicContactFontStyle}>{label}{required ? " *" : ""}</span>
                    <input
                      value={contactForm[fieldKey]}
                      onChange={(event) => updateContactField(fieldKey, event.target.value)}
                      className={["h-12 rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] px-4 text-[14px] text-[#0b1f4d] outline-none placeholder:text-[#94a3b8]", isArabic ? "text-right" : ""].join(" ")}
                      dir={isArabic ? "rtl" : "ltr"}
                      placeholder={placeholder}
                      style={arabicContactFontStyle}
                    />
                  </label>
                )})}

                <label className="relative flex flex-col gap-2">
                  <span className={["text-[10px] font-bold uppercase tracking-[1.1px] text-[#94a3b8]", isArabic ? "text-right" : ""].join(" ")} style={arabicContactFontStyle}>{CONTACT_SECTION_COPY.serviceLabel}</span>
                  <button
                    ref={mobileServiceTriggerRef}
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={[`${subtleButtonHoverClassName} flex h-12 cursor-pointer select-none items-center justify-between rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] px-4 text-[14px] outline-none`, isArabic ? "text-right" : ""].join(" ")}
                    dir={isArabic ? "rtl" : "ltr"}
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="listbox"
                    aria-controls="landing-service-listbox-mobile"
                    aria-label={CONTACT_SECTION_COPY.serviceLabel}
                    style={{
                      color: selectedService === "" ? "#94a3b8" : "#0b1f4d",
                      ...arabicContactFontStyle,
                    }}
                  >
                    <span>{selectedService || CONTACT_SECTION_COPY.servicePlaceholder}</span>
                    <span aria-hidden="true" className="transition-transform duration-200" style={{ transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                      <svg className="size-5 text-[#64748b]" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4" />
                      </svg>
                    </span>
                  </button>

                  {isDropdownOpen && (
                    <>
                      <div aria-hidden="true" className="fixed inset-0 z-20" onClick={() => setIsDropdownOpen(false)} />

                      <div id="landing-service-listbox-mobile" role="listbox" className="absolute left-0 right-0 top-[102%] z-30 overflow-hidden rounded-[12px] border border-[#e2e8f0] bg-white py-1 shadow-lg">
                        {CONTACT_SERVICE_OPTIONS.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setSelectedService(option);
                              setIsDropdownOpen(false);
                              mobileServiceTriggerRef.current?.focus();
                              if (option !== CONTACT_SECTION_COPY.otherServiceOption) {
                                setCustomService("");
                              }
                            }}
                            className={["flex cursor-pointer items-center justify-between px-4 py-2.5 text-[14px] text-[#0b1f4d] transition-colors duration-150 hover:bg-[#f8fafc] hover:text-[#2563eb]", isArabic ? "text-right" : ""].join(" ")}
                            dir={isArabic ? "rtl" : "ltr"}
                            role="option"
                            aria-selected={selectedService === option}
                            style={arabicContactFontStyle}
                          >
                            <span>{option}</span>
                            {selectedService === option && (
                              <svg aria-hidden="true" className="size-4 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </label>
              </div>

              <div
                  className={`mt-4 flex flex-col gap-2 transition-all duration-300 ease-in-out origin-top ${
                  selectedService === CONTACT_SECTION_COPY.otherServiceOption
                    ? "opacity-100 max-h-40 translate-y-0 scale-100"
                    : "pointer-events-none max-h-0 -translate-y-2 scale-95 overflow-hidden opacity-0"
                }`}
              >
                <span className={["text-[10px] font-bold uppercase tracking-[1.1px] text-[#94a3b8]", isArabic ? "text-right" : ""].join(" ")} style={arabicContactFontStyle}>{CONTACT_SECTION_COPY.customServiceLabel}</span>
                <input
                  type="text"
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                  className={["h-12 w-full rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] px-4 text-[14px] text-[#0b1f4d] outline-none placeholder:text-[#94a3b8]", isArabic ? "text-right" : ""].join(" ")}
                  dir={isArabic ? "rtl" : "ltr"}
                  placeholder={CONTACT_SECTION_COPY.customServicePlaceholder}
                  style={arabicContactFontStyle}
                />
              </div>

              <label className="mt-4 flex flex-col gap-2">
                <span className={["text-[10px] font-bold uppercase tracking-[1.1px] text-[#94a3b8]", isArabic ? "text-right" : ""].join(" ")} style={arabicContactFontStyle}>{CONTACT_SECTION_COPY.messageLabel} *</span>
                <textarea
                  value={contactMessage}
                  onChange={(event) => setContactMessage(event.target.value)}
                  className={["h-[118px] rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[14px] text-[#0b1f4d] outline-none placeholder:text-[#94a3b8]", isArabic ? "text-right" : ""].join(" ")}
                  dir={isArabic ? "rtl" : "ltr"}
                  placeholder={CONTACT_SECTION_COPY.messagePlaceholder}
                  style={arabicContactFontStyle}
                />
              </label>

              <div className="mt-5">
                <p className={["text-[11px] text-[#94a3b8]", isArabic ? "text-right" : ""].join(" ")} style={arabicContactFontStyle}>{CONTACT_SECTION_COPY.responseNote}</p>
                {contactSubmitMessage ? (
                  <p
                    className={["mt-3 text-[11px]", isArabic ? "text-right" : ""].join(" ")}
                    style={{ color: contactSubmitState === "error" ? "#DC2626" : "#16A34A", ...arabicContactFontStyle }}
                  >
                    {contactSubmitMessage}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => void handleContactSubmit()}
                  disabled={contactSubmitting}
                  className="mt-4 h-10 w-full rounded-[16px] bg-[#0b1f4d] px-6 text-[12px] font-bold uppercase tracking-[1.2px] text-white transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-[1px] hover:brightness-105 hover:shadow-[0_10px_24px_rgba(11,31,77,0.18)]"
                  style={{ ...(isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : {}), opacity: contactSubmitting ? 0.75 : 1, cursor: contactSubmitting ? "not-allowed" : "pointer" }}
                >
                  {contactSubmitting ? (isArabic ? "جارٍ الإرسال..." : "Sending...") : CONTACT_SECTION_COPY.submitLabel}
                </button>
              </div>
            </div>

            <div className="mt-6">
              <div className="rounded-[18px] border border-[#e2e8f0] bg-[#f8fafc] p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5" dir={isArabic ? "rtl" : "ltr"}>
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#0b1f4d] text-white">
                        <MapPin size={14} />
                      </div>
                      <p className={isArabic ? "text-right text-[14px] font-semibold text-[#0b1f4d]" : "text-[14px] font-semibold text-[#0b1f4d]"} style={arabicContactFontStyle}>{OFFICE_LOCATIONS[0].city}</p>
                    </div>
                    <div className={["mt-3 space-y-2 text-[11px] leading-[14px] text-[#64748b]", isArabic ? "text-right" : ""].join(" ")}>
                      <p className="flex items-center gap-1.5 whitespace-nowrap" dir={isArabic ? "rtl" : "ltr"} style={arabicContactFontStyle}>
                        <Phone size={11} />
                        {OFFICE_LOCATIONS[0].phone}
                      </p>
                      <p className={["flex items-start gap-1.5 text-[10px] leading-[13px] [overflow-wrap:anywhere]", isArabic ? "text-right" : ""].join(" ")} dir={isArabic ? "rtl" : "ltr"} style={arabicContactFontStyle}>
                        <Mail size={11} className="mt-px shrink-0" />
                        <span>{OFFICE_LOCATIONS[0].email}</span>
                      </p>
                    </div>
                  </div>

                  <div className="min-w-0 border-l border-[#e2e8f0] pl-4">
                    <div className="flex items-center gap-2.5" dir={isArabic ? "rtl" : "ltr"}>
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#0b1f4d] text-white">
                        <MapPin size={14} />
                      </div>
                      <p className={isArabic ? "text-right text-[14px] font-semibold text-[#0b1f4d]" : "text-[14px] font-semibold text-[#0b1f4d]"} style={arabicContactFontStyle}>{OFFICE_LOCATIONS[1].city}</p>
                    </div>
                    <div className={["mt-3 space-y-2 text-[11px] leading-[14px] text-[#64748b]", isArabic ? "text-right" : ""].join(" ")} style={arabicContactFontStyle}>
                      <p className="flex items-center gap-1.5 whitespace-nowrap" dir={isArabic ? "rtl" : "ltr"} style={arabicContactFontStyle}>
                        <Phone size={11} />
                        {OFFICE_LOCATIONS[1].phone}
                      </p>
                      <p className={["flex items-start gap-1.5 text-[10px] leading-[13px] [overflow-wrap:anywhere]", isArabic ? "text-right" : ""].join(" ")} dir={isArabic ? "rtl" : "ltr"} style={arabicContactFontStyle}>
                        <Mail size={11} className="mt-px shrink-0" />
                        <span>{OFFICE_LOCATIONS[1].email}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden rounded-[24px] border border-[#dbe3f0] bg-white px-14 py-12 md:block">
            <div className="flex justify-between" dir={isArabic ? "rtl" : "ltr"}>
              <div className={isArabic ? "text-right" : ""}>
                <p className="text-[14px] font-bold uppercase tracking-[1.8px] text-[#60a5fa]" style={arabicContactFontStyle}>{CONTACT_SECTION_COPY.eyebrow}</p>
                <h2 className="mt-4 text-[44px] font-extrabold leading-[45px] tracking-[-1.2px] text-[#0b1f4d]" style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>
                  {CONTACT_SECTION_COPY.title}
                </h2>
              </div>
              <p className={["w-[321px] pt-[8px] text-[14px] leading-[23px] text-[#64748b]", isArabic ? "text-right" : ""].join(" ")} style={arabicContactFontStyle}>
                {CONTACT_SECTION_COPY.description}
              </p>
            </div>

            <div className="mt-10 grid grid-cols-[1fr_316px] gap-10">
              <div>
                <div className="grid grid-cols-2 gap-4">
                  {CONTACT_FORM_FIELDS.map(({ label, placeholder, required }, index) => {
                    const fieldKey = contactFieldKeys[index];
                    return (
	                  <label key={label} className="flex flex-col gap-2">
	                    <span className={["text-[10px] font-bold uppercase tracking-[1.1px] text-[#94a3b8]", isArabic ? "text-right" : ""].join(" ")} style={arabicContactFontStyle}>{label}{required ? " *" : ""}</span>
	                    <input
                        value={contactForm[fieldKey]}
                        onChange={(event) => updateContactField(fieldKey, event.target.value)}
	                      className={["h-12 rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] px-4 text-[14px] text-[#0b1f4d] outline-none placeholder:text-[#94a3b8]", isArabic ? "text-right" : ""].join(" ")}
                        dir={isArabic ? "rtl" : "ltr"}
	                      placeholder={placeholder}
                        style={arabicContactFontStyle}
	                    />
	                  </label>
                  )})}

                  <label className="col-span-2 relative flex flex-col gap-2">
	                    <span className={["text-[10px] font-bold uppercase tracking-[1.1px] text-[#94a3b8]", isArabic ? "text-right" : ""].join(" ")} style={arabicContactFontStyle}>{CONTACT_SECTION_COPY.serviceLabel}</span>

                    <button
                      ref={desktopServiceTriggerRef}
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={[`${subtleButtonHoverClassName} flex h-12 cursor-pointer select-none items-center justify-between rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] px-4 text-[14px] outline-none`, isArabic ? "text-right" : ""].join(" ")}
                      dir={isArabic ? "rtl" : "ltr"}
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="listbox"
                      aria-controls="landing-service-listbox-desktop"
                      aria-label={CONTACT_SECTION_COPY.serviceLabel}
                      style={{
                        color: selectedService === "" ? "#94a3b8" : "#0b1f4d",
                        ...arabicContactFontStyle,
                      }}
                    >
	                      <span>{selectedService || CONTACT_SECTION_COPY.servicePlaceholder}</span>
                      <span aria-hidden="true" className="transition-transform duration-200" style={{ transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                        <svg className="size-5 text-[#64748b]" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4" />
                        </svg>
                      </span>
                    </button>

                    {isDropdownOpen && (
                      <>
                        <div aria-hidden="true" className="fixed inset-0 z-20" onClick={() => setIsDropdownOpen(false)} />

                        <div id="landing-service-listbox-desktop" role="listbox" className="absolute left-0 right-0 top-[102%] z-30 overflow-hidden rounded-[12px] border border-[#e2e8f0] bg-white py-1 shadow-lg">
                          {CONTACT_SERVICE_OPTIONS.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setSelectedService(option);
                                setIsDropdownOpen(false);
                                desktopServiceTriggerRef.current?.focus();
                                if (option !== CONTACT_SECTION_COPY.otherServiceOption) {
                                  setCustomService("");
                                }
                              }}
                              className={["flex cursor-pointer items-center justify-between px-4 py-2.5 text-[14px] text-[#0b1f4d] transition-colors duration-150 hover:bg-[#f8fafc] hover:text-[#2563eb]", isArabic ? "text-right" : ""].join(" ")}
                              dir={isArabic ? "rtl" : "ltr"}
                              role="option"
                              aria-selected={selectedService === option}
                              style={arabicContactFontStyle}
                            >
                              <span>{option}</span>
                              {selectedService === option && (
                                <svg aria-hidden="true" className="size-4 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </label>
                </div>

                <div
                  className={`col-span-2 mt-4 flex flex-col gap-2 transition-all duration-300 ease-in-out origin-top ${
                    selectedService === CONTACT_SECTION_COPY.otherServiceOption
                      ? "opacity-100 max-h-40 transform translate-y-0 scale-100"
                      : "opacity-0 max-h-0 pointer-events-none transform -translate-y-2 scale-95 overflow-hidden"
                  }`}
                >
	                  <span className={["text-[10px] font-bold uppercase tracking-[1.1px] text-[#94a3b8]", isArabic ? "text-right" : ""].join(" ")} style={arabicContactFontStyle}>{CONTACT_SECTION_COPY.customServiceLabel}</span>
                  <input
                    type="text"
                    value={customService}
                    onChange={(e) => setCustomService(e.target.value)}
                    className={["h-12 w-full rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] px-4 text-[14px] text-[#0b1f4d] outline-none placeholder:text-[#94a3b8]", isArabic ? "text-right" : ""].join(" ")}
                    dir={isArabic ? "rtl" : "ltr"}
	                    placeholder={CONTACT_SECTION_COPY.customServicePlaceholder}
                    style={arabicContactFontStyle}
                  />
                </div>

                <label className="mt-4 flex flex-col gap-2">
	                  <span className={["text-[10px] font-bold uppercase tracking-[1.1px] text-[#94a3b8]", isArabic ? "text-right" : ""].join(" ")} style={arabicContactFontStyle}>{CONTACT_SECTION_COPY.messageLabel} *</span>
                  <textarea
                    value={contactMessage}
                    onChange={(event) => setContactMessage(event.target.value)}
                    className={["h-[118px] rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[14px] text-[#0b1f4d] outline-none placeholder:text-[#94a3b8]", isArabic ? "text-right" : ""].join(" ")}
                    dir={isArabic ? "rtl" : "ltr"}
	                    placeholder={CONTACT_SECTION_COPY.messagePlaceholder}
                    style={arabicContactFontStyle}
                  />
                </label>

                <div className="mt-5 flex items-center justify-between">
	                  <p className={["text-[11px] text-[#94a3b8]", isArabic ? "text-right" : ""].join(" ")} style={arabicContactFontStyle}>{CONTACT_SECTION_COPY.responseNote}</p>
                  <div className="flex items-center gap-4">
                    {contactSubmitMessage ? (
                      <p
                        className={["text-[11px]", isArabic ? "text-right" : ""].join(" ")}
                        style={{ color: contactSubmitState === "error" ? "#DC2626" : "#16A34A", ...arabicContactFontStyle }}
                      >
                        {contactSubmitMessage}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void handleContactSubmit()}
                      disabled={contactSubmitting}
                      className="h-10 rounded-[16px] bg-[#0b1f4d] px-6 text-[12px] font-bold uppercase tracking-[1.2px] text-white transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-[1px] hover:brightness-105 hover:shadow-[0_10px_24px_rgba(11,31,77,0.18)]"
                      style={{ ...(isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : {}), opacity: contactSubmitting ? 0.75 : 1, cursor: contactSubmitting ? "not-allowed" : "pointer" }}
                    >
	                    {contactSubmitting ? (isArabic ? "جارٍ الإرسال..." : "Sending...") : CONTACT_SECTION_COPY.submitLabel}
                    </button>
                  </div>
                </div>
              </div>

                <div className="space-y-4">
                  {OFFICE_LOCATIONS.map((office) => (
                  <div key={office.city} className={`${cardHoverClassName} rounded-[18px] border border-[#e2e8f0] bg-[#f8fafc] p-5`}>
                    <div className="flex items-start gap-3" dir={isArabic ? "rtl" : "ltr"}>
                      <div className="flex size-9 items-center justify-center rounded-full bg-[#0b1f4d] text-white">
                        <MapPin size={16} />
                      </div>
                      <div className={isArabic ? "text-right" : ""}>
                        <p className="text-[14px] font-semibold text-[#0b1f4d]" style={arabicContactFontStyle}>{office.city}</p>
                        <div className={["mt-3 space-y-2 text-[13px] text-[#64748b]", isArabic ? "text-right" : ""].join(" ")} style={arabicContactFontStyle}>
                          <p className="flex items-center gap-2" dir={isArabic ? "rtl" : "ltr"} style={arabicContactFontStyle}>
                            <Phone size={12} />
                          {office.phone}
                          </p>
                          <p className="flex items-center gap-2" dir={isArabic ? "rtl" : "ltr"} style={arabicContactFontStyle}>
                            <Mail size={12} />
                          {office.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  ))}

	                <div className={["rounded-[18px] border border-[#dbeafe] bg-[#eff6ff] p-5", isArabic ? "text-right" : ""].join(" ")} dir={isArabic ? "rtl" : "ltr"}>
	                  <p className="text-[12px] font-bold uppercase tracking-[1.2px] text-[#2563eb]" style={arabicContactFontStyle}>{CONTACT_SECTION_COPY.responseCardTitle}</p>
                  <p className="mt-3 text-[28px] font-extrabold text-[#0b1f4d]" style={arabicContactFontStyle}>{CONTACT_SECTION_COPY.responseCardValue}</p>
                  <p className="mt-2 text-[13px] leading-[22px] text-[#64748b]" style={arabicContactFontStyle}>
                    {CONTACT_SECTION_COPY.responseCardDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="reveal-on-scroll mx-auto mt-20 w-full max-w-none md:w-[1280px]">
          <div className="mx-4 rounded-[24px] bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.16),transparent_32%),linear-gradient(90deg,#091630_0%,#0d1c40_55%,#1d4ed8_100%)] px-6 py-12 text-center text-white md:hidden">
            <h2 className="text-[34px] font-extrabold leading-[40px] tracking-[-1px]" style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>
              {FINAL_CTA_COPY.title}
            </h2>
            <p className="mx-auto mt-5 max-w-[320px] text-[16px] leading-[28px] text-[#cbd5e1]" style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>
              {FINAL_CTA_COPY.description}
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <a
                className="inline-flex h-11 w-full items-center justify-center rounded-[16px] bg-[#2563eb] px-6 text-[12px] font-bold uppercase tracking-[1.2px] text-white transition-all duration-200"
                href="#contact"
                style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}
              >
                {FINAL_CTA_COPY.primaryCta}
              </a>
              <a
                className="inline-flex h-11 w-full items-center justify-center rounded-[16px] border border-white/12 bg-white/[0.04] px-6 text-[12px] font-bold uppercase tracking-[1.2px] text-white transition-all duration-200"
                href="#services"
                style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}
              >
                {FINAL_CTA_COPY.secondaryCta}
              </a>
            </div>
          </div>

          <div className="hidden rounded-[24px] bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.16),transparent_32%),linear-gradient(90deg,#091630_0%,#0d1c40_55%,#1d4ed8_100%)] px-14 py-20 text-center text-white md:block">
            <h2 className="text-[42px] font-extrabold leading-[48px] tracking-[-1px]" style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>
              {FINAL_CTA_COPY.title}
            </h2>
            <p className="mx-auto mt-6 max-w-[760px] text-[18px] leading-[30px] text-[#cbd5e1]" style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>
              {FINAL_CTA_COPY.description}
            </p>
            <div className="mt-12 flex justify-center gap-4">
              <a
                className="inline-flex h-11 items-center rounded-[16px] bg-[#2563eb] px-6 text-[12px] font-bold uppercase tracking-[1.2px] text-white transition-all duration-200 hover:shadow-[0_12px_30px_rgba(37,99,235,0.35)] hover:-translate-y-[2px]"
                href="#contact"
                style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}
              >
                {FINAL_CTA_COPY.primaryCta}
              </a>
              <a
                className="inline-flex h-11 items-center rounded-[16px] border border-white/12 bg-white/[0.04] px-6 text-[12px] font-bold uppercase tracking-[1.2px] text-white transition-all duration-200 hover:bg-white/[0.1] hover:-translate-y-[2px]"
                href="#services"
                style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}
              >
                {FINAL_CTA_COPY.secondaryCta}
              </a>
            </div>
          </div>
        </section>
      </main>

      <div className="relative mt-12">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 top-[28%] rounded-t-[24px] bg-[#071633] md:rounded-t-[50px]"
      />
      <footer
        className="relative w-full rounded-t-[24px] bg-[#071633] pt-11 text-white md:rounded-t-[50px]"
      >
        <div className="mx-auto w-full max-w-none px-4 md:w-[1280px]" dir={isArabic ? "rtl" : "ltr"}>
          <div className="md:hidden">
            <div className="border-b border-white/10 pb-8">
              <div className="flex items-center justify-between gap-4">
                <img alt="JHC" className="h-[36px] w-auto" src={logo} />
                <div className="flex gap-2" dir="ltr">
                  {socialButton(Linkedin, {
                    className: "size-9",
                    iconClassName: "text-[#94a3b8]",
                    iconSize: 13,
                    strokeWidth: 1.6,
                    fill: true,
                    href: SOCIAL_LINKS.linkedin,
                  })}
                  {socialButton(Facebook, {
                    className: "size-9",
                    iconClassName: "text-[#94a3b8]",
                    iconSize: 13,
                    strokeWidth: 1.6,
                    fill: true,
                    href: SOCIAL_LINKS.facebook,
                  })}
                </div>
              </div>
              <p className={["mt-4 max-w-none pr-1 text-[13px] leading-[22px] text-[#64748b]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>
                {FOOTER_COPY.description}
              </p>
            </div>

            <div className="py-8">
              {[
                {
                  key: "company" as const,
                  title: FOOTER_SECTION_TITLES.company,
                  content: (
                    <div className={["space-y-[14px] text-[14px] text-[#64748b]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>
                      {FOOTER_COMPANY_LINKS.map(({ label, href }) => (
                        <a key={label} className="block" href={href}>{label}</a>
                      ))}
                    </div>
                  ),
                },
                {
                  key: "services" as const,
                  title: FOOTER_SECTION_TITLES.services,
                  content: (
                    <div className={["space-y-[14px] text-[14px] text-[#64748b]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>
                      {FOOTER_SERVICE_LINKS.map(({ label, href }) => (
                        <a key={label} className="block" href={href}>{label}</a>
                      ))}
                    </div>
                  ),
                },
                {
                  key: "locations" as const,
                  title: FOOTER_SECTION_TITLES.locations,
                  content: (
                    <div className="space-y-7 text-[14px]">
                      {OFFICE_LOCATIONS.map((office) => (
                      <div key={office.city}>
                        <p
                          className={["flex items-center gap-2 font-semibold text-[#e2e8f0]", isArabic ? "justify-end text-right" : ""].join(" ")}
                          dir={isArabic ? "ltr" : "ltr"}
                          style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}
                        >
                          <span dir={isArabic ? "rtl" : "ltr"} className="whitespace-nowrap">
                            {office.city}, <span className="font-normal text-[#64748b]">{office.country}</span>
                          </span>
                          <MapPin size={13} className="shrink-0 text-[#60a5fa]" />
                        </p>
                        <p
                          className={["mt-2 flex items-center gap-2 pl-[21px] text-[12px] text-[#64748b]", isArabic ? "justify-end text-right pl-0 pr-[21px]" : ""].join(" ")}
                          dir="ltr"
                          style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}
                        >
                          <span>{office.phone}</span>
                          <Phone size={11} className="shrink-0" />
                        </p>
                      </div>
                      ))}
                    </div>
                  ),
                },
                {
                  key: "contact" as const,
                  title: FOOTER_SECTION_TITLES.contact,
                  content: (
                    <div className="space-y-5">
                      {FOOTER_CONTACT_CHANNELS.map(([title, value]) => (
                        <div key={title}>
                          <p className={["text-[12px] font-semibold text-[#94a3b8]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>{title}</p>
                          <p
                            className={["mt-2 flex items-center gap-2 text-[14px] text-[#64748b]", isArabic ? "justify-end text-right" : ""].join(" ")}
                            dir="ltr"
                            style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}
                          >
                            <span>{value}</span>
                            <Mail size={13} className="shrink-0 text-[#60a5fa]" />
                          </p>
                        </div>
                      ))}
                    </div>
                  ),
                },
              ].map(({ key, title, content }) => {
                const isOpen = openFooterSection === key;

                return (
                  <div key={key} className="border-b border-white/10">
                    <button
                      className={[`${subtleButtonHoverClassName} flex w-full items-center justify-between py-4`, isArabic ? "text-right" : "text-left"].join(" ")}
                      onClick={() => setOpenFooterSection((current) => (current === key ? null : key))}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`footer-section-${key}`}
                    >
                      <span className="text-[12px] font-bold uppercase tracking-[1.2px] text-[#60a5fa]" style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>
                        {title}
                      </span>
                      <svg
                        aria-hidden="true"
                        className="size-4 text-[#60a5fa] transition-transform duration-300"
                        style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                        fill="none"
                        viewBox="0 0 20 20"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4" />
                      </svg>
                    </button>
                    <div
                      id={`footer-section-${key}`}
                      aria-hidden={!isOpen}
                      className={[
                        "grid transition-all duration-300 ease-out",
                        isOpen ? "grid-rows-[1fr] pb-4 opacity-100" : "grid-rows-[0fr] opacity-0",
                      ].join(" ")}
                    >
                      <div className="overflow-hidden">{content}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-white/10 py-6 text-[12px] text-[rgba(255,255,255,0.4)]">
              <p className="text-center" style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>{FOOTER_COPY.copyright}</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                {FOOTER_POLICY_LINKS.map((label) => (
                  <a key={label} href={label === "Terms of Use" ? "/terms-of-use" : label === "Privacy Policy" ? "/privacy-policy" : "/cookie-policy"} style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>{label}</a>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center justify-between border-b border-white/10 pb-10">
            <img alt="JHC" className="h-[42px] w-auto" src={logo} />
            <p className="max-w-[620px] text-center text-[13px] leading-[22px] text-[#64748b]" style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>
              {FOOTER_COPY.description}
            </p>
            <div className="flex gap-2" dir="ltr">
              {socialButton(Linkedin, {
                className: "size-9",
                iconClassName: "text-[#94a3b8]",
                iconSize: 13,
                strokeWidth: 1.6,
                fill: true,
                href: SOCIAL_LINKS.linkedin,
              })}
              {socialButton(Facebook, {
                className: "size-9",
                iconClassName: "text-[#94a3b8]",
                iconSize: 13,
                strokeWidth: 1.6,
                fill: true,
                href: SOCIAL_LINKS.facebook,
              })}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-10 py-10">
            <div>
              <p className={["border-b border-[#60a5fa]/20 pb-3 text-[12px] font-bold uppercase tracking-[1.2px] text-[#60a5fa]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>
                {FOOTER_SECTION_TITLES.company}
              </p>
              <div className={["mt-6 space-y-[14px] text-[14px] text-[#64748b]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>
                {FOOTER_COMPANY_LINKS.map(({ label, href }) => (
                  <a key={label} className="block" href={href}>{label}</a>
                ))}
              </div>
            </div>

            <div>
              <p className={["border-b border-[#60a5fa]/20 pb-3 text-[12px] font-bold uppercase tracking-[1.2px] text-[#60a5fa]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>
                {FOOTER_SECTION_TITLES.services}
              </p>
              <div className={["mt-6 space-y-[14px] text-[14px] text-[#64748b]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>
                {FOOTER_SERVICE_LINKS.map(({ label, href }) => (
                  <a key={label} className="block" href={href}>{label}</a>
                ))}
              </div>
            </div>

            <div>
              <p className={["border-b border-[#60a5fa]/20 pb-3 text-[12px] font-bold uppercase tracking-[1.2px] text-[#60a5fa]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>
                {FOOTER_SECTION_TITLES.locations}
              </p>
              <div className="mt-6 space-y-7 text-[14px]">
                {OFFICE_LOCATIONS.map((office) => (
                <div key={office.city}>
                  <p
                    className={["flex items-center gap-2 font-semibold text-[#e2e8f0]", isArabic ? "justify-end text-right" : ""].join(" ")}
                    dir="ltr"
                    style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}
                  >
                    <span dir={isArabic ? "rtl" : "ltr"} className="whitespace-nowrap">
                      {office.city}, <span className="font-normal text-[#64748b]">{office.country}</span>
                    </span>
                    <MapPin size={13} className="shrink-0 text-[#60a5fa]" />
                  </p>
                  <p
                    className={["mt-2 flex items-center gap-2 pl-[21px] text-[12px] text-[#64748b]", isArabic ? "justify-end text-right pl-0 pr-[21px]" : ""].join(" ")}
                    dir="ltr"
                    style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}
                  >
                    <span>{office.phone}</span>
                    <Phone size={11} className="shrink-0" />
                  </p>
                </div>
                ))}
              </div>
            </div>

            <div>
              <p className={["border-b border-[#60a5fa]/20 pb-3 text-[12px] font-bold uppercase tracking-[1.2px] text-[#60a5fa]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>
                {FOOTER_SECTION_TITLES.contact}
              </p>
              <div className="mt-6 space-y-5">
                {FOOTER_CONTACT_CHANNELS.map(([title, value]) => (
                  <div key={title}>
                    <p className={["text-[12px] font-semibold text-[#94a3b8]", isArabic ? "text-right" : ""].join(" ")} style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>{title}</p>
                    <p
                      className={["mt-2 flex items-center gap-2 text-[14px] text-[#64748b]", isArabic ? "justify-end text-right" : ""].join(" ")}
                      dir="ltr"
                      style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}
                    >
                      <span>{value}</span>
                      <Mail size={13} className="shrink-0 text-[#60a5fa]" />
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 py-6 text-[12px] text-[rgba(255,255,255,0.4)]">
            <p style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>{FOOTER_COPY.copyright}</p>
            <div className="flex gap-6">
              {FOOTER_POLICY_LINKS.map((label) => (
                <a key={label} href={label === "Terms of Use" ? "/terms-of-use" : label === "Privacy Policy" ? "/privacy-policy" : "/cookie-policy"} style={isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined}>{label}</a>
              ))}
            </div>
          </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
