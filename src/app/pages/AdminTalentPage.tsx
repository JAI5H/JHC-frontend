import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { AdminLayout } from "../components/admin/AdminLayout";
import { hasAdminAccessToken } from "../components/admin/adminSession";
import {
  deriveCandidateStatsFromList,
  type CandidateStatus,
  downloadCandidateCv,
  exportCandidates,
  getCandidateStats,
  getCandidates,
  type CandidateRecord,
  type CandidateStats,
  updateCandidateStatus,
} from "../../services/api/candidatesApi";
import { getAxiosErrorMessage } from "../../services/api/utils";

type Status = "Shortlisted" | "Pending" | "Rejected" | "Interview" | "New" | "Reviewed" | "Hired";

type CandidateRow = {
  id: number;
  name: string;
  initials: string;
  title: string;
  exp: string;
  location: string;
  status: Status;
};

type WorkflowStats = {
  totalApplicants: number;
  newCount: number;
  underReviewCount: number;
  shortlistedCount: number;
  hiredCount: number;
  rejectedCount: number;
};

const PAGE_SIZE = 10;
const INDUSTRIES = ["Energy & Oil", "Technology", "Finance", "Healthcare", "Real Estate", "Telecom", "Government", "Education", "Consulting"];
const EXP_LEVELS = ["0–2 Years", "3–5 Years", "6–9 Years", "10+ Years"];
const LOCATIONS = ["Egypt", "Saudi Arabia", "UAE", "Qatar", "Kuwait", "Bahrain", "Oman", "Jordan"];
const STATUS_FILTER_OPTIONS = ["New", "Under Review", "Shortlisted", "Hired", "Rejected"];

const STATUS_CONFIG: Record<Status, { bg: string; text: string; dot: string; label: string }> = {
  Shortlisted: { bg: "#F0FDF4", text: "#16A34A", dot: "#16A34A", label: "Shortlisted" },
  Pending: { bg: "#FFFBEB", text: "#D97706", dot: "#D97706", label: "Under Review" },
  Rejected: { bg: "#F8FAFC", text: "#64748B", dot: "#94A3B8", label: "Rejected" },
  Interview: { bg: "#EFF6FF", text: "#1D4ED8", dot: "#1D4ED8", label: "Under Review" },
  New: { bg: "#EFF6FF", text: "#1D4ED8", dot: "#1D4ED8", label: "New" },
  Reviewed: { bg: "#F8FAFC", text: "#0B1F4D", dot: "#0B1F4D", label: "Under Review" },
  Hired: { bg: "#F0FDF4", text: "#16A34A", dot: "#16A34A", label: "Hired" },
};

const CANDIDATE_WORKFLOW_ACTIONS: CandidateStatus[] = [
  "New",
  "Reviewed",
  "Shortlisted",
  "Hired",
  "Rejected",
];

const STATUS_ACTION_LABELS: Record<CandidateStatus, string> = {
  New: "New",
  Reviewed: "Under Review",
  Shortlisted: "Shortlisted",
  Interview: "Under Review",
  Hired: "Hired",
  Rejected: "Rejected",
};

function sanitizeDownloadFilename(filename: string, fallback: string) {
  const sanitized = filename
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  return sanitized || fallback;
}

