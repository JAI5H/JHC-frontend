import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AlertCircle, ArrowLeft, ChevronDown, ChevronUp, Download, Eye, FileText, Filter, LoaderCircle, RefreshCw, Search, Sparkles, Users, X } from "lucide-react";
import { AdminLayout } from "../components/admin/AdminLayout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { getAdminJobById, type JobRecord } from "../../services/api/jobsApi";
import {
  analyzeJobApplicationWithAi,
  getJobApplicationCv,
  getJobApplicationById,
  getJobApplicationStats,
  getJobApplications,
  retryJobApplicationAiScreening,
  updateJobApplicationStatus,
  type AiScreeningStatus,
  type JobApplicationAiScreening,
  type JobApplicationStats,
  type JobApplicationStatus,
  type JobApplicationRecord,
} from "../../services/api/jobApplicationsApi";
import { getControlledActionErrorMessage, getAxiosErrorMessage, isRequestCanceled } from "../../services/api/utils";
import { parseBackendUtcTimestamp } from "../../services/dateTime";

const PAGE_SIZE = 10;
const AI_POLL_INTERVAL_MS = 3_000;
const AI_POLL_MAX_ATTEMPTS = 20;
const APPLICATION_STATUSES: JobApplicationStatus[] = ["New", "UnderReview", "Shortlisted", "Hired", "Rejected"];
const STATUS_LABELS: Record<JobApplicationStatus, string> = {
  New: "New",
  UnderReview: "Under Review",
  Shortlisted: "Shortlisted",
  Hired: "Hired",
  Rejected: "Rejected",
};
const STATUS_CONFIG: Record<JobApplicationStatus, { bg: string; text: string; dot: string }> = {
  New: { bg: "#EFF6FF", text: "#1D4ED8", dot: "#1D4ED8" },
  UnderReview: { bg: "#FFFBEB", text: "#D97706", dot: "#D97706" },
  Shortlisted: { bg: "#F0FDF4", text: "#16A34A", dot: "#16A34A" },
  Hired: { bg: "#ECFDF5", text: "#059669", dot: "#059669" },
  Rejected: { bg: "#F8FAFC", text: "#64748B", dot: "#94A3B8" },
};
const EMPTY_STATS: JobApplicationStats = {
  totalApplications: 0,
  newApplications: 0,
  underReviewApplications: 0,
  shortlistedApplications: 0,
  hiredApplications: 0,
  rejectedApplications: 0,
};
const AI_STATUS_CONFIG: Record<AiScreeningStatus, { bg: string; border: string; color: string }> = {
  Pending: { bg: "#FFFBEB", border: "#FDE68A", color: "#B45309" },
  Processing: { bg: "#EFF6FF", border: "#BFDBFE", color: "#1D4ED8" },
  Completed: { bg: "#F0FDF4", border: "#BBF7D0", color: "#15803D" },
  Failed: { bg: "#FEF2F2", border: "#FCA5A5", color: "#DC2626" },
  Unknown: { bg: "#F9FAFB", border: "#D1D5DB", color: "#4B5563" },
};
const AI_NOT_ANALYZED_CONFIG = { bg: "#F8FAFC", border: "#CBD5E1", color: "#475569" };
const AI_COPY = {
  en: {
    matchTitle: "AI Match Score",
    assessmentTitle: "لماذا هذه النتيجة؟",
    notAnalyzed: "AI Analysis: Not analyzed yet",
    notAnalyzedBadge: "Not analyzed",
    notAnalyzedDescription: "No AI analysis is running. Start an analysis when you are ready.",
    pending: "AI Analysis: Pending",
    processing: "AI Analysis: Processing...",
    failed: "AI Analysis failed",
    unknown: "AI Analysis status unavailable",
    unknownDescription: "The analysis returned an unrecognized status. Please try again later.",
    pollingTimeout: "AI analysis is taking longer than expected. Please check again later.",
    pendingDescription: "The application details remain available while the AI result is being prepared.",
    processingDescription: "The application details remain available while analysis is running.",
    failedDescription: "The application details are still available. AI analysis can be reviewed later when a result is available.",
    unavailable: "No AI assessment is available yet.",
    strengths: "نقاط القوة الرئيسية",
    skills: "المهارات ذات الصلة",
    gaps: "الفجوات المحتملة",
    noGaps: "No potential gaps were returned.",
    evaluated: "Evaluated",
    provider: "Provider",
    strong: "Strong match",
    good: "Good match",
    moderate: "Moderate match",
    low: "Needs closer review",
    analyze: "Analyze with AI",
    analyzing: "Analyzing...",
    reanalyze: "Re-analyze",
    reanalyzing: "Re-analyzing...",
    retry: "Retry AI Analysis",
    retrying: "Retrying...",
    reanalyzeError: "Unable to re-analyze this application right now.",
    analyzeError: "Unable to start AI analysis right now.",
    retryError: "Unable to retry AI analysis right now.",
  },
  ar: {
    matchTitle: "درجة المطابقة بالذكاء الاصطناعي",
    assessmentTitle: "لماذا هذه الدرجة؟",
    notAnalyzed: "تحليل الذكاء الاصطناعي: لم يتم التحليل بعد",
    notAnalyzedBadge: "لم يتم التحليل",
    notAnalyzedDescription: "لا يوجد تحليل بالذكاء الاصطناعي قيد التشغيل. يمكنك بدء التحليل عندما تكون مستعدا.",
    pending: "تحليل الذكاء الاصطناعي: قيد الانتظار",
    processing: "تحليل الذكاء الاصطناعي: جار المعالجة...",
    failed: "تعذر تحليل الذكاء الاصطناعي",
    unknown: "حالة تحليل الذكاء الاصطناعي غير متاحة",
    unknownDescription: "أعاد التحليل حالة غير معروفة. يرجى المحاولة مرة أخرى لاحقا.",
    pollingTimeout: "يستغرق تحليل الذكاء الاصطناعي وقتا أطول من المتوقع. يرجى التحقق لاحقا.",
    pendingDescription: "تظل تفاصيل الطلب متاحة أثناء تجهيز نتيجة التحليل.",
    processingDescription: "تظل تفاصيل الطلب متاحة أثناء تشغيل التحليل.",
    failedDescription: "تظل تفاصيل الطلب متاحة. يمكن مراجعة تحليل الذكاء الاصطناعي لاحقا عند توفر النتيجة.",
    unavailable: "لا يوجد تقييم متاح بالذكاء الاصطناعي حتى الآن.",
    strengths: "نقاط القوة الرئيسية",
    skills: "المهارات ذات الصلة",
    gaps: "الفجوات المحتملة",
    noGaps: "لم يتم إرجاع فجوات محتملة.",
    evaluated: "تاريخ التقييم",
    provider: "المزود",
    strong: "مطابقة قوية",
    good: "مطابقة جيدة",
    moderate: "مطابقة متوسطة",
    low: "يحتاج إلى مراجعة أدق",
    analyze: "تحليل بالذكاء الاصطناعي",
    analyzing: "جار التحليل...",
    reanalyze: "إعادة التحليل",
    reanalyzing: "جار إعادة التحليل...",
    retry: "إعادة تحليل الذكاء الاصطناعي",
    retrying: "جار إعادة التحليل...",
    reanalyzeError: "تعذرت إعادة تحليل هذا الطلب حاليا.",
    analyzeError: "تعذر بدء تحليل الذكاء الاصطناعي حاليا.",
    retryError: "تعذرت إعادة تحليل الذكاء الاصطناعي حاليا.",
  },
} as const;
type AiCopy = Record<keyof typeof AI_COPY.en, string>;

