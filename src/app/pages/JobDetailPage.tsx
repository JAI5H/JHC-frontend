import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, BriefcaseBusiness, Calendar, MapPin } from "lucide-react";
import { ImageWithFallback } from "../components/shared/ImageWithFallback";
import jhcLogo from "../../imgs/logo.png";
import { getPublicJobBySlug, splitJobSkills, type JobRecord } from "../../services/api/jobsApi";
import { getAxiosErrorMessage, isRequestCanceled } from "../../services/api/utils";

function formatDate(value: string | null) {
  if (!value) return "Open deadline";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function renderLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => <li key={line}>{line}</li>);
}

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [job, setJob] = useState<JobRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  const skills = splitJobSkills(job?.skills);

  return (
    <div style={{ fontFamily: "var(--font-family-app)", background: "#F8FAFC", minHeight: "100vh" }}>
      <header className="sticky top-0 z-40 bg-white" style={{ borderBottom: "1px solid #E2E8F0" }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/"><ImageWithFallback src={jhcLogo} alt="JHC" className="h-8 w-auto object-contain" /></Link>
          <Link to="/careers" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold" style={{ borderColor: "#E2E8F0", color: "#64748B" }}><ArrowLeft size={14} /> Careers</Link>
        </div>
      </header>

      {isLoading ? (
        <main className="flex min-h-[70vh] items-center justify-center text-sm" style={{ color: "#94A3B8" }}>Loading job...</main>
      ) : error || !job ? (
        <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
          <BriefcaseBusiness size={36} style={{ color: "#94A3B8" }} />
          <div>
            <h1 className="mb-2 text-2xl font-bold" style={{ color: "#0B1F4D" }}>Job not found</h1>
            <p className="text-sm" style={{ color: "#64748B" }}>{error || "This job may have been removed."}</p>
          </div>
          <Link to="/careers" className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white" style={{ background: "#0B1F4D" }}><ArrowLeft size={14} /> Back to Careers</Link>
        </main>
      ) : (
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="mb-6">
            <Link to="/careers" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "#64748B" }}><ArrowLeft size={14} /> Back to Careers</Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <article className="rounded-xl bg-white p-7 lg:p-9" style={{ border: "1px solid #E2E8F0" }}>
              <div className="inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-widest" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                <BriefcaseBusiness size={14} className="mr-2" /> Open Role
              </div>
              <h1 className="mt-5 text-4xl font-black leading-tight" style={{ color: "#0B1F4D", letterSpacing: "-0.03em" }}>{job.title}</h1>
              <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold" style={{ color: "#64748B" }}>
                <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {job.location}</span>
                <span>{job.employmentType}</span>
                <span>{job.experienceLevel}</span>
                <span className="inline-flex items-center gap-1.5"><Calendar size={14} /> {formatDate(job.applicationDeadline)}</span>
              </div>

              <section className="mt-9">
                <h2 className="text-lg font-bold" style={{ color: "#0B1F4D" }}>Description</h2>
                <p className="mt-3 whitespace-pre-line text-base leading-8" style={{ color: "#475569" }}>{job.description}</p>
              </section>

              <section className="mt-9">
                <h2 className="text-lg font-bold" style={{ color: "#0B1F4D" }}>Requirements</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-7" style={{ color: "#475569" }}>{renderLines(job.requirements)}</ul>
              </section>

              <section className="mt-9">
                <h2 className="text-lg font-bold" style={{ color: "#0B1F4D" }}>Responsibilities</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-7" style={{ color: "#475569" }}>{renderLines(job.responsibilities)}</ul>
              </section>
            </article>

            <aside className="flex flex-col gap-5">
              <div className="rounded-xl bg-white p-6" style={{ border: "1px solid #E2E8F0" }}>
                <div className="text-sm font-bold" style={{ color: "#0B1F4D" }}>Apply for this role</div>
                <p className="mt-2 text-sm leading-6" style={{ color: "#64748B" }}>Submit your profile and CV directly to JHC.</p>
                <Link to={`/careers/${job.slug}/apply`} className="mt-5 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white" style={{ background: "#0B1F4D" }}>Apply Now</Link>
              </div>

              <div className="rounded-xl bg-white p-6" style={{ border: "1px solid #E2E8F0" }}>
                <div className="text-sm font-bold" style={{ color: "#0B1F4D" }}>Role Details</div>
                <div className="mt-4 grid gap-3 text-sm" style={{ color: "#64748B" }}>
                  <div><strong style={{ color: "#0B1F4D" }}>Salary:</strong> {job.salaryRange || "Not specified"}</div>
                  <div><strong style={{ color: "#0B1F4D" }}>Deadline:</strong> {formatDate(job.applicationDeadline)}</div>
                </div>
                {skills.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {skills.map((skill) => <span key={skill} className="rounded-lg px-2.5 py-1 text-xs font-semibold" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>{skill}</span>)}
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </main>
      )}
    </div>
  );
}
