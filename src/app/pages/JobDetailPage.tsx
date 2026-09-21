import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Check,
  ChevronRight,
  Clock,
  DollarSign,
  GraduationCap,
  MapPin,
  Share2,
} from "lucide-react";
import { ImageWithFallback } from "../components/shared/ImageWithFallback";
import { useLanguage } from "../providers/LanguageProvider";
import jhcLogo from "../../imgs/logo.png";
import { formatJobSalary, getPublicJobBySlug, splitJobSkills, type JobRecord } from "../../services/api/jobsApi";
import { getAxiosErrorMessage, isRequestCanceled } from "../../services/api/utils";

function formatDate(value: string | null, locale = "en-US", fallback = "Open deadline") {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
}

function isDeadlinePast(value: string | null) {
  if (!value) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed < new Date();
}

function getLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function getPublicJobUrl(slug: string) {
  return `${window.location.origin}/careers/${slug}`;
}

function BulletList({ items, isRtl }: { items: string[]; isRtl?: boolean }) {
  return (
    <ul className="flex flex-col gap-3.5">
      {items.map((item) => (
        <li key={item} className={["flex items-start gap-3", isRtl ? "text-right" : ""].join(" ")}>
          <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full" style={{ background: "#EFF6FF" }}>
            <Check size={10} style={{ color: "#1D4ED8" }} />
          </div>
          <span className="text-sm leading-relaxed" dir="auto" style={{ color: "#334155" }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SectionCard({ eyebrow, title, children, id, isRtl }: { eyebrow: string; title: string; children: React.ReactNode; id?: string; isRtl?: boolean }) {
  return (
    <section id={id} className="rounded-2xl p-6 sm:p-8" style={{ background: "#ffffff", border: "1px solid #E2E8F0" }}>
      <div className={["mb-6 flex items-center gap-3", isRtl ? "text-right" : ""].join(" ")}>
        <div className="h-7 w-1 rounded-full" style={{ background: "linear-gradient(180deg, #1D4ED8, #60A5FA)" }} />
        <div>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "#60A5FA" }}>{eyebrow}</div>
          <h2 className="font-black" style={{ fontSize: "1.0625rem", color: "#0B1F4D", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
            {title}
          </h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function DetailRow({ icon, label, value, warn, muted, isRtl }: { icon: React.ReactNode; label: string; value: string; warn?: boolean; muted?: boolean; isRtl?: boolean }) {
  return (
    <div className={["flex items-start gap-3 py-3 first:pt-0 last:pb-0", isRtl ? "text-right" : ""].join(" ")}>
      <span className="mt-0.5 flex-shrink-0" style={{ color: warn ? "#DC2626" : "#60A5FA" }}>{icon}</span>
      <div>
        <div className="text-xs" style={{ color: "#94A3B8" }}>{label}</div>
        <div className="mt-0.5 text-sm font-semibold" dir="auto" style={{ color: warn ? "#DC2626" : muted ? "#94A3B8" : "#0B1F4D" }}>{value}</div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <main style={{ background: "#F8FAFC", minHeight: "100vh" }}>
      <section style={{ background: "#ffffff", borderBottom: "1px solid #E2E8F0" }}>
        <div className="mx-auto max-w-5xl px-6 pb-12 pt-24 lg:px-8">
          <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />
          <div className="mt-8 h-10 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="mt-5 h-10 w-1/2 animate-pulse rounded bg-slate-200" />
          <div className="mt-7 flex flex-wrap gap-3">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-36 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_264px]">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-2xl bg-white p-8" style={{ border: "1px solid #E2E8F0" }}>
                <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                <div className="mt-6 space-y-3">
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    </main>
  );
}

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const headerRef = useRef<HTMLElement | null>(null);
  const [job, setJob] = useState<JobRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">("idle");
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const loadJob = async () => {
      if (!slug) {
        setError("Job not found.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const result = await getPublicJobBySlug(slug, { signal: controller.signal });
        if (controller.signal.aborted) return;
        setJob(result);
      } catch (requestError) {
        if (isRequestCanceled(requestError) || controller.signal.aborted) return;
        setError(getAxiosErrorMessage(requestError, "Job not found."));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void loadJob();
    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    const updateNavState = () => setNavScrolled(window.scrollY > 24);
    updateNavState();
    window.addEventListener("scroll", updateNavState, { passive: true });
    return () => window.removeEventListener("scroll", updateNavState);
  }, []);

  const requirements = useMemo(() => getLines(job?.requirements ?? ""), [job?.requirements]);
  const responsibilities = useMemo(() => getLines(job?.responsibilities ?? ""), [job?.responsibilities]);
  const skills = useMemo(() => splitJobSkills(job?.skills), [job?.skills]);
  const isArabic = language === "ar";
  const locale = isArabic ? "ar-EG" : "en-US";
  const uiFontStyle = isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined;
  const copy = isArabic
    ? {
        navCareers: "الوظائف",
        home: "الرئيسية",
        careers: "الوظائف",
        positionNotFound: "لم يتم العثور على الوظيفة",
        positionNotFoundDescription: "قد تكون هذه الوظيفة غير متاحة أو تم حذف الرابط.",
        viewAllPositions: "عرض كل الوظائف",
        positionClosed: "الوظيفة مغلقة",
        deadlinePassed: "انتهى موعد التقديم",
        nowHiring: "متاح الآن",
        deadlinePassedShort: "انتهى الموعد",
        applyBy: "التقديم حتى",
        shareThisJob: "مشاركة هذه الوظيفة",
        linkCopied: "تم نسخ الرابط",
        readyToApply: "جاهز للتقديم؟",
        takesLess: "قدّم طلبك للمراجعة",
        applyNow: "قدّم الآن",
        closedNotice: "هذه الوظيفة لم تعد تستقبل طلبات.",
        deadlineNotice: "انتهى موعد التقديم لهذه الوظيفة.",
        visitCareersPrefix: "زر صفحة",
        visitCareersSuffix: "لرؤية وظائف أخرى متاحة.",
        overviewEyebrow: "نظرة عامة",
        aboutRole: "عن هذه الوظيفة",
        requirementsEyebrow: "ما نبحث عنه",
        requirements: "المتطلبات",
        responsibilitiesEyebrow: "أثر دورك",
        responsibilities: "المسؤوليات",
        interested: "مهتم بهذه الوظيفة؟",
        positionDetails: "تفاصيل الوظيفة",
        location: "الموقع",
        employment: "نوع التوظيف",
        experience: "الخبرة",
        salary: "الراتب",
        deadline: "آخر موعد",
        passed: "انتهى",
        keySkills: "المهارات الرئيسية",
        applyForPosition: "قدّم على هذه الوظيفة",
        notDisclosed: "غير معلن",
        openDeadline: "موعد مفتوح",
      }
    : {
        navCareers: "Careers",
        home: "Home",
        careers: "Careers",
        positionNotFound: "Position not found",
        positionNotFoundDescription: "This job posting may have been removed or the link may be invalid.",
        viewAllPositions: "View All Positions",
        positionClosed: "Position Closed",
        deadlinePassed: "Deadline Passed",
        nowHiring: "Now Hiring",
        deadlinePassedShort: "Deadline passed",
        applyBy: "Apply by",
        shareThisJob: "Share this job",
        linkCopied: "Link copied!",
        readyToApply: "Ready to apply?",
        takesLess: "Submit your application for review",
        applyNow: "Apply Now",
        closedNotice: "This position is no longer accepting applications.",
        deadlineNotice: "The application deadline for this position has passed.",
        visitCareersPrefix: "Visit our",
        visitCareersSuffix: "to see other open positions.",
        overviewEyebrow: "Overview",
        aboutRole: "About this Role",
        requirementsEyebrow: "What We're Looking For",
        requirements: "Requirements",
        responsibilitiesEyebrow: "Your Impact",
        responsibilities: "Responsibilities",
        interested: "Interested in this role?",
        positionDetails: "Position Details",
        location: "Location",
        employment: "Employment",
        experience: "Experience",
        salary: "Salary",
        deadline: "Deadline",
        passed: "Passed",
        keySkills: "Key Skills",
        applyForPosition: "Apply for this Position",
        notDisclosed: "Not disclosed",
        openDeadline: "Open deadline",
      };
  const applyPath = job ? `/careers/${job.slug}/apply` : "/careers";
  const deadlinePast = isDeadlinePast(job?.applicationDeadline ?? null);
  const isClosed = job?.status === "Closed";
  const canApply = Boolean(job && !isClosed && !deadlinePast);
  const salaryLabel = job ? formatJobSalary(job) : "";
  const salaryDisplay = salaryLabel || copy.notDisclosed;

  const handleShare = async () => {
    if (!job) return;

    try {
      await navigator.clipboard.writeText(getPublicJobUrl(job.slug));
      setShareState("copied");
    } catch {
      setShareState("error");
    }

    window.setTimeout(() => setShareState("idle"), 2200);
  };

  return (
    <div dir={isArabic ? "rtl" : "ltr"} style={{ fontFamily: "var(--font-family-app)", background: "#F8FAFC", minHeight: "100vh" }}>
      <header className="fixed left-1/2 top-4 z-50 w-[calc(100%-24px)] max-w-[1280px] -translate-x-1/2 md:top-6">
        <div
          className="relative flex h-[72px] items-center justify-between rounded-[23px] px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[18px] transition-[background,border-color,box-shadow] duration-300 md:h-[84px] md:px-[30px]"
          style={{
            border: navScrolled ? "1px solid rgba(96,165,250,0.34)" : "1px solid rgba(255,255,255,0.25)",
            background: navScrolled
              ? "linear-gradient(180deg,rgba(11,31,77,0.96),rgba(11,31,77,0.9))"
              : "linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))",
            boxShadow: navScrolled ? "0 18px 44px rgba(3,14,38,0.22), inset 0 1px 0 rgba(255,255,255,0.06)" : undefined,
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          <Link to="/">
            <ImageWithFallback src={jhcLogo} alt="JHC" className="h-[34px] w-auto object-contain md:h-[42px]" />
          </Link>
          <Link
            to="/careers"
            className="inline-flex h-[46px] items-center gap-2 rounded-[16px] border px-4 text-sm font-semibold text-white/90 backdrop-blur-[12px] transition-all hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/10 md:h-[52px] md:px-5"
            style={{
              ...uiFontStyle,
              borderColor: "rgba(255,255,255,0.18)",
              background: "linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))",
            }}
          >
            {isArabic ? <>{copy.navCareers}<ArrowLeft size={14} className="rotate-180" /></> : <><ArrowLeft size={14} /> {copy.navCareers}</>}
          </Link>
        </div>
      </header>

      {isLoading ? (
        <LoadingState />
      ) : error || !job ? (
        <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "#F1F5F9" }}>
            <Briefcase size={28} style={{ color: "#94A3B8" }} />
          </div>
          <div>
            <h1 className="mb-2 text-2xl font-bold" style={{ ...uiFontStyle, color: "#0B1F4D" }}>{copy.positionNotFound}</h1>
            <p className="text-sm" style={{ ...uiFontStyle, color: "#64748B" }}>{isArabic ? copy.positionNotFoundDescription : error || copy.positionNotFoundDescription}</p>
          </div>
          <Link to="/careers" className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all" style={{ background: "#0B1F4D" }}>
            <ArrowLeft size={14} className={isArabic ? "rotate-180" : undefined} /> {copy.viewAllPositions}
          </Link>
        </main>
      ) : (
        <>
          <section ref={headerRef} className="relative overflow-hidden bg-[#030e26]">
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
            <div aria-hidden="true" className="absolute inset-0 bg-[rgba(3,14,38,0.58)]" />
            <div aria-hidden="true" className="absolute left-[-8%] top-10 h-72 w-72 rounded-full bg-[#2563eb]/12 blur-[70px]" />
            <div aria-hidden="true" className="absolute right-[6%] top-16 h-64 w-64 rounded-full bg-[#3b82f6]/16 blur-[76px]" />
            <div aria-hidden="true" className="absolute bottom-[-20%] left-[35%] h-72 w-72 rounded-full bg-[#1d4ed8]/10 blur-[86px]" />

            <div className={["relative z-10 mx-auto max-w-5xl px-6 pb-12 pt-[120px] lg:px-8 lg:pt-36", isArabic ? "text-right" : ""].join(" ")}>
              <nav aria-label="Breadcrumb" className={["mb-8 flex items-center gap-2 text-xs", isArabic ? "justify-start" : ""].join(" ")} style={{ ...uiFontStyle, color: "#93A4C7" }}>
                <Link to="/" className="transition-colors hover:text-white">{copy.home}</Link>
                <ChevronRight size={12} className={isArabic ? "rotate-180" : undefined} />
                <Link to="/careers" className="transition-colors hover:text-white">{copy.careers}</Link>
                <ChevronRight size={12} className={isArabic ? "rotate-180" : undefined} />
                <span className="truncate text-white/90" dir="auto">{job.title}</span>
              </nav>

              <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1">
                  <div className={["mb-5 flex flex-wrap items-center gap-2", isArabic ? "justify-start" : ""].join(" ")}>
                    {isClosed ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: "rgba(220,38,38,0.12)", color: "#FCA5A5", border: "1px solid rgba(252,165,165,0.26)" }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#FCA5A5" }} />{copy.positionClosed}
                      </span>
                    ) : deadlinePast ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: "rgba(220,38,38,0.12)", color: "#FCA5A5", border: "1px solid rgba(252,165,165,0.26)" }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#FCA5A5" }} />{copy.deadlinePassed}
                      </span>
                    ) : null}
                  </div>

                  <h1 dir="auto" style={{ fontSize: "clamp(2.125rem, 4.25vw, 3.6125rem)", fontWeight: 900, color: "#ffffff", lineHeight: 1.02, letterSpacing: "-0.045em" }}>
                    {job.title}
                  </h1>

                  <div className={["mt-6 flex flex-wrap gap-x-5 gap-y-3", isArabic ? "justify-start" : ""].join(" ")}>
                    {[
                      { icon: <MapPin size={14} />, text: job.location },
                      { icon: <GraduationCap size={14} />, text: job.experienceLevel },
                      { icon: <DollarSign size={14} />, text: salaryDisplay, highlight: Boolean(salaryLabel), muted: !salaryLabel },
                      { icon: <Briefcase size={14} />, text: job.employmentType },
                      ...(job.applicationDeadline ? [{ icon: <Clock size={14} />, text: deadlinePast ? copy.deadlinePassedShort : `${copy.applyBy} ${formatDate(job.applicationDeadline, locale)}`, warn: deadlinePast }] : []),
                    ].map((item, index) => (
                      <div key={`${item.text}-${index}`} className="flex items-center gap-2 text-sm" style={{ ...uiFontStyle, color: item.warn ? "#FCA5A5" : item.highlight ? "#ffffff" : item.muted ? "#94A3B8" : "#C0C8D8", fontWeight: item.highlight ? 800 : 500 }}>
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border" style={{ borderColor: item.warn ? "rgba(252,165,165,0.3)" : "rgba(96,165,250,0.28)", color: item.warn ? "#FCA5A5" : "#60A5FA", background: "rgba(255,255,255,0.03)" }}>{item.icon}</span>
                        <span dir="auto">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {canApply ? (
                  <div className="hidden flex-shrink-0 flex-col gap-4 lg:flex lg:w-[248px]">
                    <div
                      className="relative overflow-hidden rounded-[22px] px-6 py-7 text-center"
                      style={{
                        background: "rgba(7,26,63,0.72)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        boxShadow: "0 20px 54px rgba(0,0,0,0.18)",
                      }}
                    >
                      <div className="relative z-10 mx-auto mb-5 flex h-[54px] w-[54px] items-center justify-center rounded-2xl" style={{ background: "rgba(255,255,255,0.12)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
                        <Briefcase size={22} style={{ color: "#60A5FA" }} />
                      </div>
                      <div className="relative z-10 text-base font-extrabold leading-5 text-white" style={uiFontStyle}>{copy.readyToApply}</div>
                      <p className="relative z-10 mt-2 text-sm leading-5" style={{ ...uiFontStyle, color: "#b8c1d1" }}>{copy.takesLess}</p>
                      <Link
                        to={applyPath}
                        className="relative z-10 mt-6 inline-flex h-11 w-full items-center justify-center rounded-[16px] text-[12px] font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-[#2563EB] hover:shadow-[0_12px_28px_rgba(37,99,235,0.25)]"
                        style={{ ...uiFontStyle, background: "#1D4ED8" }}
                      >
                        {copy.applyNow} {isArabic ? "←" : "→"}
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <main className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
            <div className="flex flex-col gap-8">
              {!canApply && (isClosed || deadlinePast) ? (
                <div className={["flex items-start gap-4 rounded-2xl p-5", isArabic ? "text-right" : ""].join(" ")} style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: "#FEE2E2" }}>
                    <AlertCircle size={17} style={{ color: "#DC2626" }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ ...uiFontStyle, color: "#DC2626" }}>
                      {isClosed ? copy.closedNotice : copy.deadlineNotice}
                    </div>
                    <p className="mt-1 text-sm" style={{ ...uiFontStyle, color: "#B91C1C" }}>
                      {copy.visitCareersPrefix} <Link to="/careers" className="font-semibold underline">{copy.careers}</Link> {copy.visitCareersSuffix}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className={["flex flex-col gap-8", isArabic ? "items-stretch lg:flex-row-reverse lg:items-start" : "items-start lg:flex-row"].join(" ")}>
                <div className="flex min-w-0 flex-1 flex-col gap-6">
                  {job.description ? (
                    <SectionCard id="about" eyebrow={copy.overviewEyebrow} title={copy.aboutRole} isRtl={isArabic}>
                      <p className="text-sm leading-relaxed" dir="auto" style={{ color: "#334155", lineHeight: 1.9 }}>{job.description}</p>
                    </SectionCard>
                  ) : null}

                  {requirements.length > 0 ? (
                    <SectionCard id="requirements" eyebrow={copy.requirementsEyebrow} title={copy.requirements} isRtl={isArabic}>
                      <BulletList items={requirements} isRtl={isArabic} />
                    </SectionCard>
                  ) : null}

                  {responsibilities.length > 0 ? (
                    <SectionCard id="responsibilities" eyebrow={copy.responsibilitiesEyebrow} title={copy.responsibilities} isRtl={isArabic}>
                      <BulletList items={responsibilities} isRtl={isArabic} />
                    </SectionCard>
                  ) : null}

                  {canApply ? (
                    <div className={["flex items-center justify-between gap-4 rounded-2xl p-6 lg:hidden", isArabic ? "text-right" : ""].join(" ")} style={{ background: "#0B1F4D" }}>
                      <div>
                        <div className="text-sm font-bold text-white" style={uiFontStyle}>{copy.interested}</div>
                        <p className="mt-0.5 text-xs" style={{ ...uiFontStyle, color: "rgba(255,255,255,0.5)" }}>{copy.takesLess}</p>
                      </div>
                      <Link to={applyPath} className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all" style={{ ...uiFontStyle, background: "#1D4ED8", color: "#ffffff" }}>
                        {copy.applyNow} <ChevronRight size={15} className={isArabic ? "rotate-180" : undefined} />
                      </Link>
                    </div>
                  ) : null}
                </div>

                <aside className="hidden flex-shrink-0 flex-col gap-4 lg:flex" style={{ width: 264, position: "sticky", top: 84 }}>
                  <div className="overflow-hidden rounded-2xl" style={{ border: "1px solid #E2E8F0" }}>
                    <div className="border-b px-5 py-3.5" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
                      <div className={["text-xs font-bold uppercase tracking-widest", isArabic ? "text-right" : ""].join(" ")} style={{ ...uiFontStyle, color: "#94A3B8" }}>{copy.positionDetails}</div>
                    </div>
                    <div className="flex flex-col divide-y bg-white p-5" style={{ borderColor: "#F1F5F9" }}>
                      <DetailRow icon={<MapPin size={13} />} label={copy.location} value={job.location} isRtl={isArabic} />
                      <DetailRow icon={<Briefcase size={13} />} label={copy.employment} value={job.employmentType} isRtl={isArabic} />
                      <DetailRow icon={<GraduationCap size={13} />} label={copy.experience} value={job.experienceLevel} isRtl={isArabic} />
                      <DetailRow icon={<DollarSign size={13} />} label={copy.salary} value={salaryDisplay} muted={!salaryLabel} isRtl={isArabic} />
                      {job.applicationDeadline ? <DetailRow icon={<Clock size={13} />} label={copy.deadline} value={deadlinePast ? copy.passed : formatDate(job.applicationDeadline, locale, copy.openDeadline)} warn={deadlinePast} isRtl={isArabic} /> : null}
                    </div>
                  </div>

                  {skills.length > 0 ? (
                    <div className="rounded-2xl p-5" style={{ background: "#ffffff", border: "1px solid #E2E8F0" }}>
                      <div className={["mb-3 text-xs font-bold uppercase tracking-widest", isArabic ? "text-right" : ""].join(" ")} style={{ ...uiFontStyle, color: "#94A3B8" }}>{copy.keySkills}</div>
                      <div className={["flex flex-wrap gap-2", isArabic ? "justify-end" : ""].join(" ")}>
                        {skills.map((skill) => (
                          <span key={skill} dir="auto" className="rounded-lg px-2.5 py-1 text-xs font-medium" style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #DBEAFE" }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {canApply ? (
                    <Link to={applyPath} className="w-full rounded-xl py-3.5 text-center text-sm font-bold text-white transition-all" style={{ ...uiFontStyle, background: "#0B1F4D" }}>
                      {copy.applyForPosition}
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-all"
                    style={{ ...uiFontStyle, borderColor: "#E2E8F0", color: shareState === "copied" ? "#16A34A" : "#94A3B8", background: shareState === "copied" ? "#F0FDF4" : "transparent" }}
                  >
                    {shareState === "copied" ? (
                      isArabic ? <>{copy.linkCopied}<Check size={12} /></> : <><Check size={12} />{copy.linkCopied}</>
                    ) : (
                      isArabic ? <>{copy.shareThisJob}<Share2 size={12} /></> : <><Share2 size={12} />{copy.shareThisJob}</>
                    )}
                  </button>
                </aside>
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
}