function formatDate(value: string | null) {
  if (!value) return "Not available";
  const parsed = parseBackendUtcTimestamp(value);
  if (!parsed) return value;
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatAiDate(value: string | null, locale: "en" | "ar") {
  if (!value) return null;
  const parsed = parseBackendUtcTimestamp(value);
  if (!parsed) return value;
  return parsed.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function csvValue(value: string | number | null | undefined) {
  const stringValue = String(value ?? "");
  const spreadsheetSafeValue = /^[\t\r\n ]*[=+\-@]/.test(stringValue)
    ? `'${stringValue}`
    : stringValue;
  return `"${spreadsheetSafeValue.replace(/"/g, '""')}"`;
}

function exportCSV(applicants: JobApplicationRecord[], jobTitle: string) {
  const headers = ["Name", "Age", "Nationality", "Experience", "Ready To Start", "Expected Salary", "AI Match Score", "Status", "Additional Notes", "CV", "Applied Date"];
  const rows = applicants.map((applicant) => [
    applicant.name,
    applicant.age,
    applicant.nationality,
    applicant.experience,
    applicant.readyToStart,
    formatExpectedSalary(applicant),
    applicant.aiScreening?.status === "Completed" && applicant.aiScreening.matchScore != null
      ? `${applicant.aiScreening.matchScore} / 100`
      : "—",
    STATUS_LABELS[applicant.status],
    applicant.additionalNotes,
    applicant.cvFileName,
    applicant.createdAt,
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${jobTitle.toLowerCase().replace(/\s+/g, "-")}-applicants.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function getFilenameFromContentDisposition(contentDisposition?: string) {
  if (!contentDisposition) return null;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1].replace(/"/g, ""));
  }

  const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return filenameMatch?.[1] ?? null;
}

function downloadBlob(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function formatExpectedSalary(applicant: Pick<JobApplicationRecord, "expectedSalary" | "expectedSalaryCurrency">) {
  const amount = applicant.expectedSalary?.trim();
  const currency = applicant.expectedSalaryCurrency?.trim();
  if (amount && currency) return `${amount} ${currency}`;
  if (amount) return amount;
  return "Not specified";
}

function StatusBadge({ status }: { status: JobApplicationStatus }) {
  const color = STATUS_CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: color.bg, color: color.text }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color.dot }} />
      {STATUS_LABELS[status]}
    </span>
  );
}

function getScoreLabel(score: number, copy: AiCopy) {
  if (score >= 80) return copy.strong;
  if (score >= 65) return copy.good;
  if (score >= 45) return copy.moderate;
  return copy.low;
}

function getScoreColor(score: number) {
  if (score >= 80) return "#16A34A";
  if (score >= 65) return "#1D4ED8";
  if (score >= 45) return "#D97706";
  return "#DC2626";
}

function AiStateMessage({
  aiScreening,
  copy,
  isRetrying = false,
  retryError = "",
  onRetry,
}: {
  aiScreening: JobApplicationAiScreening | null;
  copy: AiCopy;
  isRetrying?: boolean;
  retryError?: string;
  onRetry?: () => void;
}) {
  const hasNoScreening = aiScreening === null;
  const status = aiScreening?.status ?? "Pending";
  const statusConfig = hasNoScreening ? AI_NOT_ANALYZED_CONFIG : AI_STATUS_CONFIG[status];
  const message =
    hasNoScreening
      ? copy.notAnalyzed
      : status === "Failed"
        ? copy.failed
        : status === "Processing"
          ? copy.processing
          : status === "Completed"
            ? copy.unavailable
            : status === "Unknown"
              ? copy.unknown
              : copy.pending;
  const description =
    hasNoScreening
      ? copy.notAnalyzedDescription
      : status === "Failed"
        ? copy.failedDescription
        : status === "Processing"
          ? copy.processingDescription
          : status === "Unknown"
            ? copy.unknownDescription
            : copy.pendingDescription;

  return (
    <div className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm" style={{ background: statusConfig.bg, border: `1px solid ${statusConfig.border}`, color: statusConfig.color }}>
      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="font-bold">{message}</div>
        <div className="mt-1 leading-6">{description}</div>
        {(status === "Failed" || aiScreening === null) && onRetry ? (
          <>
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              style={{ borderColor: statusConfig.border, color: statusConfig.color }}
            >
              {isRetrying ? <LoaderCircle size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              {isRetrying ? (aiScreening === null ? copy.analyzing : copy.retrying) : (aiScreening === null ? copy.analyze : copy.retry)}
            </button>
          </>
        ) : null}
        {retryError ? <div className="mt-2 text-xs font-medium" role="alert">{retryError}</div> : null}
      </div>
    </div>
  );
}

function AiMatchScoreCard({
  aiScreening,
  copy,
  locale,
  isRetrying,
  retryError,
  onRetry,
}: {
  aiScreening: JobApplicationAiScreening | null;
  copy: AiCopy;
  locale: "en" | "ar";
  isRetrying: boolean;
  retryError: string;
  onRetry: () => void;
}) {
  const score = aiScreening?.status === "Completed" ? aiScreening.matchScore : null;
  const safeScore = typeof score === "number" ? Math.min(100, Math.max(0, Math.round(score))) : null;
  const scoreColor = safeScore === null ? "#94A3B8" : getScoreColor(safeScore);
  const evaluatedAt = formatAiDate(aiScreening?.evaluatedAt ?? null, locale);
  const canReanalyze = aiScreening?.status === "Completed";

  return (
    <div className="rounded-xl bg-white p-5 sm:col-span-2 xl:col-span-2" style={{ border: "1px solid #E2E8F0" }}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "#94A3B8" }}>{copy.matchTitle}</div>
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: aiScreening ? AI_STATUS_CONFIG[aiScreening.status].bg : AI_NOT_ANALYZED_CONFIG.bg, color: aiScreening ? AI_STATUS_CONFIG[aiScreening.status].color : AI_NOT_ANALYZED_CONFIG.color }}>
          <Sparkles size={12} /> {aiScreening?.status ?? copy.notAnalyzedBadge}
        </span>
      </div>

      {safeScore === null ? (
        <div className="mt-5">
          <AiStateMessage aiScreening={aiScreening} copy={copy} isRetrying={isRetrying} retryError={retryError} onRetry={onRetry} />
        </div>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-2">
            <span className="text-5xl font-black leading-none" style={{ color: scoreColor }}>{safeScore}</span>
            <span className="pb-1 text-xl font-black" style={{ color: "#0B1F4D" }}>/ 100</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ background: "#E2E8F0" }}>
            <div className="h-full rounded-full" style={{ width: `${safeScore}%`, background: scoreColor }} />
          </div>
          <div className="mt-3 text-sm font-semibold" style={{ color: scoreColor }}>{getScoreLabel(safeScore, copy)}</div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: "#64748B" }}>
            {aiScreening?.modelProvider ? <span>{copy.provider}: {aiScreening.modelProvider}</span> : null}
            {evaluatedAt ? <span>{copy.evaluated}: {evaluatedAt}</span> : null}
          </div>
          {canReanalyze ? (
            <>
              <button
                type="button"
                onClick={onRetry}
                disabled={isRetrying}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                style={{ borderColor: "#E2E8F0", color: "#64748B" }}
              >
                {isRetrying ? <LoaderCircle size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                {isRetrying ? copy.reanalyzing : copy.reanalyze}
              </button>
              {retryError ? <div className="mt-2 text-xs font-medium" style={{ color: "#DC2626" }} role="alert">{retryError}</div> : null}
            </>
          ) : null}
        </>
      )}
    </div>
  );
}

