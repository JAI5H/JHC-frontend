import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  AlertCircle,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  Copy,
  Edit3,
  EyeOff,
  Globe,
  Lock,
  MapPin,
  Users,
  Wallet,
} from "lucide-react";
import { AdminLayout } from "../components/admin/AdminLayout";
import {
  closeJob,
  formatJobSalary,
  getAdminJobById,
  publishJob,
  splitJobSkills,
  unpublishJob,
  type JobRecord,
  type JobStatus,
} from "../../services/api/jobsApi";
import { getJobApplications } from "../../services/api/jobApplicationsApi";
import { getAxiosErrorMessage, isRequestCanceled } from "../../services/api/utils";

const STATUS_COLORS: Record<JobStatus, { bg: string; text: string; border: string }> = {
  Draft: { bg: "#F8FAFC", text: "#64748B", border: "#E2E8F0" },
  Published: { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
  Closed: { bg: "#FEF2F2", text: "#DC2626", border: "#FCA5A5" },
};

function formatDate(value: string | null) {
  if (!value) return "No deadline";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function getPublicJobUrl(slug: string) {
  const path = `/careers/${slug}`;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
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

function DetailItem({ icon, label, value, muted }: { icon: React.ReactNode; label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-xl bg-white p-4" style={{ border: "1px solid #E2E8F0" }}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5" style={{ color: "#1D4ED8" }}>{icon}</span>
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "#94A3B8" }}>{label}</div>
          <div className="mt-1 text-sm font-semibold" style={{ color: muted ? "#94A3B8" : "#0B1F4D" }}>{value || "-"}</div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl bg-white p-6" style={{ border: "1px solid #E2E8F0" }}>
      <h3 className="text-sm font-black" style={{ color: "#0B1F4D" }}>{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function AdminJobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const jobId = Number(id);
  const navigate = useNavigate();
  const [job, setJob] = useState<JobRecord | null>(null);
  const [applicantsCount, setApplicantsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const statusValue = job?.status ?? "Draft";
  const publicPath = job ? `/careers/${job.slug}` : "";
  const publicUrl = job ? getPublicJobUrl(job.slug) : "";
  const skills = useMemo(() => splitJobSkills(job?.skills), [job?.skills]);
  const responsibilities = useMemo(() => getLines(job?.responsibilities ?? ""), [job?.responsibilities]);
  const requirements = useMemo(() => getLines(job?.requirements ?? ""), [job?.requirements]);
  const salaryLabel = job ? formatJobSalary(job) : "";
  const salaryDisplay = salaryLabel || "Not disclosed";

  const loadJob = useCallback(async (signal?: AbortSignal) => {
    if (!Number.isFinite(jobId)) {
      setError("Invalid job id.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [jobResult, applicationsResult] = await Promise.all([
        getAdminJobById(jobId, { signal }),
        getJobApplications(jobId, { pageNumber: 1, pageSize: 1 }, { signal }),
      ]);
      if (signal?.aborted) return;
      setJob(jobResult);
      setApplicantsCount(applicationsResult.totalCount);
    } catch (requestError) {
      if (isRequestCanceled(requestError) || signal?.aborted) return;
      setError(getAxiosErrorMessage(requestError, "Unable to load this job right now."));
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    const controller = new AbortController();
    void loadJob(controller.signal);
    return () => controller.abort();
  }, [loadJob]);

  const updateStatus = async (nextAction: "publish" | "unpublish" | "close") => {
    if (!job) return;
    setActionLoading(true);
    setError("");
    setFeedback("");

    try {
      const updated =
        nextAction === "publish"
          ? await publishJob(job.id)
          : nextAction === "unpublish"
            ? await unpublishJob(job.id)
            : await closeJob(job.id);

      setJob(updated);
      setFeedback(`Job status updated to ${updated.status ?? "updated"}.`);
    } catch (requestError) {
      setError(getAxiosErrorMessage(requestError, "Unable to update job status right now."));
    } finally {
      setActionLoading(false);
    }
  };

  const copyPublicLink = async () => {
    if (!publicUrl) return;
    setError("");
    setFeedback("");
    try {
      await navigator.clipboard.writeText(publicUrl);
      setFeedback("Job link copied.");
    } catch {
      setError("Unable to copy job link right now.");
    }
  };

  return (
    <AdminLayout title="Job Details">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-black" style={{ color: "#0B1F4D", letterSpacing: "-0.02em" }}>Job Details</h2>
            <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Review the job post, manage status, and share the public career link.</p>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>
            <Globe size={14} /> Back to main site
          </Link>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <button type="button" onClick={() => navigate("/admin/jobs")} style={{ color: "#64748B" }}>Job Management</button>
          <span style={{ color: "#E2E8F0" }}>/</span>
          <span style={{ color: "#0B1F4D", fontWeight: 600 }}>{job?.title ?? "Job"}</span>
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

        {isLoading ? (
          <div className="rounded-xl bg-white px-6 py-16 text-center text-sm" style={{ border: "1px solid #E2E8F0", color: "#94A3B8" }}>Loading job details...</div>
        ) : !job ? (
          <div className="flex flex-col items-center justify-center gap-5 rounded-xl bg-white px-6 py-20 text-center" style={{ border: "1px solid #E2E8F0" }}>
            <AlertCircle size={28} style={{ color: "#94A3B8" }} />
            <div>
              <div className="font-semibold" style={{ color: "#0B1F4D" }}>Job not found</div>
              <p className="mt-1 text-sm" style={{ color: "#64748B" }}>This job may have been removed or the link may be invalid.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="flex min-w-0 flex-col gap-5">
              <section className="rounded-xl bg-white p-6" style={{ border: "1px solid #E2E8F0" }}>
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusPill status={statusValue} />
                      <span className="text-xs font-semibold" style={{ color: "#94A3B8" }}>{publicPath}</span>
                    </div>
                    <h1 className="mt-4 text-3xl font-black leading-tight" style={{ color: "#0B1F4D", letterSpacing: "-0.035em" }}>{job.title}</h1>
                    <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-6" style={{ color: "#64748B" }}>{job.description}</p>
                  </div>

                  <Link
                    to={`/admin/jobs/${job.id}/applicants`}
                    aria-label={`View ${applicantsCount} applicants`}
                    className="block cursor-pointer rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-center transition-[border-color,background-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:bg-[#EFF6FF] hover:shadow-[0_10px_24px_rgba(29,78,216,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D4ED8]"
                    style={{ minWidth: "150px" }}
                  >
                    <Users size={18} className="mx-auto" style={{ color: "#1D4ED8" }} />
                    <div className="mt-2 text-2xl font-black" style={{ color: "#0B1F4D" }}>{applicantsCount}</div>
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "#94A3B8" }}>Applicants</div>
                  </Link>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <DetailItem icon={<MapPin size={17} />} label="Location" value={job.location} />
                  <DetailItem icon={<BriefcaseBusiness size={17} />} label="Employment" value={job.employmentType} />
                  <DetailItem icon={<CheckCircle2 size={17} />} label="Experience" value={job.experienceLevel} />
                  <DetailItem icon={<Wallet size={17} />} label="Salary" value={salaryDisplay} muted={!salaryLabel} />
                </div>

                {skills.length > 0 ? (
                  <div className="mt-6">
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "#94A3B8" }}>Skills</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span key={skill} className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>{skill}</span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>

              <SectionCard title="About this Role">
                <p className="whitespace-pre-line text-sm leading-7" style={{ color: "#475569" }}>{job.description || "-"}</p>
              </SectionCard>

              <SectionCard title="Responsibilities">
                {responsibilities.length > 0 ? (
                  <ul className="grid gap-2">
                    {responsibilities.map((line) => (
                      <li key={line} className="flex gap-2 text-sm leading-6" style={{ color: "#475569" }}>
                        <CheckCircle2 size={15} style={{ color: "#1D4ED8", flexShrink: 0, marginTop: 4 }} />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm" style={{ color: "#94A3B8" }}>No responsibilities provided.</p>
                )}
              </SectionCard>

              <SectionCard title="Requirements">
                {requirements.length > 0 ? (
                  <ul className="grid gap-2">
                    {requirements.map((line) => (
                      <li key={line} className="flex gap-2 text-sm leading-6" style={{ color: "#475569" }}>
                        <CheckCircle2 size={15} style={{ color: "#1D4ED8", flexShrink: 0, marginTop: 4 }} />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm" style={{ color: "#94A3B8" }}>No requirements provided.</p>
                )}
              </SectionCard>
            </div>

            <aside className="flex flex-col gap-5">
              <section className="rounded-xl bg-white p-6" style={{ border: "1px solid #E2E8F0" }}>
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "#94A3B8" }}>Shareable Job Link</div>
                <div className="mt-3 break-all rounded-xl px-3 py-3 text-xs font-semibold" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#0B1F4D" }}>
                  {publicUrl}
                </div>
                <button type="button" onClick={() => void copyPublicLink()} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white" style={{ background: "#0B1F4D" }}>
                  <Copy size={14} /> Copy Link
                </button>
              </section>

              <section className="rounded-xl bg-white p-6" style={{ border: "1px solid #E2E8F0" }}>
                <div className="mb-4 text-sm font-bold" style={{ color: "#0B1F4D" }}>Actions</div>
                <div className="flex flex-col gap-3">
                  <Link to={`/admin/jobs/${job.id}/edit`} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold" style={{ borderColor: "#E2E8F0", color: "#0B1F4D" }}>
                    <Edit3 size={14} /> Edit Job
                  </Link>
                  <Link to={`/admin/jobs/${job.id}/applicants`} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold" style={{ borderColor: "#BFDBFE", color: "#1D4ED8" }}>
                    <Users size={14} /> Applicants
                  </Link>
                  {statusValue === "Published" ? (
                    <button type="button" disabled={actionLoading} onClick={() => void updateStatus("unpublish")} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60" style={{ borderColor: "#FDE68A", color: "#D97706" }}>
                      <EyeOff size={14} /> Move to Draft
                    </button>
                  ) : null}
                  {statusValue === "Draft" ? (
                    <button type="button" disabled={actionLoading} onClick={() => void updateStatus("publish")} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60" style={{ borderColor: "#BBF7D0", color: "#16A34A" }}>
                      <BriefcaseBusiness size={14} /> Publish
                    </button>
                  ) : null}
                  {statusValue !== "Closed" ? (
                    <button type="button" disabled={actionLoading} onClick={() => void updateStatus("close")} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60" style={{ borderColor: "#FCA5A5", color: "#DC2626" }}>
                      <Lock size={14} /> Close Job
                    </button>
                  ) : null}
                </div>
              </section>

              <section className="rounded-xl bg-white p-6" style={{ border: "1px solid #E2E8F0" }}>
                <div className="mb-4 text-sm font-bold" style={{ color: "#0B1F4D" }}>Role Details</div>
                <div className="grid gap-3 text-sm" style={{ color: "#64748B" }}>
                  <div className="flex items-center gap-2"><Calendar size={14} /> Deadline: {formatDate(job.applicationDeadline)}</div>
                  <div className="flex items-center gap-2"><MapPin size={14} /> {job.location || "No location"}</div>
                  <div className="flex items-center gap-2"><BriefcaseBusiness size={14} /> {job.employmentType || "No employment type"}</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={14} /> {job.experienceLevel || "No experience level"}</div>
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
