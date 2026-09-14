import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  Calendar,
  Clock3,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import { ImageWithFallback } from "../components/shared/ImageWithFallback";
import jhcLogo from "../../imgs/logo.png";
import { getPublicJobs, splitJobSkills, type JobRecord } from "../../services/api/jobsApi";
import { getAxiosErrorMessage, isRequestCanceled } from "../../services/api/utils";

function formatDate(value: string | null) {
  if (!value) return "Open deadline";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function JobCard({ job, featured = false }: { job: JobRecord; featured?: boolean }) {
  const skills = splitJobSkills(job.skills).slice(0, featured ? 5 : 3);

  return (
    <Link
      to={`/careers/${job.slug}`}
      className={[
        "group block rounded-[24px] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]",
        featured ? "p-6 lg:p-8" : "p-5 sm:p-6",
      ].join(" ")}
      style={{ border: "1px solid #E2E8F0" }}
    >
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
              <BriefcaseBusiness size={12} /> Open role
            </span>
            {job.salaryRange ? (
              <span className="rounded-full px-3 py-1 text-[11px] font-bold" style={{ background: "#F8FAFC", color: "#64748B", border: "1px solid #E2E8F0" }}>
                {job.salaryRange}
              </span>
            ) : null}
          </div>

          <h2
            className={featured ? "text-[1.75rem] font-black leading-tight lg:text-[2.1rem]" : "text-xl font-black leading-snug"}
            style={{ color: "#0B1F4D", letterSpacing: "-0.03em" }}
          >
            {job.title}
          </h2>
          <p className={featured ? "mt-4 line-clamp-3 text-base leading-8" : "mt-3 line-clamp-2 text-sm leading-6"} style={{ color: "#64748B" }}>
            {job.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold" style={{ color: "#64748B" }}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F8FAFC] px-3 py-1.5" style={{ border: "1px solid #E2E8F0" }}>
              <MapPin size={13} style={{ color: "#1D4ED8" }} /> {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F8FAFC] px-3 py-1.5" style={{ border: "1px solid #E2E8F0" }}>
              <Clock3 size={13} style={{ color: "#1D4ED8" }} /> {job.employmentType}
            </span>
            <span className="rounded-full bg-[#F8FAFC] px-3 py-1.5" style={{ border: "1px solid #E2E8F0" }}>
              {job.experienceLevel}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F8FAFC] px-3 py-1.5" style={{ border: "1px solid #E2E8F0" }}>
              <Calendar size={13} style={{ color: "#1D4ED8" }} /> {formatDate(job.applicationDeadline)}
            </span>
          </div>

          {skills.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="rounded-lg px-2.5 py-1 text-xs font-semibold" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                  {skill}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-shrink-0 items-center justify-between gap-4 lg:flex-col lg:items-end">
          <span className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white transition-colors group-hover:bg-[#1D4ED8]" style={{ background: "#0B1F4D" }}>
            View Job
          </span>
        </div>
      </div>
    </Link>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-[24px] bg-white p-6" style={{ border: "1px solid #E2E8F0" }}>
          <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-5 h-7 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-slate-100" />
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="h-8 w-28 animate-pulse rounded-full bg-slate-100" />
            <div className="h-8 w-32 animate-pulse rounded-full bg-slate-100" />
            <div className="h-8 w-24 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CareersPage() {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const loadJobs = async () => {
      setIsLoading(true);
      setError("");
      try {
        const result = await getPublicJobs(
          { status: "Published", pageNumber: 1, pageSize: 100 },
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        setJobs(result.items);
      } catch (requestError) {
        if (isRequestCanceled(requestError) || controller.signal.aborted) return;
        setError(getAxiosErrorMessage(requestError, "Unable to load jobs right now."));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    void loadJobs();
    return () => controller.abort();
  }, []);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return jobs.filter((job) => {
      if (!query) return true;
      return (
        job.title.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.employmentType.toLowerCase().includes(query) ||
        job.experienceLevel.toLowerCase().includes(query) ||
        (job.skills?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [jobs, search]);

  const featuredJob = filteredJobs[0] ?? null;
  const remainingJobs = featuredJob ? filteredJobs.slice(1) : filteredJobs;

  return (
    <div style={{ fontFamily: "var(--font-family-app)", background: "#F8FAFC", minHeight: "100vh" }}>
      <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/">
            <ImageWithFallback src={jhcLogo} alt="JHC" className="h-8 w-auto object-contain" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors hover:border-[#0B1F4D] hover:text-[#0B1F4D]"
            style={{ borderColor: "#E2E8F0", color: "#64748B" }}
          >
            <ArrowLeft size={14} /> Home
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#0B1F4D] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-end">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-100">
                  <Sparkles size={13} /> JHC Careers
                </div>
                <h1 className="mt-6 text-[2.45rem] font-black leading-[1.06] tracking-[-0.04em] sm:text-[3.4rem] lg:text-[4rem]">
                  Open positions for ambitious operators
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
                  Explore published opportunities across JHC's human capital, operations, recruitment, and GCC execution network.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/12 bg-white/8 p-5 backdrop-blur">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-blue-100">Live roles</div>
                <div className="mt-3 text-4xl font-black text-white">{isLoading ? "..." : jobs.length}</div>
                <p className="mt-2 text-sm leading-6 text-white/64">
                  Published opportunities currently open for candidates.
                </p>
              </div>
            </div>

            <div className="mt-10 rounded-[22px] bg-white p-3 shadow-[0_24px_80px_rgba(0,0,0,0.18)] lg:max-w-3xl">
              <div className="relative">
                <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by title, location, employment type, or skill..."
                  className="h-14 w-full rounded-[16px] bg-[#F8FAFC] pl-12 pr-4 text-sm font-medium outline-none transition-colors focus:bg-white"
                  style={{ border: "1px solid #E2E8F0", color: "#0F172A" }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-black tracking-[-0.03em]" style={{ color: "#0B1F4D" }}>
                Open positions
              </h2>
              <p className="mt-1 text-sm" style={{ color: "#64748B" }}>
                {isLoading ? "Fetching published jobs..." : `${filteredJobs.length} role${filteredJobs.length === 1 ? "" : "s"} match your view`}
              </p>
            </div>
          </div>

          {error ? (
            <div className="mb-6 flex items-start gap-3 rounded-[18px] bg-white px-5 py-4 text-sm" style={{ border: "1px solid #FCA5A5", color: "#DC2626" }}>
              <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          ) : null}

          {isLoading ? (
            <LoadingState />
          ) : filteredJobs.length === 0 ? (
            <div className="rounded-[24px] bg-white px-6 py-20 text-center" style={{ border: "1px solid #E2E8F0" }}>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                <BriefcaseBusiness size={28} />
              </div>
              <h3 className="mt-5 text-lg font-black" style={{ color: "#0B1F4D" }}>
                No open jobs found
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6" style={{ color: "#64748B" }}>
                Try a different search term or clear the search field to see all published roles.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {featuredJob ? <JobCard job={featuredJob} featured /> : null}
              {remainingJobs.length > 0 ? (
                <div className="grid gap-5 xl:grid-cols-2">
                  {remainingJobs.map((job) => <JobCard key={job.id} job={job} />)}
                </div>
              ) : null}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