function AiAssessmentCard({
  aiScreening,
  copy,
}: {
  aiScreening: JobApplicationAiScreening | null;
  copy: AiCopy;
}) {
  const isCompleted = aiScreening?.status === "Completed";
  const sections = [
    { title: copy.strengths, items: aiScreening?.strengths ?? [], dir: "rtl" },
    { title: copy.skills, items: aiScreening?.relevantSkills ?? [], dir: "ltr" },
    { title: copy.gaps, items: aiScreening?.gaps ?? [], empty: copy.noGaps, dir: "rtl" },
  ];

  return (
    <div className="rounded-xl bg-white p-5 sm:col-span-2 xl:col-span-3" style={{ border: "1px solid #E2E8F0" }}>
      <div dir="rtl" className="text-right text-xs font-bold" style={{ color: "#94A3B8", fontFamily: "'Cairo', system-ui, sans-serif" }}>{copy.assessmentTitle}</div>
      {!isCompleted ? (
        <div className="mt-4">
          <AiStateMessage aiScreening={aiScreening} copy={copy} />
        </div>
      ) : (
        <>
          <p
            dir={aiScreening.explanation ? "rtl" : "ltr"}
            className="mt-3 whitespace-pre-line text-sm leading-6"
            style={{ color: "#334155", textAlign: aiScreening.explanation ? "right" : "left", fontFamily: aiScreening.explanation ? "'Cairo', system-ui, sans-serif" : undefined }}
          >
            {aiScreening.explanation || copy.unavailable}
          </p>
          <div className="mt-5 grid gap-x-8 gap-y-4 md:grid-cols-3">
            {sections.map((section) => (
              <div key={section.title} className="min-w-0">
                <div dir="rtl" className="text-right text-xs font-bold" style={{ color: "#0B1F4D", fontFamily: "'Cairo', system-ui, sans-serif" }}>{section.title}</div>
                {section.items.length > 0 ? (
                  <ul
                    dir={section.dir}
                    className="mt-2 space-y-2 text-sm leading-6"
                    style={{ color: "#334155", textAlign: section.dir === "rtl" ? "right" : "left", fontFamily: section.dir === "rtl" ? "'Cairo', system-ui, sans-serif" : undefined }}
                  >
                    {section.items.map((item) => (
                      <li key={item} dir={section.dir} className="flex min-w-0 items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: "#1D4ED8" }} />
                        <span className="min-w-0 flex-1 break-words">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-2 text-sm" style={{ color: "#94A3B8" }}>{section.empty ?? copy.unavailable}</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FilterDropdown({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-[transform,background-color,border-color,color] duration-200 ease-out hover:-translate-y-px active:translate-y-0"
        style={{ border: `1px solid ${value ? "#1D4ED8" : "#E2E8F0"}`, color: value ? "#1D4ED8" : "#64748B", background: value ? "#EFF6FF" : "#ffffff" }}
      >
        <Filter size={13} />
        {value || label}
        <ChevronDown size={13} />
      </button>
      {open ? (
        <div
          className="absolute left-0 top-full z-20 mt-1 overflow-hidden rounded-xl"
          style={{ background: "#ffffff", border: "1px solid #E2E8F0", minWidth: "180px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
        >
          {options.length > 0 ? options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option === value ? "" : option);
                setOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm transition-colors"
              style={{ background: option === value ? "#EFF6FF" : "transparent", color: option === value ? "#1D4ED8" : "#0F172A", fontWeight: option === value ? 600 : 400 }}
              onMouseEnter={(e) => { if (option !== value) (e.currentTarget as HTMLElement).style.background = "#F8FAFC"; }}
              onMouseLeave={(e) => { if (option !== value) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {option}
            </button>
          )) : (
            <div className="px-4 py-2.5 text-sm" style={{ color: "#94A3B8" }}>No options</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function AdminJobApplicantsPage() {
  const { id } = useParams<{ id: string }>();
  const jobId = Number(id);
  const navigate = useNavigate();
  const aiCopy = AI_COPY.en;
  const [job, setJob] = useState<JobRecord | null>(null);
  const [applicants, setApplicants] = useState<JobApplicationRecord[]>([]);
  const [stats, setStats] = useState<JobApplicationStats>(EMPTY_STATS);
  const [search, setSearch] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [nationalityFilter, setNationalityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobApplicationStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [selectedApplicantId, setSelectedApplicantId] = useState<number | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<JobApplicationRecord | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [cvActionId, setCvActionId] = useState<number | null>(null);
  const [cvError, setCvError] = useState("");
  const [statusMenuId, setStatusMenuId] = useState<number | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [aiRetryingId, setAiRetryingId] = useState<number | null>(null);
  const [aiRetryError, setAiRetryError] = useState("");
  const [aiPollingError, setAiPollingError] = useState("");
  const cvRequestInFlightRef = useRef(false);
  const aiActionInFlightRef = useRef(false);
  const detailRequestIdRef = useRef<number | null>(null);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return applicants.filter((applicant) => {
      const matchesExperience = !experienceFilter || applicant.experience === experienceFilter;
      const matchesNationality = !nationalityFilter || applicant.nationality === nationalityFilter;
      const matchesStatus = statusFilter === "all" || applicant.status === statusFilter;
      if (!matchesExperience || !matchesNationality) return false;
      if (!matchesStatus) return false;
      if (!normalizedSearch) return true;
      return (
        applicant.name.toLowerCase().includes(normalizedSearch) ||
        applicant.nationality.toLowerCase().includes(normalizedSearch) ||
        applicant.location.toLowerCase().includes(normalizedSearch) ||
        applicant.experience.toLowerCase().includes(normalizedSearch) ||
        applicant.readyToStart.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [applicants, experienceFilter, nationalityFilter, search, statusFilter]);

  const experienceOptions = useMemo(
    () => Array.from(new Set(applicants.map((applicant) => applicant.experience.trim()).filter(Boolean))).sort(),
    [applicants],
  );
  const nationalityOptions = useMemo(
    () => Array.from(new Set(applicants.map((applicant) => applicant.nationality.trim()).filter(Boolean))).sort(),
    [applicants],
  );
  const statusFilterValue = statusFilter === "all" ? "" : STATUS_LABELS[statusFilter];

  const statCards = [
    { label: "TOTAL APPLICATIONS", value: stats.totalApplications, delta: "Applications for this job", color: "#1D4ED8" },
    { label: "NEW", value: stats.newApplications, delta: "Recently submitted", color: STATUS_CONFIG.New.dot },
    { label: "UNDER REVIEW", value: stats.underReviewApplications, delta: "Currently under review", color: STATUS_CONFIG.UnderReview.dot },
    { label: "SHORTLISTED", value: stats.shortlistedApplications, delta: "Ready for next step", color: STATUS_CONFIG.Shortlisted.dot },
    { label: "HIRED", value: stats.hiredApplications, delta: "Successfully completed", color: STATUS_CONFIG.Hired.dot },
    { label: "REJECTED", value: stats.rejectedApplications, delta: "Closed applications", color: STATUS_CONFIG.Rejected.dot },
  ];

  const loadApplicants = useCallback(async (signal?: AbortSignal) => {
    if (!Number.isFinite(jobId)) {
      setError("Invalid job id.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
    setFeedback("");
    setApplicants([]);
      try {
        const [jobResult, applicationsResult, statsResult] = await Promise.all([
        getAdminJobById(jobId, { signal }),
        getJobApplications(jobId, { pageNumber: page, pageSize: PAGE_SIZE }, { signal }),
        getJobApplicationStats(jobId, { signal }),
      ]);
      if (signal?.aborted) return;
      setJob(jobResult);
      setApplicants(applicationsResult.items);
      setTotalCount(applicationsResult.totalCount);
      setStats(statsResult);
    } catch (requestError) {
      if (isRequestCanceled(requestError) || signal?.aborted) return;
      setError(getAxiosErrorMessage(requestError, "Unable to load applicants right now."));
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [jobId, page]);

  useEffect(() => {
    const controller = new AbortController();
    void loadApplicants(controller.signal);
    return () => controller.abort();
  }, [loadApplicants]);

  useEffect(() => {
    const applicationId = selectedApplicant?.id;
    const aiStatus = selectedApplicant?.aiScreening?.status;
    if (
      !applicationId ||
      aiRetryingId === applicationId ||
      (aiStatus !== "Pending" && aiStatus !== "Processing")
    ) return;

    const controller = new AbortController();
    let timeoutId: number | null = null;
    let attempts = 0;

    function scheduleNextPoll() {
      if (controller.signal.aborted) return;
      if (attempts >= AI_POLL_MAX_ATTEMPTS) {
        setAiPollingError(aiCopy.pollingTimeout);
        return;
      }
      timeoutId = window.setTimeout(() => void poll(), AI_POLL_INTERVAL_MS);
    }

    async function poll() {
      if (controller.signal.aborted) return;
      attempts += 1;

      try {
        const refreshed = await getJobApplicationById(jobId, applicationId, { signal: controller.signal });
        if (controller.signal.aborted) return;

        setSelectedApplicant((current) => current?.id === applicationId ? refreshed : current);
        setApplicants((current) => current.map((item) => item.id === applicationId ? refreshed : item));
        setAiPollingError("");

        const refreshedStatus = refreshed.aiScreening?.status;
        if (refreshedStatus === "Pending" || refreshedStatus === "Processing") {
          scheduleNextPoll();
        }
      } catch (requestError) {
        if (!isRequestCanceled(requestError) && !controller.signal.aborted) {
          scheduleNextPoll();
        }
      }
    }

    setAiPollingError("");
    scheduleNextPoll();

    return () => {
      controller.abort();
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [aiCopy.pollingTimeout, aiRetryingId, jobId, selectedApplicant?.id]);

  const openApplicantDetail = async (applicationId: number) => {
    if (selectedApplicantId === applicationId) {
      detailRequestIdRef.current = null;
      setSelectedApplicantId(null);
      setSelectedApplicant(null);
      setDetailError("");
      setAiRetryError("");
      setAiPollingError("");
      setDetailLoading(false);
      return;
    }

    setSelectedApplicantId(applicationId);
    detailRequestIdRef.current = applicationId;
    setSelectedApplicant(null);
    setDetailError("");
    setAiRetryError("");
    setAiPollingError("");
    setDetailLoading(true);

    try {
      const detail = await getJobApplicationById(jobId, applicationId);
      if (detailRequestIdRef.current !== applicationId) return;
      setSelectedApplicant(detail);
    } catch (requestError) {
      if (detailRequestIdRef.current !== applicationId) return;
      setDetailError(getAxiosErrorMessage(requestError, "Unable to load applicant details right now."));
    } finally {
      if (detailRequestIdRef.current === applicationId) setDetailLoading(false);
    }
  };

  const refreshStats = async () => {
    const nextStats = await getJobApplicationStats(jobId);
    setStats(nextStats);
  };

  const handleAiAction = async (application: JobApplicationRecord) => {
    const aiStatus = application.aiScreening?.status;
    const canRunAction = application.aiScreening === null || aiStatus === "Failed" || aiStatus === "Completed";
    if (aiActionInFlightRef.current || !canRunAction) return;

    const previousCompletedScreening = aiStatus === "Completed" && application.aiScreening
      ? {
          ...application.aiScreening,
          strengths: [...application.aiScreening.strengths],
          relevantSkills: [...application.aiScreening.relevantSkills],
          gaps: [...application.aiScreening.gaps],
        }
      : null;
    const pendingScreening: JobApplicationAiScreening = {
      status: "Pending",
      matchScore: null,
      explanation: null,
      strengths: [],
      relevantSkills: [],
      gaps: [],
      errorMessage: null,
      modelProvider: null,
      evaluatedAt: null,
    };

    aiActionInFlightRef.current = true;
    setAiRetryingId(application.id);
    setAiRetryError("");
    setAiPollingError("");

    if (previousCompletedScreening) {
      setSelectedApplicant((current) =>
        current?.id === application.id ? { ...current, aiScreening: pendingScreening } : current,
      );
      setApplicants((current) =>
        current.map((item) => item.id === application.id ? { ...item, aiScreening: pendingScreening } : item),
      );
    }

    try {
      if (application.aiScreening === null) {
        await analyzeJobApplicationWithAi(jobId, application.id);
      } else {
        await retryJobApplicationAiScreening(jobId, application.id);
      }
    } catch (requestError) {
      const fallbackMessage = application.aiScreening === null
        ? aiCopy.analyzeError
        : aiStatus === "Completed"
          ? aiCopy.reanalyzeError
          : aiCopy.retryError;
      if (previousCompletedScreening) {
        setSelectedApplicant((current) =>
          current?.id === application.id ? { ...current, aiScreening: previousCompletedScreening } : current,
        );
        setApplicants((current) =>
          current.map((item) => item.id === application.id ? { ...item, aiScreening: previousCompletedScreening } : item),
        );
      }
      setAiRetryError(getControlledActionErrorMessage(requestError, fallbackMessage));
      aiActionInFlightRef.current = false;
      setAiRetryingId(null);
      return;
    }

    if (!previousCompletedScreening) {
      setSelectedApplicant((current) =>
        current?.id === application.id ? { ...current, aiScreening: pendingScreening } : current,
      );
      setApplicants((current) =>
        current.map((item) => item.id === application.id ? { ...item, aiScreening: pendingScreening } : item),
      );
    }
    aiActionInFlightRef.current = false;
    setAiRetryingId(null);
  };

  const handleStatusUpdate = async (applicant: JobApplicationRecord, nextStatus: JobApplicationStatus) => {
    if (statusUpdatingId) return;
    if (applicant.status === nextStatus) {
      setStatusMenuId(null);
      return;
    }

    setStatusUpdatingId(applicant.id);
    setStatusMenuId(null);
    setError("");
    setFeedback("");

    try {
      const updated = await updateJobApplicationStatus(jobId, applicant.id, nextStatus);
      setApplicants((current) =>
        current.map((item) =>
          item.id === applicant.id
            ? updated.id
              ? {
                  ...item,
                  ...updated,
                  status: updated.status,
                }
              : {
                  ...item,
                  status: nextStatus,
                }
            : item,
        ),
      );
      setSelectedApplicant((current) =>
        current?.id === applicant.id
          ? updated.id
            ? {
                ...current,
                ...updated,
                status: updated.status,
              }
            : {
                ...current,
                status: nextStatus,
              }
          : current,
      );
      await refreshStats();
      setFeedback(`${applicant.name} moved to ${STATUS_LABELS[nextStatus]}.`);
    } catch (requestError) {
      setError(getAxiosErrorMessage(requestError, "Unable to update applicant status right now."));
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleViewCv = async (application: JobApplicationRecord) => {
    if (cvRequestInFlightRef.current) return;
    cvRequestInFlightRef.current = true;

    const previewWindow = window.open("about:blank", "_blank");
    if (previewWindow) previewWindow.opener = null;

    setCvActionId(application.id);
    setCvError("");

    try {
      const cvResponse = await getJobApplicationCv(jobId, application.id);
      const responseContentType = cvResponse.contentType || cvResponse.blob.type;
      const contentType = responseContentType.split(";", 1)[0].trim().toLowerCase();
      const isApprovedPdf = contentType === "application/pdf";
      const filename =
        getFilenameFromContentDisposition(cvResponse.contentDisposition) ||
        application.cvFileName ||
        `${application.name.toLowerCase().replace(/\s+/g, "-") || "candidate"}-cv`;
      const blob = new Blob([cvResponse.blob], {
        type: isApprovedPdf ? "application/pdf" : "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);

      if (isApprovedPdf && previewWindow) {
        previewWindow.location.href = url;
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
        return;
      }

      previewWindow?.close();
      downloadBlob(url, filename);
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    } catch (requestError) {
      previewWindow?.close();
      setCvError(getAxiosErrorMessage(requestError, "Unable to open this CV right now."));
    } finally {
      cvRequestInFlightRef.current = false;
      setCvActionId(null);
    }
  };

  return (
    <AdminLayout title={job ? `${job.title} - Applicants` : "Applicants"}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 text-sm">
          <button type="button" onClick={() => navigate("/admin/jobs")} style={{ color: "#64748B" }}>Job Management</button>
          <span style={{ color: "#E2E8F0" }}>/</span>
          <span style={{ color: "#0B1F4D", fontWeight: 600 }}>Applicants</span>
        </div>

        {error ? (
          <div className="flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626" }}>
            <AlertCircle size={14} /> {error}
          </div>
        ) : null}

        {cvError ? (
          <div className="flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626" }}>
            <AlertCircle size={14} /> {cvError}
          </div>
        ) : null}

        {feedback ? (
          <div className="flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#15803D" }}>
            <AlertCircle size={14} /> {feedback}
          </div>
        ) : null}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-black" style={{ color: "#0B1F4D", letterSpacing: "-0.02em" }}>
              {job?.title ?? "Job"} <span className="font-normal" style={{ color: "#94A3B8" }}>- Applicants</span>
            </h2>
            <p className="mt-0.5 text-sm" style={{ color: "#64748B" }}>
              {totalCount} candidate{totalCount === 1 ? "" : "s"} applied to this position
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {applicants.length > 0 && job ? (
              <button type="button" onClick={() => exportCSV(applicants, job.title)} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold text-white transition-colors" style={{ borderColor: "#16A34A", background: "#16A34A" }}>
                <Download size={14} /> Export CSV
              </button>
            ) : null}
            <button type="button" onClick={() => navigate("/admin/jobs")} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>
              <ArrowLeft size={14} /> Back to Jobs
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map((metric) => (
            <div key={metric.label} className="flex flex-col gap-3 rounded-xl bg-white p-5" style={{ border: "1px solid #E2E8F0" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#94A3B8" }}>{metric.label}</span>
                <div className="h-2 w-2 rounded-full" style={{ background: metric.color }} />
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#0B1F4D", lineHeight: 1, letterSpacing: "-0.025em" }}>
                {isLoading ? "..." : metric.value.toLocaleString("en-US")}
              </div>
              <div className="text-xs font-medium" style={{ color: "#64748B" }}>
                ● {metric.delta}
              </div>
            </div>
          ))}
        </div>

        {applicants.length > 0 || search || experienceFilter || nationalityFilter || statusFilter !== "all" ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search applicants..." className="rounded-lg py-2 pl-9 pr-9 text-sm outline-none" style={{ border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#0F172A", width: "240px" }} />
              {search ? <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={12} style={{ color: "#94A3B8" }} /></button> : null}
            </div>
            <div className="h-5 w-px" style={{ background: "#E2E8F0" }} />
            <FilterDropdown label="Experience" options={experienceOptions} value={experienceFilter} onChange={setExperienceFilter} />
            <FilterDropdown label="Nationality" options={nationalityOptions} value={nationalityFilter} onChange={setNationalityFilter} />
            <FilterDropdown
              label="Status"
              options={APPLICATION_STATUSES.map((status) => STATUS_LABELS[status])}
              value={statusFilterValue}
              onChange={(nextLabel) => {
                const nextStatus = APPLICATION_STATUSES.find((status) => STATUS_LABELS[status] === nextLabel);
                setStatusFilter(nextStatus ?? "all");
              }}
            />
            {search || experienceFilter || nationalityFilter || statusFilter !== "all" ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setExperienceFilter("");
                  setNationalityFilter("");
                  setStatusFilter("all");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
                style={{ borderColor: "#E2E8F0", color: "#64748B" }}
              >
                <X size={11} /> Clear
              </button>
            ) : null}
            <span className="text-xs" style={{ color: "#94A3B8" }}>
              {filtered.length} result{filtered.length === 1 ? "" : "s"} on this page
            </span>
          </div>
        ) : null}

        <div className="flex flex-col rounded-xl bg-white" style={{ border: "1px solid #E2E8F0" }}>
          {isLoading ? (
            <div className="px-6 py-16 text-center text-sm" style={{ color: "#94A3B8" }}>Loading applicants...</div>
          ) : applicants.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-5 py-20">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "#F1F5F9" }}>
                <Users size={24} style={{ color: "#94A3B8" }} />
              </div>
              <div className="text-center">
                <div className="font-semibold" style={{ color: "#0B1F4D" }}>No applicants yet</div>
                <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Candidates who apply via the shareable link will appear here.</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <Search size={24} style={{ color: "#94A3B8" }} />
              <div className="text-center">
                <div className="font-semibold" style={{ color: "#0B1F4D" }}>No results</div>
                <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Try a different search term.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                    {["Candidate", "Age", "Nationality", "Experience", "Ready", "Expected Salary", "AI Match Score", "Status", "Notes", "CV", "Applied", "Actions"].map((heading) => (
                      <th key={heading} className="whitespace-nowrap px-5 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "#94A3B8", background: "#F8FAFC" }}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((applicant, index) => {
                    const isExpanded = selectedApplicantId === applicant.id;
                    return (
                      <Fragment key={applicant.id}>
                        <tr
                          tabIndex={0}
                          aria-expanded={isExpanded}
                          onClick={() => void openApplicantDetail(applicant.id)}
                          onKeyDown={(event) => {
                            if (event.target !== event.currentTarget) return;
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              void openApplicantDetail(applicant.id);
                            }
                          }}
                          className="cursor-pointer transition-colors hover:bg-[#F8FAFC] focus:outline-none focus-visible:bg-[#F8FAFC]"
                          style={{ borderBottom: isExpanded || index < filtered.length - 1 ? "1px solid #F1F5F9" : "none" }}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                                {applicant.name.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase()}
                              </div>
                              <span className="text-sm font-semibold" style={{ color: "#0B1F4D" }}>{applicant.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm" style={{ color: "#64748B" }}>{applicant.age}</td>
                          <td className="px-5 py-4 text-sm" style={{ color: "#64748B" }}>{applicant.nationality}</td>
                          <td className="px-5 py-4 text-sm" style={{ color: "#64748B" }}>{applicant.experience}</td>
                          <td className="px-5 py-4 text-sm" style={{ color: "#64748B" }}>{applicant.readyToStart}</td>
                          <td className="px-5 py-4 text-sm" style={{ color: "#64748B" }}>{formatExpectedSalary(applicant)}</td>
                          <td dir="ltr" className="whitespace-nowrap px-5 py-4 text-sm tabular-nums" style={{ color: "#64748B" }}>
                            {applicant.aiScreening?.status === "Completed" && applicant.aiScreening.matchScore != null
                              ? `${applicant.aiScreening.matchScore} / 100`
                              : "—"}
                          </td>
                          <td className="px-5 py-4"><StatusBadge status={applicant.status} /></td>
                          <td className="max-w-[260px] truncate px-5 py-4 text-sm" style={{ color: "#64748B" }}>{applicant.additionalNotes ?? "-"}</td>
                          <td className="px-5 py-4">
                            {applicant.cvFileName ? (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void handleViewCv(applicant);
                                }}
                                disabled={cvActionId === applicant.id}
                                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                                style={{ borderColor: "#E2E8F0", color: "#0B1F4D" }}
                              >
                                <FileText size={12} /> {cvActionId === applicant.id ? "Opening..." : applicant.cvFileName}
                              </button>
                            ) : (
                              <span className="text-xs" style={{ color: "#CBD5E1" }}>No CV</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-sm" style={{ color: "#94A3B8" }}>{formatDate(applicant.createdAt)}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void openApplicantDetail(applicant.id);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
                                style={{ borderColor: "#BFDBFE", color: "#1D4ED8" }}
                                aria-expanded={isExpanded}
                              >
                                <Eye size={12} /> View {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              </button>
                              <DropdownMenu
                                open={statusMenuId === applicant.id}
                                onOpenChange={(open) => setStatusMenuId(open ? applicant.id : null)}
                              >
                                <DropdownMenuTrigger asChild>
                                  <button
                                    type="button"
                                    disabled={statusUpdatingId === applicant.id}
                                    onClick={(event) => event.stopPropagation()}
                                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                                    style={{ borderColor: "#E2E8F0", color: "#0B1F4D" }}
                                  >
                                    {statusUpdatingId === applicant.id ? "Updating..." : "Update Status"} <ChevronDown size={12} />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  side="bottom"
                                  sideOffset={8}
                                  collisionPadding={16}
                                  className="z-[100] w-44 overflow-hidden rounded-xl bg-white p-0 shadow-xl"
                                  style={{ border: "1px solid #E2E8F0" }}
                                >
                                  {APPLICATION_STATUSES.map((status) => (
                                    <DropdownMenuItem
                                      key={status}
                                      disabled={statusUpdatingId === applicant.id || applicant.status === status}
                                      onSelect={() => void handleStatusUpdate(applicant, status)}
                                      className="flex w-full cursor-pointer items-center justify-between rounded-none px-3 py-2 text-left text-xs font-semibold focus:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
                                      style={{ color: applicant.status === status ? "#94A3B8" : "#0B1F4D" }}
                                    >
                                      <span>{STATUS_LABELS[status]}</span>
                                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_CONFIG[status].dot }} />
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                        {isExpanded ? (
                          <tr key={`${applicant.id}-details`} style={{ borderBottom: index < filtered.length - 1 ? "1px solid #E2E8F0" : "none" }}>
                            <td colSpan={12} className="px-5 py-5" style={{ background: "#F8FAFC" }}>
                              {detailLoading ? (
                                <div className="py-8 text-center text-sm" style={{ color: "#94A3B8" }}>Loading applicant details...</div>
                              ) : detailError ? (
                                <div className="flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626" }}>
                                  <AlertCircle size={14} /> {detailError}
                                </div>
                              ) : selectedApplicant ? (
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                                  {[
                                    ["Name", selectedApplicant.name],
                                    ["Age", selectedApplicant.age],
                                    ["Nationality", selectedApplicant.nationality],
                                    ["Experience", selectedApplicant.experience],
                                    ["Ready To Start", selectedApplicant.readyToStart],
                                    ["Expected Salary", formatExpectedSalary(selectedApplicant)],
                                    ["Status", STATUS_LABELS[selectedApplicant.status]],
                                    ["Applied", formatDate(selectedApplicant.createdAt)],
                                    ["Updated", formatDate(selectedApplicant.updatedAt)],
                                    ["Additional Notes", selectedApplicant.additionalNotes || "-"],
                                  ].map(([label, value]) => (
                                    <div key={String(label)} className={`rounded-xl bg-white p-4${label === "Additional Notes" ? " col-span-full min-w-0" : ""}`} style={{ border: "1px solid #E2E8F0" }}>
                                      <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "#94A3B8" }}>{label}</div>
                                      <div
                                        className={label === "Additional Notes" ? "mt-2 whitespace-pre-line text-sm leading-6 [overflow-wrap:anywhere]" : "mt-2 text-sm font-semibold"}
                                        style={{ color: label === "Additional Notes" ? "#334155" : "#0B1F4D" }}
                                      >
                                        {String(value || "-")}
                                      </div>
                                    </div>
                                  ))}

                                  <div className="contents" dir="ltr">
                                    <AiMatchScoreCard
                                      aiScreening={selectedApplicant.aiScreening}
                                      copy={aiCopy}
                                      locale="en"
                                      isRetrying={aiRetryingId === selectedApplicant.id}
                                      retryError={aiRetryError || aiPollingError}
                                      onRetry={() => void handleAiAction(selectedApplicant)}
                                    />
                                    <AiAssessmentCard aiScreening={selectedApplicant.aiScreening} copy={aiCopy} />
                                  </div>

                                  <div className="rounded-xl bg-white p-4 sm:col-span-2 xl:col-span-5" style={{ border: "1px solid #E2E8F0" }}>
                                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "#94A3B8" }}>CV</div>
                                    {selectedApplicant.cvFileName ? (
                                      <button
                                        type="button"
                                        onClick={() => void handleViewCv(selectedApplicant)}
                                        disabled={cvActionId === selectedApplicant.id}
                                        className="mt-3 inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                                        style={{ borderColor: "#E2E8F0", color: "#0B1F4D" }}
                                      >
                                        <FileText size={14} /> {cvActionId === selectedApplicant.id ? "Opening..." : selectedApplicant.cvFileName}
                                      </button>
                                    ) : (
                                      <div className="mt-2 text-sm" style={{ color: "#94A3B8" }}>No CV available.</div>
                                    )}
                                  </div>
                                </div>
                              ) : null}
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && totalCount > 0 ? (
            <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "#E2E8F0" }}>
              <div className="text-sm" style={{ color: "#64748B" }}>
                Page {page} of {totalPages} · {totalCount} applicant{totalCount === 1 ? "" : "s"}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ borderColor: "#E2E8F0", color: "#0B1F4D" }}
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages || isLoading}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ borderColor: "#E2E8F0", color: "#0B1F4D" }}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>

      </div>
    </AdminLayout>
  );
}
