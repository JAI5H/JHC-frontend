import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronRight,
  MapPin,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { ImageWithFallback } from "../components/shared/ImageWithFallback";
import { useLanguage } from "../providers/LanguageProvider";
import jhcLogo from "../../imgs/logo.png";
import { formatJobSalary, getPublicJobs, splitJobSkills, type JobRecord } from "../../services/api/jobsApi";
import { getAxiosErrorMessage, isRequestCanceled } from "../../services/api/utils";

const JOB_TYPE_BADGE_STYLE = { bg: "#EFF6FF", text: "#1D4ED8", border: "#DBEAFE" };

function formatDate(value: string | null, fallback = "Open deadline") {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function isDeadlinePast(value: string | null) {
  if (!value) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed < new Date();
}

function getPositionsLabel(count: number, isArabic: boolean) {
  return isArabic ? `${count} وظائف متاحة` : `${count} position${count === 1 ? "" : "s"} available`;
}

type CareersCopy = {
  home: string;
  careersTitle: string;
  heroDescription: string;
  searchPlaceholder: string;
  allTypes: string;
  clear: string;
  notDisclosed: string;
  deadline: string;
  openDeadline: string;
  apply: string;
  unableToLoadPositions: string;
  pleaseTryAgain: string;
  tryAgain: string;
  noPositionsMatch: string;
  noOpenPositions: string;
  tryDifferentSearch: string;
  checkBackSoon: string;
};

const EMPLOYMENT_TYPE_LABELS_AR: Record<string, string> = {
  "Full-time": "دوام كامل",
  "Part-time": "دوام جزئي",
  Contract: "عقد",
  Remote: "عن بعد",
  Freelance: "عمل حر",
};

const EXPERIENCE_LABELS_AR: Record<string, string> = {
  "Entry Level": "مستوى مبتدئ",
  Senior: "مستوى متقدم",
};

function getEmploymentTypeLabel(type: string, isArabic: boolean) {
  return isArabic ? EMPLOYMENT_TYPE_LABELS_AR[type] ?? type : type;
}

function getExperienceLabel(experience: string, isArabic: boolean) {
  return isArabic ? EXPERIENCE_LABELS_AR[experience] ?? experience : experience;
}

function JobCard({ job, copy, isArabic }: { job: JobRecord; copy: CareersCopy; isArabic: boolean }) {
  const skills = splitJobSkills(job.skills);
  const deadlinePast = isDeadlinePast(job.applicationDeadline);
  const salaryLabel = formatJobSalary(job);

  return (
    <Link
      to={`/careers/${job.slug}`}
      className="group flex flex-col gap-5 rounded-2xl p-7 transition-all duration-200"
      style={{ border: "1px solid #E2E8F0", background: "#ffffff", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      onMouseEnter={(event) => {
        event.currentTarget.style.borderColor = "#1D4ED8";
        event.currentTarget.style.boxShadow = "0 6px 20px rgba(29,78,216,0.09)";
        event.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor = "#E2E8F0";
        event.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
        event.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold leading-snug" style={{ color: "#0B1F4D" }}>{job.title}</h3>
        <span className="flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: JOB_TYPE_BADGE_STYLE.bg, color: JOB_TYPE_BADGE_STYLE.text, border: `1px solid ${JOB_TYPE_BADGE_STYLE.border}` }}>
          {getEmploymentTypeLabel(job.employmentType, isArabic)}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs" style={{ background: "#F8FAFC", color: "#64748B", border: "1px solid #F1F5F9" }}>
          <MapPin size={11} style={{ color: "#94A3B8" }} />{job.location}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs" style={{ background: "#F8FAFC", color: "#64748B", border: "1px solid #F1F5F9" }}>
          <Briefcase size={11} style={{ color: "#94A3B8" }} />{getExperienceLabel(job.experienceLevel, isArabic)}
        </span>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: "#64748B", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {job.description}
      </p>

      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 4).map((skill) => (
            <span key={skill} className="rounded-lg px-2.5 py-1 text-xs font-medium" style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #DBEAFE" }}>
              {skill}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-auto flex items-center justify-between border-t pt-4" style={{ borderColor: "#F1F5F9" }}>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold" style={{ color: salaryLabel ? "#0B1F4D" : "#94A3B8" }}>
            {salaryLabel || copy.notDisclosed}
          </span>
          <span className="inline-flex items-center gap-1 text-xs" style={{ color: deadlinePast ? "#DC2626" : "#94A3B8" }}>
            <Calendar size={10} />
            {copy.deadline} {formatDate(job.applicationDeadline, copy.openDeadline)}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-semibold transition-all" style={{ color: "#1D4ED8" }}>
          {copy.apply} <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function Skeleton() {
  return (
    <div className="rounded-2xl p-7" style={{ border: "1px solid #E2E8F0", background: "#ffffff" }}>
      {[85, 60, 100, 75, 40].map((width, index) => (
        <div key={index} className="mb-4 h-4 animate-pulse rounded-lg" style={{ background: "#F1F5F9", width: `${width}%` }} />
      ))}
    </div>
  );
}

export default function CareersPage() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const copy: CareersCopy = isArabic
    ? {
        home: "الرئيسية",
        careersTitle: "الوظائف في JHC",
        heroDescription: "انضم إلى فريق من المتخصصين في حلول القوى العاملة الاستراتيجية، وساهم في مساعدة المؤسسات في دول الخليج على بناء وإدارة فرق عمل متميزة.",
        searchPlaceholder: "ابحث باسم الوظيفة أو الموقع...",
        allTypes: "كل أنواع الوظائف",
        clear: "مسح",
        notDisclosed: "غير معلن",
        deadline: "آخر موعد للتقديم:",
        openDeadline: "موعد مفتوح",
        apply: "تقدم للوظيفة",
        unableToLoadPositions: "تعذر تحميل الوظائف",
        pleaseTryAgain: "يرجى المحاولة مرة أخرى.",
        tryAgain: "حاول مرة أخرى",
        noPositionsMatch: "لا توجد وظائف تطابق بحثك",
        noOpenPositions: "لا توجد وظائف متاحة حالياً",
        tryDifferentSearch: "جرّب كلمة بحث أو فلتر مختلف.",
        checkBackSoon: "تابعنا قريباً للاطلاع على فرص جديدة.",
      }
    : {
        home: "Home",
        careersTitle: "Careers at JHC",
        heroDescription: "Join a team of strategic workforce professionals helping GCC organizations build and manage world-class teams.",
        searchPlaceholder: "Search by title or location...",
        allTypes: "All Types",
        clear: "Clear",
        notDisclosed: "Not disclosed",
        deadline: "Deadline:",
        openDeadline: "Open deadline",
        apply: "Apply",
        unableToLoadPositions: "Unable to load positions",
        pleaseTryAgain: "Please try again.",
        tryAgain: "Try Again",
        noPositionsMatch: "No positions match your search",
        noOpenPositions: "No open positions at this time",
        tryDifferentSearch: "Try a different search term or filter.",
        checkBackSoon: "Check back soon for new opportunities.",
      };
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [search, setSearch] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadJobs = useCallback((signal?: AbortSignal) => {
    setIsLoading(true);
    setError("");
    void getPublicJobs({ status: "Published", pageNumber: 1, pageSize: 100 }, { signal })
      .then((result) => {
        if (signal?.aborted) return;
        setJobs(result.items);
      })
      .catch((requestError) => {
        if (isRequestCanceled(requestError) || signal?.aborted) return;
        setError(getAxiosErrorMessage(requestError, copy.unableToLoadPositions));
      })
      .finally(() => {
        if (!signal?.aborted) setIsLoading(false);
      });
  }, [copy.unableToLoadPositions]);

  useEffect(() => {
    const controller = new AbortController();
    loadJobs(controller.signal);
    return () => controller.abort();
  }, [loadJobs]);

  const employmentTypes = useMemo(() => {
    return Array.from(new Set(jobs.map((job) => job.employmentType).filter(Boolean))).sort();
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return jobs.filter((job) => {
      const skills = splitJobSkills(job.skills).join(" ").toLowerCase();
      const matchesType = !employmentType || job.employmentType === employmentType;
      const matchesSearch = !query || (
        job.title.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.employmentType.toLowerCase().includes(query) ||
        job.experienceLevel.toLowerCase().includes(query) ||
        skills.includes(query)
      );

      return matchesType && matchesSearch;
    });
  }, [employmentType, jobs, search]);

  const hasActiveFilters = Boolean(search || employmentType);
  const heroTitleFontSize = isArabic ? "clamp(2.25rem, 4.5vw, 3.8rem)" : "clamp(2.5rem, 5vw, 4.25rem)";

  return (
    <div style={{ fontFamily: "var(--font-family-app)", background: "#F8FAFC", minHeight: "100vh" }}>
      <header className="fixed left-1/2 top-4 z-50 w-[calc(100%-24px)] max-w-[1280px] -translate-x-1/2 md:top-6">
        <div
          className="relative flex h-[72px] items-center justify-between rounded-[23px] px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[18px] md:h-[84px] md:px-[30px]"
          style={{
            border: "1px solid rgba(255,255,255,0.25)",
            background: "linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          <Link to="/">
            <ImageWithFallback src={jhcLogo} alt="JHC" className="h-[34px] w-auto object-contain md:h-[42px]" />
          </Link>
          <Link
            to="/"
            className="inline-flex h-[46px] items-center gap-2 rounded-[16px] border px-4 text-sm font-semibold text-white/90 backdrop-blur-[12px] transition-all hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/10 md:h-[52px] md:px-5"
            style={{
              borderColor: "rgba(255,255,255,0.18)",
              background: "linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))",
            }}
          >
            <ArrowLeft size={14} /> {copy.home}
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#030e26]">
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

        <div className={["relative z-10 mx-auto max-w-5xl px-6 pb-12 lg:px-8 lg:pt-36", isArabic ? "pt-[152px]" : "pt-[120px]"].join(" ")}>
          <h1 className={isArabic ? "mb-5" : "mb-4"} style={{ fontSize: heroTitleFontSize, fontWeight: 900, color: "#ffffff", lineHeight: 1.02, letterSpacing: "-0.045em" }}>
            {copy.careersTitle}
          </h1>
          <p className="mb-8 max-w-2xl text-base leading-8 sm:text-lg" style={{ color: "#b8c1d1" }}>
            {copy.heroDescription}
          </p>

          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#93C5FD" }} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className="rounded-xl py-2.5 pl-10 pr-9 text-sm"
                style={{ border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.06)", color: "#ffffff", outline: "none", fontFamily: "inherit", width: 280, transition: "border-color 0.15s", backdropFilter: "blur(12px)" }}
                onFocus={(event) => { event.target.style.borderColor = "rgba(96,165,250,0.65)"; }}
                onBlur={(event) => { event.target.style.borderColor = "rgba(255,255,255,0.14)"; }}
              />
              {search ? (
                <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={13} style={{ color: "#CBD5E1" }} />
                </button>
              ) : null}
            </div>

            <div className="relative">
              <select
                value={employmentType}
                onChange={(event) => setEmploymentType(event.target.value)}
                className="rounded-xl py-2.5 pl-4 pr-9 text-sm"
                style={{ border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.06)", color: employmentType ? "#93C5FD" : "#CBD5E1", outline: "none", fontFamily: "inherit", cursor: "pointer", appearance: "none", backdropFilter: "blur(12px)" }}
              >
                <option value="">{copy.allTypes}</option>
                {employmentTypes.map((type) => (
                  <option key={type} value={type}>{getEmploymentTypeLabel(type, isArabic)}</option>
                ))}
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#CBD5E1" }} />
            </div>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setEmploymentType("");
                }}
                className="rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.14)", color: "#CBD5E1", background: "rgba(255,255,255,0.04)" }}
              >
                <X size={12} className="mr-1 inline" />{copy.clear}
              </button>
            ) : null}
          </div>

          {!isLoading ? (
            <p className="mt-4 text-sm" style={{ color: "#93A4C7" }}>
              {getPositionsLabel(filteredJobs.length, isArabic)}
            </p>
          ) : null}
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6 py-14 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[1, 2, 3, 4].map((item) => <Skeleton key={item} />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-5 py-24">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "#FEF2F2" }}>
              <AlertCircle size={24} style={{ color: "#DC2626" }} />
            </div>
            <div className="text-center">
              <div className="font-semibold" style={{ color: "#0B1F4D" }}>{copy.unableToLoadPositions}</div>
              <p className="mt-1 text-sm" style={{ color: "#64748B" }}>{error || copy.pleaseTryAgain}</p>
            </div>
            <button type="button" onClick={() => loadJobs()} className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>
              <RefreshCw size={13} /> {copy.tryAgain}
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "#F1F5F9" }}>
              <Briefcase size={24} style={{ color: "#94A3B8" }} />
            </div>
            <div className="text-center">
              <div className="font-semibold" style={{ color: "#0B1F4D" }}>{hasActiveFilters ? copy.noPositionsMatch : copy.noOpenPositions}</div>
              <p className="mt-1 text-sm" style={{ color: "#64748B" }}>{hasActiveFilters ? copy.tryDifferentSearch : copy.checkBackSoon}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {filteredJobs.map((job) => <JobCard key={job.id} job={job} copy={copy} isArabic={isArabic} />)}
          </div>
        )}
      </main>
    </div>
  );
}
