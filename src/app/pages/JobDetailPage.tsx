import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  Clock3,
  MapPin,
  Wallet,
} from "lucide-react";
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

function getLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function DetailPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white/8 px-3.5 py-2 text-sm font-semibold text-white/82 ring-1 ring-white/12">
      <span style={{ color: "#60A5FA" }}>{icon}</span>
      {label}
    </span>
  );
}

function SectionCard({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] bg-white p-6 sm:p-8" style={{ border: "1px solid #E2E8F0" }}>
      <div className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "#1D4ED8" }}>{eyebrow}</div>
      <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]" style={{ color: "#0B1F4D" }}>{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function LoadingState() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-[420px] animate-pulse rounded-[30px] bg-slate-200" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-[24px] bg-white p-8" style={{ border: "1px solid #E2E8F0" }}>
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-7 w-1/2 animate-pulse rounded bg-slate-200" />
              <div className="mt-6 space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-[24px] bg-slate-200" />
      </div>
    </main>
  );
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

  const requirements = useMemo(() => getLines(job?.requirements ?? ""), [job?.requirements]);
  const responsibilities = useMemo(() => getLines(job?.responsibilities ?? ""), [job?.responsibilities]);
  const skills = useMemo(() => splitJobSkills(job?.skills), [job?.skills]);

  return (
    <div style={{ fontFamily: "var(--font-family-app)", background: "#F8FAFC", minHeight: "100vh" }}>
      <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/">
            <ImageWithFallback src={jhcLogo} alt="JHC" className="h-8 w-auto object-contain" />
          </Link>
          <Link
            to="/careers"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors hover:border-[#0B1F4D] hover:text-[#0B1F4D]"
            style={{ borderColor: "#E2E8F0", color: "#64748B" }}
          >
            <ArrowLeft size={14} /> Careers
          </Link>
        </div>
      </header>

      {isLoading ? (
        <LoadingState />
      ) : error || !job ? (
        <main className="mx-auto flex min-h-[74vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[24px]" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
            <AlertCircle size={34} />
          </div>
          <h1 className="mt-6 text-2xl font-black tracking-[-0.03em]" style={{ color: "#0B1F4D" }}>Job not found</h1>
          <p className="mt-2 text-sm leading-6" style={{ color: "#64748B" }}>{error || "This role may have been closed or removed."}</p>
          <Link to="/careers" className="mt-7 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white" style={{ background: "#0B1F4D" }}>
            <ArrowLeft size={14} /> Back to Careers
          </Link>
        </main>
      ) : (
        <main>
          <section className="relative overflow-hidden bg-[#0B1F4D] px-4 py-12 text-white sm:px-6 lg:px-8 lg:py-16">
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
              <Link to="/careers" className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-blue-100">
                <ArrowLeft size={13} /> Open positions
              </Link>

              <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-100 ring-1 ring-white/12">
                    <BriefcaseBusiness size={13} /> Published role
                  </div>
                  <h1 className="mt-6 max-w-5xl text-[2.35rem] font-black leading-[1.06] tracking-[-0.045em] text-white sm:text-[3.35rem] lg:text-[4rem]">
                    {job.title}
                  </h1>
                  <p className="mt-5 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">
                    {job.description}
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <DetailPill icon={<MapPin size={14} />} label={job.location} />
                    <DetailPill icon={<Clock3 size={14} />} label={job.employmentType} />
                    <DetailPill icon={<BriefcaseBusiness size={14} />} label={job.experienceLevel} />
                    <DetailPill icon={<Calendar size={14} />} label={formatDate(job.applicationDeadline)} />
                  </div>
                </div>

                <div className="rounded-[26px] bg-white p-5 shadow-[0_28px_90px_rgba(0,0,0,0.24)]">
                  <div className="rounded-[20px] p-5" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    <div className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "#1D4ED8" }}>Ready to apply?</div>
                    <p className="mt-3 text-sm leading-6" style={{ color: "#64748B" }}>
                      Submit your profile and CV for this role through the dedicated application flow.
                    </p>
                    <Link
                      to={`/careers/${job.slug}/apply`}
                      className="mt-5 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1D4ED8]"
                      style={{ background: "#0B1F4D" }}
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="grid gap-7 lg:grid-cols-[1fr_340px]">
              <div className="space-y-6">
                {job.description ? (
                  <SectionCard eyebrow="Overview" title="Role Description">
                    <p className="whitespace-pre-line text-[1.02rem] leading-8" style={{ color: "#475569" }}>
                      {job.description}
                    </p>
                  </SectionCard>
                ) : null}

                {responsibilities.length > 0 ? (
                  <SectionCard eyebrow="Scope" title="Responsibilities">
                    <ul className="grid gap-3">
                      {responsibilities.map((line) => (
                        <li key={line} className="flex gap-3 text-[1rem] leading-7" style={{ color: "#475569" }}>
                          <CheckCircle2 size={17} style={{ color: "#1D4ED8", flexShrink: 0, marginTop: 5 }} />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </SectionCard>
                ) : null}

                {requirements.length > 0 ? (
                  <SectionCard eyebrow="Fit" title="Requirements">
                    <ul className="grid gap-3">
                      {requirements.map((line) => (
                        <li key={line} className="flex gap-3 text-[1rem] leading-7" style={{ color: "#475569" }}>
                          <CheckCircle2 size={17} style={{ color: "#1D4ED8", flexShrink: 0, marginTop: 5 }} />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </SectionCard>
                ) : null}

                {skills.length > 0 ? (
                  <SectionCard eyebrow="Capabilities" title="Skills">
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span key={skill} className="rounded-xl px-3 py-2 text-sm font-semibold" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </SectionCard>
                ) : null}
              </div>

              <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-[24px] bg-white p-6" style={{ border: "1px solid #E2E8F0" }}>
                  <div className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "#94A3B8" }}>Role Details</div>
                  <div className="mt-5 grid gap-4">
                    <div className="flex items-start gap-3">
                      <MapPin size={18} style={{ color: "#1D4ED8", flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: "#94A3B8" }}>Location</div>
                        <div className="mt-1 text-sm font-semibold" style={{ color: "#0B1F4D" }}>{job.location}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BriefcaseBusiness size={18} style={{ color: "#1D4ED8", flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: "#94A3B8" }}>Employment</div>
                        <div className="mt-1 text-sm font-semibold" style={{ color: "#0B1F4D" }}>{job.employmentType}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock3 size={18} style={{ color: "#1D4ED8", flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: "#94A3B8" }}>Experience</div>
                        <div className="mt-1 text-sm font-semibold" style={{ color: "#0B1F4D" }}>{job.experienceLevel}</div>
                      </div>
                    </div>
                    {job.salaryRange ? (
                      <div className="flex items-start gap-3">
                        <Wallet size={18} style={{ color: "#1D4ED8", flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <div className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: "#94A3B8" }}>Salary</div>
                          <div className="mt-1 text-sm font-semibold" style={{ color: "#0B1F4D" }}>{job.salaryRange}</div>
                        </div>
                      </div>
                    ) : null}
                    <div className="flex items-start gap-3">
                      <Calendar size={18} style={{ color: "#1D4ED8", flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: "#94A3B8" }}>Deadline</div>
                        <div className="mt-1 text-sm font-semibold" style={{ color: "#0B1F4D" }}>{formatDate(job.applicationDeadline)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] bg-[#0B1F4D] p-6 text-white">
                  <div className="text-sm font-black">Apply for this role</div>
                  <p className="mt-2 text-sm leading-6 text-white/68">Your application will be submitted directly to JHC for review.</p>
                  <Link
                    to={`/careers/${job.slug}/apply`}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#1D4ED8] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#2563EB]"
                  >
                    Apply Now
                  </Link>
                </div>
              </aside>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