function getDownloadFilenameFromHeaders(
  contentDisposition: string | undefined,
  fallbackFilename: string,
) {
  if (!contentDisposition) {
    return fallbackFilename;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  const asciiMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  const rawFilename = utf8Match?.[1] ?? asciiMatch?.[1];

  if (!rawFilename) {
    return fallbackFilename;
  }

  try {
    return sanitizeDownloadFilename(decodeURIComponent(rawFilename), fallbackFilename);
  } catch {
    return sanitizeDownloadFilename(rawFilename, fallbackFilename);
  }
}

function normalizeStatus(value: string): Status {
  const normalized = value.trim().toLowerCase();

  if (normalized === "shortlisted") return "Shortlisted";
  if (normalized === "rejected") return "Rejected";
  if (normalized === "interview") return "Interview";
  if (normalized === "reviewed") return "Reviewed";
  if (normalized === "hired") return "Hired";
  if (normalized === "new") return "New";

  return "Pending";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function matchesExperienceLevel(candidate: CandidateRecord, selectedLevel: string) {
  if (!selectedLevel) return true;

  const years = Number(candidate.yearsOfExperience);
  if (!Number.isFinite(years)) return true;

  if (selectedLevel === "0–2 Years") return years <= 2;
  if (selectedLevel === "3–5 Years") return years >= 3 && years <= 5;
  if (selectedLevel === "6–9 Years") return years >= 6 && years <= 9;
  if (selectedLevel === "10+ Years") return years >= 10;

  return true;
}

function matchesStatusFilter(candidate: CandidateRecord, selectedStatus: string) {
  if (!selectedStatus) return true;

  const normalizedStatus = normalizeStatus(candidate.status);

  if (selectedStatus === "Under Review") {
    return normalizedStatus === "Reviewed" || normalizedStatus === "Interview" || normalizedStatus === "Pending";
  }

  return normalizedStatus === selectedStatus;
}

function candidateToRow(candidate: CandidateRecord): CandidateRow {
  return {
    id: candidate.id,
    name: candidate.fullName,
    initials: getInitials(candidate.fullName),
    title: candidate.currentJobTitle,
    exp: candidate.yearsOfExperience ? `${candidate.yearsOfExperience}+ Yrs` : "Not specified",
    location: candidate.currentCountry,
    status: normalizeStatus(candidate.status),
  };
}

function buildWorkflowStats(source: CandidateStats): WorkflowStats {
  return {
    totalApplicants: source.totalCandidates,
    newCount: source.newCandidates,
    underReviewCount: source.reviewedCandidates + source.interviewCandidates,
    shortlistedCount: source.shortlistedCandidates,
    hiredCount: source.hiredCandidates,
    rejectedCount: source.rejectedCandidates,
  };
}

function getNextStatsAfterStatusUpdate(
  currentStats: CandidateStats,
  previousStatus: CandidateStatus,
  nextStatus: CandidateStatus,
): CandidateStats {
  if (previousStatus === nextStatus) {
    return currentStats;
  }

  const nextStats = {
    ...currentStats,
  };

  const decrement = (status: CandidateStatus) => {
    if (status === "New") nextStats.newCandidates = Math.max(0, nextStats.newCandidates - 1);
    if (status === "Reviewed") nextStats.reviewedCandidates = Math.max(0, nextStats.reviewedCandidates - 1);
    if (status === "Interview") nextStats.interviewCandidates = Math.max(0, nextStats.interviewCandidates - 1);
    if (status === "Shortlisted") nextStats.shortlistedCandidates = Math.max(0, nextStats.shortlistedCandidates - 1);
    if (status === "Hired") nextStats.hiredCandidates = Math.max(0, nextStats.hiredCandidates - 1);
    if (status === "Rejected") nextStats.rejectedCandidates = Math.max(0, nextStats.rejectedCandidates - 1);
  };

  const increment = (status: CandidateStatus) => {
    if (status === "New") nextStats.newCandidates += 1;
    if (status === "Reviewed") nextStats.reviewedCandidates += 1;
    if (status === "Interview") nextStats.interviewCandidates += 1;
    if (status === "Shortlisted") nextStats.shortlistedCandidates += 1;
    if (status === "Hired") nextStats.hiredCandidates += 1;
    if (status === "Rejected") nextStats.rejectedCandidates += 1;
  };

  decrement(previousStatus);
  increment(nextStatus);

  return nextStats;
}

function StatusBadge({ status }: { status: Status }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: c.bg, color: c.text }}>
      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}

