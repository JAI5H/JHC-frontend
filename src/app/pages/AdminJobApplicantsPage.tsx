import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AlertCircle, ArrowLeft, Download, FileText, Search, Users, X } from "lucide-react";
import { AdminLayout } from "../components/admin/AdminLayout";
import { getAdminJobById, type JobRecord } from "../../services/api/jobsApi";
import { getJobApplications, type JobApplicationRecord } from "../../services/api/jobApplicationsApi";
import { getAxiosErrorMessage, isRequestCanceled } from "../../services/api/utils";

function formatDate(value: string | null) {
  if (!value) return "Not available";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function csvValue(value: string | number | null | undefined) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function exportCSV(applicants: JobApplicationRecord[], jobTitle: string) {
  const headers = ["Name", "Age", "Nationality", "Experience", "Ready To Start", "Expected Salary", "Additional Notes", "CV", "Applied Date"];
  const rows = applicants.map((applicant) => [
    applicant.name,
    applicant.age,
    applicant.nationality,
    applicant.experience,
    applicant.readyToStart,
    applicant.expectedSalary,
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

export default function AdminJobApplicantsPage() {
  const { id } = useParams<{ id: string }>();
  const jobId = Number(id);
  const navigate = useNavigate();
  const [job, setJob] = useState<JobRecord | null>(null);
  const [applicants, setApplicants] = useState<JobApplicationRecord[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return applicants;
    return applicants.filter((applicant) =>
      applicant.name.toLowerCase().includes(normalizedSearch) ||
      applicant.nationality.toLowerCase().includes(normalizedSearch) ||
      applicant.experience.toLowerCase().includes(normalizedSearch) ||
      applicant.readyToStart.toLowerCase().includes(normalizedSearch),
    );
  }, [applicants, search]);

  useEffect(() => {
    const controller = new AbortController();

    const loadApplicants = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [jobResult, applicationsResult] = await Promise.all([
          getAdminJobById(jobId, { signal: controller.signal }),
          getJobApplications(jobId, { pageNumber: 1, pageSize: 100 }, { signal: controller.signal }),
        ]);
        if (controller.signal.aborted) return;
        setJob(jobResult);
        setApplicants(applicationsResult.items);
      } catch (requestError) {
        if (isRequestCanceled(requestError) || controller.signal.aborted) return;
        setError(getAxiosErrorMessage(requestError, "Unable to load applicants right now."));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    if (Number.isFinite(jobId)) {
      void loadApplicants();
    } else {
      setError("Invalid job id.");
      setIsLoading(false);
    }

    return () => controller.abort();
  }, [jobId]);

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

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-black" style={{ color: "#0B1F4D", letterSpacing: "-0.02em" }}>
              {job?.title ?? "Job"} <span className="font-normal" style={{ color: "#94A3B8" }}>- Applicants</span>
            </h2>
            <p className="mt-0.5 text-sm" style={{ color: "#64748B" }}>
              {applicants.length} candidate{applicants.length === 1 ? "" : "s"} applied to this position
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {applicants.length > 0 && job ? (
              <button type="button" onClick={() => exportCSV(applicants, job.title)} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>
                <Download size={14} /> Export CSV
              </button>
            ) : null}
            <button type="button" onClick={() => navigate("/admin/jobs")} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>
              <ArrowLeft size={14} /> Back to Jobs
            </button>
          </div>
        </div>

        {applicants.length > 0 ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search applicants..." className="rounded-lg py-2 pl-9 pr-9 text-sm outline-none" style={{ border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#0F172A", width: "240px" }} />
              {search ? <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={12} style={{ color: "#94A3B8" }} /></button> : null}
            </div>
            <span className="text-xs" style={{ color: "#94A3B8" }}>{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
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
                    {["Candidate", "Age", "Nationality", "Experience", "Ready", "Expected Salary", "Notes", "CV", "Applied"].map((heading) => (
                      <th key={heading} className="whitespace-nowrap px-5 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "#94A3B8", background: "#F8FAFC" }}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((applicant, index) => (
                    <tr key={applicant.id} style={{ borderBottom: index < filtered.length - 1 ? "1px solid #F1F5F9" : "none" }}>
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
                      <td className="px-5 py-4 text-sm" style={{ color: "#64748B" }}>{applicant.expectedSalary}</td>
                      <td className="max-w-[260px] truncate px-5 py-4 text-sm" style={{ color: "#64748B" }}>{applicant.additionalNotes ?? "-"}</td>
                      <td className="px-5 py-4">
                        {applicant.cvUrl ? (
                          <a href={applicant.cvUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: "#E2E8F0", color: "#0B1F4D" }}>
                            <FileText size={12} /> {applicant.cvFileName || "Open CV"}
                          </a>
                        ) : (
                          <span className="text-xs" style={{ color: "#CBD5E1" }}>No CV URL</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm" style={{ color: "#94A3B8" }}>{formatDate(applicant.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
