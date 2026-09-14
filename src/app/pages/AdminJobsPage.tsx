import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { AlertCircle, BriefcaseBusiness, Edit3, EyeOff, Lock, Plus, Search, Trash2, Users } from "lucide-react";
import { AdminLayout } from "../components/admin/AdminLayout";
import { hasAdminAccessToken } from "../components/admin/adminSession";
import {
  closeJob,
  deleteJob,
  getAdminJobs,
  publishJob,
  unpublishJob,
  type JobRecord,
  type JobStatus,
} from "../../services/api/jobsApi";
import { getAxiosErrorMessage, isRequestCanceled } from "../../services/api/utils";

const STATUS_COLORS: Record<JobStatus, { bg: string; text: string; border: string }> = {
  Draft: { bg: "#F8FAFC", text: "#64748B", border: "#E2E8F0" },
  Published: { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
  Closed: { bg: "#FEF2F2", text: "#DC2626", border: "#FCA5A5" },
};
const PAGE_SIZE = 10;

function formatDate(value: string | null) {
  if (!value) return "No deadline";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusPill({ status }: { status: JobStatus }) {
  const color = STATUS_COLORS[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color.text }} />
      {status}
    </span>
  );
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<JobStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [actionId, setActionId] = useState<number | null>(null);

  const counts = {
    all: totalCount,
    published: jobs.filter((job) => job.status === "Published").length,
    draft: jobs.filter((job) => job.status === "Draft").length,
    closed: jobs.filter((job) => job.status === "Closed").length,
  };
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const loadJobs = useCallback(async (signal?: AbortSignal, pageOverride?: number) => {
    if (!hasAdminAccessToken()) {
      setJobs([]);
      setTotalCount(0);
      setIsLoading(false);
      return;
    }

    const requestedPage = pageOverride ?? page;
    setIsLoading(true);
    setError("");
    setJobs([]);

    try {
      const result = await getAdminJobs(
        {
          search: search.trim() || undefined,
          status: status === "all" ? undefined : status,
          pageNumber: requestedPage,
          pageSize: PAGE_SIZE,
        },
        { signal },
      );
      if (signal?.aborted) return;
      setJobs(result.items);
      setTotalCount(result.totalCount);
    } catch (requestError) {
      if (isRequestCanceled(requestError) || signal?.aborted) return;
      setError(getAxiosErrorMessage(requestError, "Unable to load jobs right now."));
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [page, search, status]);

  useEffect(() => {
    const controller = new AbortController();
    void loadJobs(controller.signal);
    return () => controller.abort();
  }, [loadJobs]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleStatusChange = (nextStatus: JobStatus | "all") => {
    setStatus(nextStatus);
    setPage(1);
  };

  const refreshAfterMutation = async (wasLastItemOnPage = false) => {
    if (wasLastItemOnPage && page > 1) {
      setPage((current) => Math.max(1, current - 1));
      return;
    }

    await loadJobs(undefined);
  };

  const updateJobStatus = async (job: JobRecord, nextAction: "publish" | "unpublish" | "close") => {
    setActionId(job.id);
    setError("");
    setFeedback("");
    try {
      const updated =
        nextAction === "publish"
          ? await publishJob(job.id)
          : nextAction === "unpublish"
            ? await unpublishJob(job.id)
            : await closeJob(job.id);

      await refreshAfterMutation(status !== "all" && jobs.length === 1);
      setFeedback(`Job status updated to ${updated.status ?? "updated"}.`);
    } catch (requestError) {
      setError(getAxiosErrorMessage(requestError, "Unable to update job status right now."));
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (job: JobRecord) => {
    if (!window.confirm(`Delete "${job.title}"?`)) return;
    setActionId(job.id);
    setError("");
    setFeedback("");
    try {
      await deleteJob(job.id);
      await refreshAfterMutation(jobs.length === 1);
      setFeedback("Job deleted successfully.");
    } catch (requestError) {
      setError(getAxiosErrorMessage(requestError, "Unable to delete job right now."));
    } finally {
      setActionId(null);
    }
  };

  return (
    <AdminLayout title="Jobs">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-black" style={{ color: "#0B1F4D", letterSpacing: "-0.02em" }}>Job Management</h2>
            <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Create jobs, publish career links, and review applicants.</p>
          </div>
          <Link
            to="/admin/jobs/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white"
            style={{ background: "#0B1F4D" }}
          >
            <Plus size={15} /> New Job
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: status === "all" ? "Total Jobs" : "Matching Jobs", value: counts.all, color: "#0B1F4D" },
            { label: "Published on Page", value: counts.published, color: "#16A34A" },
            { label: "Drafts on Page", value: counts.draft, color: "#D97706" },
            { label: "Closed on Page", value: counts.closed, color: "#DC2626" },
          ].map((metric) => (
            <div key={metric.label} className="rounded-xl bg-white p-5" style={{ border: "1px solid #E2E8F0" }}>
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#94A3B8" }}>{metric.label}</div>
              <div className="mt-3 text-3xl font-black" style={{ color: metric.color }}>{isLoading ? "..." : metric.value}</div>
            </div>
          ))}
        </div>

        {(error || feedback) ? (
          <div
            className="flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm"
            style={{
              background: error ? "#FEF2F2" : "#F0FDF4",
              border: error ? "1px solid #FCA5A5" : "1px solid #BBF7D0",
              color: error ? "#DC2626" : "#15803D",
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            {error || feedback}
          </div>
        ) : null}

        <div className="rounded-xl bg-white" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex flex-col gap-3 border-b px-5 py-4 md:flex-row md:items-center" style={{ borderColor: "#E2E8F0" }}>
            <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search jobs..."
                  className="w-full rounded-lg py-2 pl-9 pr-3 text-sm outline-none"
                  style={{ border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#0F172A" }}
                />
              </div>
              <button
                type="submit"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                style={{ background: "#0B1F4D" }}
              >
                Search
              </button>
            </form>
            <select
              value={status}
              onChange={(event) => handleStatusChange(event.target.value as JobStatus | "all")}
              className="rounded-lg px-3 py-2 text-sm outline-none"
              style={{ border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#0F172A" }}
            >
              <option value="all">All statuses</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {isLoading ? (
            <div className="px-6 py-16 text-center text-sm" style={{ color: "#94A3B8" }}>Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
              <BriefcaseBusiness size={28} style={{ color: "#94A3B8" }} />
              <div>
                <div className="font-semibold" style={{ color: "#0B1F4D" }}>No jobs found</div>
                <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Create your first job posting or adjust the current filters.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                    {["Job", "Location", "Status", "Deadline", "Actions"].map((heading) => (
                      <th key={heading} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ background: "#F8FAFC", color: "#94A3B8" }}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, index) => {
                    const disabled = actionId === job.id;
                    const statusValue = job.status ?? "Draft";
                    return (
                      <tr key={job.id} style={{ borderBottom: index < jobs.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                        <td className="max-w-[420px] px-5 py-4">
                          <div className="font-semibold" style={{ color: "#0B1F4D" }}>{job.title}</div>
                          <div className="mt-1 truncate text-xs" style={{ color: "#64748B" }}>{job.employmentType} · {job.experienceLevel}</div>
                          <div className="mt-1 text-xs" style={{ color: "#94A3B8" }}>/careers/{job.slug}</div>
                        </td>
                        <td className="px-5 py-4 text-sm" style={{ color: "#64748B" }}>{job.location}</td>
                        <td className="px-5 py-4"><StatusPill status={statusValue} /></td>
                        <td className="px-5 py-4 text-sm" style={{ color: "#64748B" }}>{formatDate(job.applicationDeadline)}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Link to={`/admin/jobs/${job.id}/edit`} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: "#E2E8F0", color: "#0B1F4D" }}>
                              <Edit3 size={12} /> Edit
                            </Link>
                            <Link to={`/admin/jobs/${job.id}/applicants`} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: "#BFDBFE", color: "#1D4ED8" }}>
                              <Users size={12} /> Applicants
                            </Link>
                            {statusValue !== "Published" && statusValue !== "Closed" ? (
                              <button disabled={disabled} onClick={() => void updateJobStatus(job, "publish")} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: "#BBF7D0", color: "#16A34A" }}>
                                <BriefcaseBusiness size={12} /> Publish
                              </button>
                            ) : null}
                            {statusValue === "Published" ? (
                              <button disabled={disabled} onClick={() => void updateJobStatus(job, "unpublish")} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: "#FDE68A", color: "#D97706" }}>
                                <EyeOff size={12} /> Draft
                              </button>
                            ) : null}
                            {statusValue !== "Closed" ? (
                              <button disabled={disabled} onClick={() => void updateJobStatus(job, "close")} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: "#FCA5A5", color: "#DC2626" }}>
                                <Lock size={12} /> Close
                              </button>
                            ) : null}
                            <button disabled={disabled} onClick={() => void handleDelete(job)} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: "#FCA5A5", color: "#DC2626" }}>
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && totalCount > 0 ? (
            <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "#E2E8F0" }}>
              <div className="text-sm" style={{ color: "#64748B" }}>
                Page {page} of {totalPages} · {totalCount} job{totalCount === 1 ? "" : "s"}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || isLoading || actionId !== null}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ borderColor: "#E2E8F0", color: "#0B1F4D" }}
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages || isLoading || actionId !== null}
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
