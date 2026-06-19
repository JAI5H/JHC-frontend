import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { useEffect } from "react";
import { useTranslation } from "../../app/hooks/useTranslation";
import { useLanguage } from "../../app/providers/LanguageProvider";

type ServiceLayoutProps = {
  title: string;
  subtitle: string;
  overview: string;
  ctaText: string;
  sections?: Array<{
    body: string;
    title: string;
  }>;
};

export default function ServiceLayout({ title, subtitle, overview, ctaText, sections }: ServiceLayoutProps) {
  const { landing } = useTranslation();
  const { language } = useLanguage();
  const isArabic = language === "ar";

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant" as ScrollBehavior,
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0B1F4D]">
      <section className="relative overflow-hidden rounded-b-[24px] bg-[#0B1F4D] px-4 pb-14 pt-16 text-white md:pb-18 md:pt-20">
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden opacity-100 md:block"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.0525) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.0525) 1px, transparent 1px)",
            backgroundPosition: "-18px 0",
            backgroundSize: "70px 68.94px",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-100 md:hidden"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03255) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03255) 1px, transparent 1px)",
            backgroundPosition: "-10px 0",
            backgroundSize: "44px 44px",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(37,99,235,0.12), transparent 38%), linear-gradient(180deg, rgba(12,29,67,0.28) 0%, rgba(3,14,38,0.5) 100%)",
          }}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[rgba(3,14,38,0.42)]" />
        <div aria-hidden="true" className="absolute left-[-18%] top-[88px] h-[180px] w-[180px] rounded-full bg-[#2563eb]/10 blur-[72px] md:hidden" />
        <div aria-hidden="true" className="absolute right-[-10%] top-[208px] h-[170px] w-[170px] rounded-full bg-[#3b82f6]/8 blur-[80px] md:hidden" />
        <div aria-hidden="true" className="absolute left-[7%] top-[84px] hidden h-[260px] w-[260px] rounded-full bg-[#2563eb]/9 blur-[52px] md:block" />
        <div aria-hidden="true" className="absolute right-[6%] top-[118px] hidden h-[240px] w-[240px] rounded-full bg-[#2563eb]/7 blur-[58px] md:block" />

        <div className={["relative z-10 mx-auto max-w-4xl", isArabic ? "text-right" : ""].join(" ")} dir={isArabic ? "rtl" : "ltr"}>
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/78 transition-colors hover:text-white"
            to="/#services"
          >
            {isArabic ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
            <span>{isArabic ? "العودة للرئيسية" : "Back to Home"}</span>
          </Link>

          <div className="mt-7 max-w-3xl">
            <div className="inline-flex items-center rounded-[11px] border border-[#2563eb] bg-[rgba(14,29,67,0.7)] px-[16px] py-[9px] backdrop-blur-[18px]">
              <span className="text-[12px] font-semibold text-white">
                {isArabic ? "خدمات JHC" : "JHC Services"}
              </span>
            </div>
            <h1 className="mt-6 text-[2.35rem] font-extrabold leading-tight tracking-[-0.03em] md:text-[3.5rem] md:leading-[1.08]">{title}</h1>
            <p className="mt-5 max-w-2xl text-[1rem] leading-8 text-white/80 md:text-[1.125rem]">{subtitle}</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:py-14">
        <div
          className={["mx-auto max-w-6xl rounded-3xl border border-[#E2E8F0] bg-white p-7 md:p-10", isArabic ? "text-right" : ""].join(" ")}
          dir={isArabic ? "rtl" : "ltr"}
        >
          <p className="text-base leading-8 text-[#475569] md:text-[1.0625rem]">{overview}</p>
        </div>
      </section>

      <section className="px-4 pb-12 md:pb-16">
        <div className="mx-auto max-w-6xl">
          {sections && sections.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {sections.map((section) => (
                <div
                  key={section.title}
                  className={["rounded-3xl border border-[#E2E8F0] bg-white px-6 py-6 md:px-7 md:py-7", isArabic ? "text-right" : ""].join(" ")}
                  dir={isArabic ? "rtl" : "ltr"}
                >
                  <h2 className="text-[1.25rem] font-bold leading-8 tracking-[-0.02em] text-[#0B1F4D]">{section.title}</h2>
                  <p className="mt-3 text-base leading-8 text-[#64748B]">{section.body}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-6xl rounded-3xl bg-[#0B1F4D] px-7 py-10 text-white md:px-10 md:py-12">
          <div className={["mx-auto max-w-3xl", isArabic ? "text-right md:text-center" : "text-left md:text-center"].join(" ")} dir={isArabic ? "rtl" : "ltr"}>
            <h2 className="text-[2rem] font-extrabold leading-tight tracking-[-0.03em] md:text-[2.65rem]">
              {landing.contactSection.title}
            </h2>
            <p className="mt-4 text-base leading-8 text-white/80 md:text-[1.0625rem]">
              {landing.contactSection.description}
            </p>
            <a
              className="mt-7 inline-flex items-center justify-center rounded-2xl bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white"
              href="/#contact"
            >
              {ctaText}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