function FilterDropdown({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
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
          {options.map((option) => (
            <button
              key={option}
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
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CandidateStatusActionsMenu({
  candidate,
  open,
  onToggle,
  onClose,
  onSelect,
  updating,
}: {
  candidate: CandidateRow;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (nextStatus: CandidateStatus) => void;
  updating: boolean;
}) {
  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-[transform,background-color,border-color,color] duration-200 ease-out hover:-translate-y-px active:translate-y-0"
        style={{ borderColor: "#E2E8F0", color: "#0B1F4D", background: "#ffffff" }}
      >
        Update Status
        <ChevronDown size={12} />
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={onClose} />
          <div
            className="absolute right-0 top-full z-20 mt-2 w-[220px] overflow-hidden rounded-xl bg-white"
            style={{ border: "1px solid #E2E8F0", boxShadow: "0 12px 32px rgba(15,23,42,0.12)" }}
          >
            <div className="border-b px-3 py-2.5 text-[11px] leading-5" style={{ borderColor: "#E2E8F0", color: "#94A3B8" }}>
              Move {candidate.name} through the review workflow.
            </div>
            <div className="p-2">
              {CANDIDATE_WORKFLOW_ACTIONS.map((action) => (
                <button
                  key={action}
                  type="button"
                  disabled={updating}
                  onClick={() => onSelect(action)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors"
                  style={{ color: "#0B1F4D", background: "transparent", cursor: updating ? "not-allowed" : "pointer" }}
                  onMouseEnter={(e) => {
                    if (!updating) {
                      (e.currentTarget as HTMLElement).style.background = "#F8FAFC";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!updating) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }
                  }}
                >
                  <span>{STATUS_ACTION_LABELS[action]}</span>
                  <span style={{ color: "#94A3B8" }}>{updating ? "Saving..." : "Apply"}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function AdminTalentPage() {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [expLevel, setExpLevel] = useState("");
  const [location, setLocation] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<CandidateStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [exporting, setExporting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [statusActionMenuId, setStatusActionMenuId] = useState<number | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

  const hasFilters = Boolean(industry || expLevel || location || statusFilter || search);

  useEffect(() => {
    setPage(1);
  }, [search, industry, expLevel, location, statusFilter]);

  useEffect(() => {
    let active = true;

    if (!hasAdminAccessToken()) {
      setIsLoading(false);
      setCandidates([]);
      setStats(null);
      setTotalCount(0);
      setError("");
      setSuccess("");
      return () => {
        active = false;
      };
    }

    const loadCandidates = async () => {
      setIsLoading(true);
      setError("");
      setSuccess("");

      try {
        const [candidatesResult, statsResult] = await Promise.allSettled([
          getCandidates({
            search,
            industry,
            country: location,
            pageNumber: page,
            pageSize: PAGE_SIZE,
          }),
          getCandidateStats(),
        ]);

        if (!active) return;

        if (candidatesResult.status === "fulfilled") {
          const filteredItems = candidatesResult.value.items.filter(
            (candidate) => matchesExperienceLevel(candidate, expLevel) && matchesStatusFilter(candidate, statusFilter),
          );
          setCandidates(filteredItems);
          setTotalCount(candidatesResult.value.totalCount);

          if (statsResult.status === "fulfilled") {
            setStats(statsResult.value);
          } else {
            setStats(deriveCandidateStatsFromList(filteredItems, candidatesResult.value.totalCount));
          }

          if (statsResult.status === "rejected") {
            setError("");
          }
        } else {
          setCandidates([]);
          setTotalCount(0);
          setStats(null);
          setError("Unable to load candidate data right now.");
        }
      } catch {
        if (!active) return;
        setCandidates([]);
        setStats(null);
        setTotalCount(0);
        setError("Unable to load candidate data right now.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadCandidates();

    return () => {
      active = false;
    };
  }, [expLevel, industry, location, page, search, statusFilter]);

  const rows = useMemo(() => candidates.map(candidateToRow), [candidates]);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const visibleCountStart = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const visibleCountEnd = totalCount === 0 ? 0 : Math.min(page * PAGE_SIZE, totalCount);
  const derivedStats = useMemo(() => deriveCandidateStatsFromList(candidates, totalCount), [candidates, totalCount]);
  const workflowStats = useMemo(
    () => buildWorkflowStats(stats ?? derivedStats),
    [derivedStats, stats],
  );

  const metrics = [
    { label: "Total Applicants", value: workflowStats.totalApplicants, delta: "Live candidate total", color: "#1D4ED8" },
    { label: "New", value: workflowStats.newCount, delta: "Recently submitted", color: "#2563EB" },
    { label: "Under Review", value: workflowStats.underReviewCount, delta: "Awaiting recruiter action", color: "#D97706" },
    { label: "Shortlisted", value: workflowStats.shortlistedCount, delta: "Ready for next step", color: "#16A34A" },
    { label: "Hired", value: workflowStats.hiredCount, delta: "Successfully completed", color: "#059669" },
    { label: "Rejected", value: workflowStats.rejectedCount, delta: "Closed applications", color: "#64748B" },
  ];

  const handleExport = async () => {
    if (exporting) return;

    setExporting(true);

    try {
      const response = await exportCandidates({
        search,
        industry,
        country: location,
        pageNumber: page,
        pageSize: PAGE_SIZE,
      });

      const blob = new Blob([response.data], {
        type:
          response.headers["content-type"] ??
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = getDownloadFilenameFromHeaders(
        response.headers["content-disposition"],
        "jhc-talent-pool.xlsx",
      );
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Unable to export candidates right now.");
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadCv = async (candidateId: number) => {
    if (downloadingId) return;

    setDownloadingId(candidateId);

    try {
      const response = await downloadCandidateCv(candidateId);
      const blob = new Blob([response.data], { type: response.headers["content-type"] ?? "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = getDownloadFilenameFromHeaders(
        response.headers["content-disposition"],
        `candidate-${candidateId}-cv`,
      );
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Unable to download this CV right now.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCandidateStatusUpdate = async (candidate: CandidateRow, nextStatus: CandidateStatus) => {
    if (statusUpdatingId) return;

    const previousStatus = candidate.status === "Pending" ? "Reviewed" : candidate.status;
    setStatusUpdatingId(candidate.id);
    setError("");
    setSuccess("");

    try {
      await updateCandidateStatus(candidate.id, nextStatus);

      setCandidates((current) =>
        current.map((item) =>
            item.id === candidate.id
            ? {
                ...item,
                status: nextStatus,
              }
            : item,
        ),
      );

      setStats((currentStats) =>
        currentStats ? getNextStatsAfterStatusUpdate(currentStats, previousStatus, nextStatus) : currentStats,
      );

      try {
        const freshStats = await getCandidateStats();
        setStats(freshStats);
      } catch {
        setStats((currentStats) => currentStats ?? deriveCandidateStatsFromList(
          candidates.map((item) => (item.id === candidate.id ? { ...item, status: nextStatus } : item)),
          totalCount,
        ));
      }

      setSuccess(`${candidate.name} was moved to ${STATUS_ACTION_LABELS[nextStatus]}.`);
      setStatusActionMenuId(null);
    } catch (requestError) {
      setError(getAxiosErrorMessage(requestError, "Unable to update candidate status right now."));
    } finally {
      setStatusUpdatingId(null);
    }
  };

  return (
    <AdminLayout title="Talent Pool Management">
      <div className="flex flex-col gap-6">
        {error || success ? (
          <div
            className="flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm"
            style={{
              background: error ? "#FEF2F2" : "#F0FDF4",
              border: error ? "1px solid #FCA5A5" : "1px solid #BBF7D0",
              color: error ? "#DC2626" : "#15803D",
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            {error || success}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
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

        <div className="flex flex-col rounded-xl bg-white" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex flex-wrap items-center gap-3 border-b px-6 py-4" style={{ borderColor: "#E2E8F0" }}>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, title, or skills..."
                className="rounded-lg py-2 pl-8 pr-4 text-sm"
                style={{ border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#0F172A", outline: "none", fontFamily: "inherit", width: "260px" }}
                onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              />
              {search ? (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={12} style={{ color: "#94A3B8" }} />
                </button>
              ) : null}
            </div>
            <div className="h-5 w-px" style={{ background: "#E2E8F0" }} />
            <SlidersHorizontal size={14} style={{ color: "#64748B" }} />
            <FilterDropdown label="Industry" options={INDUSTRIES} value={industry} onChange={setIndustry} />
            <FilterDropdown label="Experience" options={EXP_LEVELS} value={expLevel} onChange={setExpLevel} />
            <FilterDropdown label="Location" options={LOCATIONS} value={location} onChange={setLocation} />
            <FilterDropdown label="Status" options={STATUS_FILTER_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
            {hasFilters ? (
              <button
                onClick={() => {
                  setIndustry("");
                  setExpLevel("");
                  setLocation("");
                  setStatusFilter("");
                  setSearch("");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
                style={{ borderColor: "#E2E8F0", color: "#64748B" }}
              >
                <X size={11} /> Clear
              </button>
            ) : null}
            <button
              onClick={() => void handleExport()}
              disabled={exporting}
              className="ml-auto inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-medium transition-[transform,background-color,border-color,color] duration-200 ease-out hover:-translate-y-px active:translate-y-0"
              style={{
                borderRadius: "16px",
                borderColor: exporting ? "#86EFAC" : "#16A34A",
                background: exporting ? "#DCFCE7" : "#16A34A",
                color: "#FFFFFF",
                cursor: exporting ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => { if (!exporting) { (e.currentTarget as HTMLElement).style.borderColor = "#15803D"; (e.currentTarget as HTMLElement).style.background = "#15803D"; } }}
              onMouseLeave={(e) => { if (!exporting) { (e.currentTarget as HTMLElement).style.borderColor = "#16A34A"; (e.currentTarget as HTMLElement).style.background = "#16A34A"; } }}
            >
              <FileDown size={13} /> {exporting ? "Exporting..." : "Export CSV"}
            </button>
            <span className="text-xs" style={{ color: "#94A3B8" }}>{totalCount} results</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                  {["Candidate Name", "Job Title", "Experience", "Location", "Status", "Actions"].map((heading) => (
                    <th key={heading} className="whitespace-nowrap px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "#94A3B8", background: "#F8FAFC", letterSpacing: "0.08em" }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm" style={{ color: "#94A3B8" }}>
                      Loading candidates...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm" style={{ color: "#94A3B8" }}>
                      No candidates match the current filters.
                    </td>
                  </tr>
                ) : (
                  rows.map((candidate, index) => (
                    <tr
                      key={candidate.id}
                      style={{ borderBottom: index < rows.length - 1 ? "1px solid #F1F5F9" : "none" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#FAFBFC")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                            {candidate.initials}
                          </div>
                          <div>
                            <div className="text-sm font-semibold" style={{ color: "#0B1F4D" }}>{candidate.name}</div>
                            <div className="text-xs" style={{ color: "#94A3B8" }}>ID #{String(candidate.id).padStart(4, "0")}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: "#0F172A" }}>{candidate.title}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-lg px-2.5 py-1 text-xs font-semibold" style={{ background: "#F1F5F9", color: "#0B1F4D" }}>
                          {candidate.exp}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: "#64748B" }}>{candidate.location}</td>
                      <td className="px-6 py-4"><StatusBadge status={candidate.status} /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => void handleDownloadCv(candidate.id)}
                            disabled={downloadingId === candidate.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-[transform,background-color,border-color,color] duration-200 ease-out hover:-translate-y-px active:translate-y-0"
                            style={{ borderColor: "#E2E8F0", color: "#0B1F4D", cursor: downloadingId === candidate.id ? "not-allowed" : "pointer" }}
                            onMouseEnter={(e) => {
                              if (downloadingId !== candidate.id) {
                                (e.currentTarget as HTMLElement).style.background = "#0B1F4D";
                                (e.currentTarget as HTMLElement).style.color = "#ffffff";
                                (e.currentTarget as HTMLElement).style.borderColor = "#0B1F4D";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (downloadingId !== candidate.id) {
                                (e.currentTarget as HTMLElement).style.background = "transparent";
                                (e.currentTarget as HTMLElement).style.color = "#0B1F4D";
                                (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0";
                              }
                            }}
                          >
                            <Download size={12} /> {downloadingId === candidate.id ? "Downloading..." : "Download CV"}
                          </button>
                          <CandidateStatusActionsMenu
                            candidate={candidate}
                            open={statusActionMenuId === candidate.id}
                            onToggle={() => setStatusActionMenuId((current) => (current === candidate.id ? null : candidate.id))}
                            onClose={() => setStatusActionMenuId(null)}
                            onSelect={(nextStatus) => void handleCandidateStatusUpdate(candidate, nextStatus)}
                            updating={statusUpdatingId === candidate.id}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t px-6 py-4" style={{ borderColor: "#E2E8F0" }}>
            <span className="text-xs" style={{ color: "#94A3B8" }}>
              Showing {visibleCountStart}–{visibleCountEnd} of {totalCount.toLocaleString("en-US")} candidates
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors"
                style={{ borderColor: "#E2E8F0", color: page === 1 ? "#CBD5E1" : "#64748B", cursor: page === 1 ? "not-allowed" : "pointer" }}
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition-[transform,background-color,border-color,color] duration-200 ease-out hover:-translate-y-px active:translate-y-0"
                    style={{ borderColor: page === pageNumber ? "#1D4ED8" : "#E2E8F0", background: page === pageNumber ? "#1D4ED8" : "transparent", color: page === pageNumber ? "#ffffff" : "#64748B" }}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              {totalPages > 3 ? <span className="px-1 text-xs" style={{ color: "#CBD5E1" }}>…</span> : null}
              {totalPages > 3 ? (
                <button
                  onClick={() => setPage(totalPages)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-colors"
                  style={{ borderColor: page === totalPages ? "#1D4ED8" : "#E2E8F0", background: page === totalPages ? "#1D4ED8" : "transparent", color: page === totalPages ? "#ffffff" : "#64748B" }}
                >
                  {totalPages}
                </button>
              ) : null}
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors"
                style={{ borderColor: "#E2E8F0", color: page === totalPages ? "#CBD5E1" : "#64748B", cursor: page === totalPages ? "not-allowed" : "pointer" }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
