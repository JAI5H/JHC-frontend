import ecoPhoto from "../../imgs/Ceo-photo.jpeg";
import { useLanguage } from "../providers/LanguageProvider";

export function CEOMessage() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const arabicFontStyle = isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined;

  return (
    <section className="reveal-on-scroll mx-auto mt-20 w-full max-w-none md:w-[1280px]">
      <div className="mx-4 overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#071633_0%,#0a1d46_100%)] px-6 py-8 text-white md:mx-0 md:px-10 md:py-9">
        <div className="relative flex flex-col gap-8 md:flex-row md:items-stretch md:gap-0" dir={isArabic ? "rtl" : "ltr"}>
          <div className={["flex flex-col justify-start md:w-[280px] md:shrink-0", isArabic ? "md:pl-10" : "md:pr-10"].join(" ")}>
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/45" style={arabicFontStyle}>
              {isArabic ? "كلمة الرئيس التنفيذي" : "Leadership Insight"}
            </p>

            <div className="flex items-center gap-4 md:flex-1 md:gap-5">
              <div className="size-[84px] shrink-0 overflow-hidden rounded-[16px] border bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" style={{ borderColor: "rgba(37,99,235,0.5)" }}>
                <img src={ecoPhoto} alt={isArabic ? "أحمد مرزوق" : "Ahmed Marzouk"} className="reveal-image h-full w-full object-cover object-center" />
              </div>

              <div className={isArabic ? "text-right" : ""} dir={isArabic ? "rtl" : "ltr"}>
                <p className="text-[16px] font-bold uppercase tracking-[0.14em] text-white" style={arabicFontStyle}>
                  {isArabic ? "أحمد مرزوق" : "Ahmed Marzouk"}
                </p>
                <p className="mt-2 text-[14px] font-medium text-white/45" style={arabicFontStyle}>
                  {isArabic ? "الرئيس التنفيذي لـ JHC" : "CEO, JHC"}
                </p>
              </div>
            </div>
          </div>

          <div className="hidden md:mx-2 md:block md:w-px md:shrink-0 md:bg-white/10" />

          <div className={["relative flex-1 pt-1", isArabic ? "md:pl-24 md:pr-10" : "md:pl-10 md:pr-24"].join(" ")}>
            <p
              className={["relative z-10 max-w-[760px] text-[17px] leading-[30px] text-white/88 not-italic md:pr-0 md:text-[20px] md:leading-relaxed", isArabic ? "text-right" : ""].join(" ")}
              dir={isArabic ? "rtl" : "ltr"}
              style={arabicFontStyle}
            >
              {isArabic
                ? "في JHC نؤمن بأن رأس المال البشري هو الأساس الحقيقي لنجاح الأعمال. وفي سوق الخليج سريع التطور، لا يمكن لأي نموذج تشغيلي ناجح أن يحقق أهدافه دون الكفاءات المناسبة القادرة على التنفيذ."
                : "At JHC, we believe that human capital is the absolute foundation of business success. In the rapidly evolving GCC market, strategic operations cannot exist without the right talent to execute them."}
            </p>
            <p
              className={["relative z-10 mt-6 max-w-[760px] text-[17px] leading-[30px] text-white/78 not-italic md:pr-0 md:text-[20px] md:leading-relaxed", isArabic ? "text-right" : ""].join(" ")}
              dir={isArabic ? "rtl" : "ltr"}
              style={arabicFontStyle}
            >
              {isArabic
                ? "نلتزم ببناء شراكات طويلة الأمد مع عملائنا، وتقديم حلول عملية ومرنة وقابلة للتوسع، تربط بين الكفاءات والفرص وتدعم النمو المستدام."
                : "Our commitment is to forge long-term partnerships with our clients, providing highly practical, flexible, and scalable solutions that bridge talent with opportunity."}
            </p>

            <div
              className={[
                "pointer-events-none absolute top-1 text-[74px] font-semibold leading-none text-[#2563eb]/16 md:top-1/2 md:-translate-y-1/2 md:text-[140px] md:text-[#2563eb]/85",
                isArabic ? "left-0 md:left-0" : "right-0 md:right-0",
              ].join(" ")}
            >
              ”
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
