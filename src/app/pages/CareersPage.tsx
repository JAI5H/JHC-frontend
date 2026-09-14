import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, BriefcaseBusiness, Calendar, MapPin, Search } from "lucide-react";
import { ImageWithFallback } from "../components/shared/ImageWithFallback";
import jhcLogo from "../../imgs/logo.png";
import { getPublicJobs, type JobRecord } from "../../services/api/jobsApi";
import { getAxiosErrorMessage, isRequestCanceled } from "../../services/api/utils";

function formatDate(value: string | null) {
  if (!value) return "Open deadline";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
        const result = await getPublicJobs({ pageNumber: 1, pageSize: 100 }, { signal: controller.signal });
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

  const filteredJobs = jobs.filter((job) => {
    const query = search.trim().toLowerCase();
    return !query || job.title.toLowerCase().includes(query) || job.location.toLowerCase().includes(query) || job.employmentType.toLowerCase().includes(query);
  });

  return (
    <div style={{ fontFamily: "var(--font-family-app)", background: "#F8FAFC", minHeight: "100vh" }}>
      <header className="sticky top-0 z-40 bg-white" style={{ borderBottom: "1px solid #E2E8F0" }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/"><ImageWithFallback src={jhcLogo} alt="JHC" className="h-8 w-auto object-contain" /></Link>
          <Link to="/" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold" style={{ borderColor: "#E2E8F0", color: "#64748B" }}><ArrowLeft size={14} /> Home</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <section className="mb-8">
          <div className="inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-widest" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
            <BriefcaseBusiness size={14} className="mr-2" /> Careers
          </div>
          <h1 className="mt-4 text-4xl font-black leading-tight" style={{ color: "#0B1F4D", letterSpacing: "-0.03em" }}>Build your next chapter with JHC</h1>
          <p className="mt-3 max-w-2xl text-base leading-7" style={{ color: "#64748B" }}>Explore published opportunities and apply directly through the JHC careers portal.</p>
        </section>

        <div className="mb-6 rounded-xl bg-white p-4" style={{ border: "1px solid #E2E8F0" }}>
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search jobs..." className="w-full rounded-lg py-2.5 pl-10 pr-3 text-sm outline-none" style={{ border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#0F172A" }} />
          </div>
        </div>

        {error ? <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626" }}>{error}</div> : null}

        {isLoading ? (
          <div className="py-16 text-center text-sm" style={{ color: "#94A3B8" }}>Loading jobs...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-xl bg-white px-6 py-16 text-center" style={{ border: "1px solid #E2E8F0" }}>
            <BriefcaseBusiness size={28} className="mx-auto mb-4" style={{ color: "#94A3B8" }} />
            <div className="font-semibold" style={{ color: "#0B1F4D" }}>No open jobs found</div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <Link key={job.id} to={`/careers/${job.slug}`} className="rounded-xl bg-white p-6 transition-transform hover:-translate-y-1" style={{ border: "1px solid #E2E8F0" }}>
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: "#0B1F4D" }}>{job.title}</h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6" style={{ color: "#64748B" }}>{job.description}</p>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold" style={{ color: "#64748B" }}>
                      <span className="inline-flex items-center gap-1.5"><MapPin size={13} /> {job.location}</span>
                      <span>{job.employmentType}</span>
                      <span>{job.experienceLevel}</span>
                      <span className="inline-flex items-center gap-1.5"><Calendar size={13} /> {formatDate(job.applicationDeadline)}</span>
                    </div>
                  </div>
                  <span className="inline-flex flex-shrink-0 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ background: "#0B1F4D" }}>View Job</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
