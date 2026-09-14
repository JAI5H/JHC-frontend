import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  MapPin,
  Upload,
  X,
} from "lucide-react";
import { ImageWithFallback } from "../components/shared/ImageWithFallback";
import jhcLogo from "../../imgs/logo.png";
import { getPublicJobBySlug, type JobRecord } from "../../services/api/jobsApi";
import { submitJobApplication, type ReadyToStart } from "../../services/api/jobApplicationsApi";
import { getAxiosErrorDetails, getAxiosErrorMessage, isRequestCanceled } from "../../services/api/utils";

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_CV_EXTENSIONS = [".pdf", ".doc", ".docx"];
const ALLOWED_CV_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

type FormState = {
  name: string;
  age: string;
  nationality: string;
  experience: string;
  readyToStart: ReadyToStart;
  expectedSalary: string;
  additionalNotes: string;
};

type FormErrors = Partial<Record<keyof FormState | "cv", string>>;

const inputSt: React.CSSProperties = {
  width: "100%",
  minHeight: "46px",
  padding: "11px 14px",
  borderRadius: "12px",
  border: "1px solid #E2E8F0",
  background: "#ffffff",
  fontSize: "0.92rem",
  color: "#0F172A",
  outline: "none",
  fontFamily: "var(--font-family-app)",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function isAllowedCvFile(file: File) {
  const normalizedName = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_CV_EXTENSIONS.some((extension) => normalizedName.endsWith(extension));
  const hasAllowedMimeType = file.type ? ALLOWED_CV_MIME_TYPES.includes(file.type) : true;
  return hasAllowedExtension && hasAllowedMimeType;
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em]" style={{ color: "#64748B" }}>
        {label}{required ? <span style={{ color: "#1D4ED8" }}> *</span> : null}
      </label>
      {children}
      {error ? (
        <div id={`${id}-error`} className="mt-2 flex items-start gap-1.5 text-xs leading-5" style={{ color: "#DC2626" }}>
          <AlertCircle size={12} style={{ flexShrink: 0, marginTop: 3 }} />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
}

function LoadingState() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-56 animate-pulse rounded-[28px] bg-slate-200" />
      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[24px] bg-white p-8" style={{ border: "1px solid #E2E8F0" }}>
          <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index}>
                <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-12 animate-pulse rounded-xl bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
        <div className="h-80 animate-pulse rounded-[24px] bg-slate-200" />
      </div>
    </main>
  );
}

export default function JobApplicationPage() {
  const { slug } = useParams<{ slug: string }>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [job, setJob] = useState<JobRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [pageError, setPageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [dragging, setDragging] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    age: "",
    nationality: "",
    experience: "",
    readyToStart: "Yes",
    expectedSalary: "",
    additionalNotes: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadJob = async () => {
      if (!slug) {
        setPageError("Job not found.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setPageError("");
      try {
        const result = await getPublicJobBySlug(slug, { signal: controller.signal });
        if (controller.signal.aborted) return;
        setJob(result);
      } catch (requestError) {
        if (isRequestCanceled(requestError) || controller.signal.aborted) return;
        setPageError(getAxiosErrorMessage(requestError, "Job not found."));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void loadJob();
    return () => controller.abort();
  }, [slug]);

  const clearSubmissionFeedback = () => {
    setSubmitError("");
    setValidationMessages([]);
  };

  const updateForm = (field: keyof FormState, value: string) => {
    clearSubmissionFeedback();
    setFormErrors((current) => ({ ...current, [field]: undefined }));
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleFile = (file: File | null) => {
    clearSubmissionFeedback();

    if (!file) {
      setFormErrors((current) => ({ ...current, cv: undefined }));
      setCvFile(null);
      return;
    }

    if (!isAllowedCvFile(file)) {
      setFormErrors((current) => ({ ...current, cv: "Please upload a PDF, DOC, or DOCX file." }));
      setCvFile(null);
      return;
    }

    if (file.size > MAX_CV_SIZE_BYTES) {
      setFormErrors((current) => ({ ...current, cv: "Please upload a CV file smaller than 5 MB." }));
      setCvFile(null);
      return;
    }

    if (file.size === 0) {
      setFormErrors((current) => ({ ...current, cv: "Please upload a valid non-empty CV file." }));
      setCvFile(null);
      return;
    }

    setFormErrors((current) => ({ ...current, cv: undefined }));
    setCvFile(file);
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    const ageNumber = Number(form.age);
    const salaryNumber = Number(form.expectedSalary);

    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.age.trim()) {
      nextErrors.age = "Age is required.";
    } else if (!Number.isInteger(ageNumber) || ageNumber <= 0) {
      nextErrors.age = "Enter a valid numeric age.";
    }
    if (!form.nationality.trim()) nextErrors.nationality = "Nationality is required.";
    if (!form.experience.trim()) nextErrors.experience = "Experience is required.";
    if (!form.expectedSalary.trim()) {
      nextErrors.expectedSalary = "Expected salary is required.";
    } else if (!Number.isFinite(salaryNumber) || salaryNumber < 0) {
      nextErrors.expectedSalary = "Enter a valid numeric expected salary.";
    }
    if (!cvFile) nextErrors.cv = "CV file is required.";

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!job || submitting) return;

    clearSubmissionFeedback();
    if (!validateForm() || !cvFile) return;

    setSubmitting(true);
    try {
      await submitJobApplication(job.id, {
        name: form.name.trim(),
        age: form.age,
        nationality: form.nationality.trim(),
        experience: form.experience.trim(),
        readyToStart: form.readyToStart,
        expectedSalary: form.expectedSalary.trim(),
        additionalNotes: form.additionalNotes.trim(),
        cv: cvFile,
      });
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      const details = getAxiosErrorDetails(requestError, "Something went wrong while submitting your application. Please try again.");
      setSubmitError(details.message);
      setValidationMessages(details.validationMessages);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: "var(--font-family-app)", background: "#F8FAFC", minHeight: "100vh" }}>
      <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/">
            <ImageWithFallback src={jhcLogo} alt="JHC" className="h-8 w-auto object-contain" />
          </Link>
          <Link
            to={slug ? `/careers/${slug}` : "/careers"}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors hover:border-[#0B1F4D] hover:text-[#0B1F4D]"
            style={{ borderColor: "#E2E8F0", color: "#64748B" }}
          >
            <ArrowLeft size={14} /> Job Details
          </Link>
        </div>
      </header>

      {isLoading ? (
        <LoadingState />
      ) : pageError || !job ? (
        <main className="mx-auto flex min-h-[74vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[24px]" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
            <AlertCircle size={34} />
          </div>
          <h1 className="mt-6 text-2xl font-black tracking-[-0.03em]" style={{ color: "#0B1F4D" }}>Job not found</h1>
          <p className="mt-2 text-sm leading-6" style={{ color: "#64748B" }}>{pageError || "This job may have been removed."}</p>
          <Link to="/careers" className="mt-7 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white" style={{ background: "#0B1F4D" }}>
            <ArrowLeft size={14} /> Back to Careers
          </Link>
        </main>
      ) : done ? (
        <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-[28px] bg-white p-8 text-center sm:p-10" style={{ border: "1px solid #E2E8F0" }}>
            <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-[24px]" style={{ background: "#F0FDF4", color: "#16A34A" }}>
              <CheckCircle2 size={34} />
            </div>
            <h1 className="mt-6 text-3xl font-black tracking-[-0.035em]" style={{ color: "#0B1F4D" }}>Application submitted</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7" style={{ color: "#64748B" }}>
              Thank you for applying to {job.title}. The JHC team will review your profile and CV.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/careers" className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white" style={{ background: "#0B1F4D" }}>
                Return to Careers
              </Link>
              <Link to={`/careers/${job.slug}`} className="inline-flex items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>
                Back to Job
              </Link>
            </div>
          </div>
        </main>
      ) : (
        <main>
          <section className="relative overflow-hidden bg-[#0B1F4D] px-4 py-12 text-white sm:px-6 lg:px-8">
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
              <Link to={`/careers/${job.slug}`} className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-blue-100">
                <ArrowLeft size={13} /> Back to job
              </Link>
              <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-100 ring-1 ring-white/12">
                    <BriefcaseBusiness size={13} /> Job Application
                  </div>
                  <h1 className="mt-6 max-w-4xl text-[2.25rem] font-black leading-[1.07] tracking-[-0.04em] text-white sm:text-[3.2rem]">
                    Apply for {job.title}
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">
                    Complete the short application below. Your profile and CV will be sent directly to JHC for review.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/12 bg-white/8 p-5 backdrop-blur">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-blue-100">Role context</div>
                  <div className="mt-3 text-lg font-black text-white">{job.title}</div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-white/70">
                    <MapPin size={14} style={{ color: "#60A5FA" }} />
                    {job.location}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit} className="grid gap-7 lg:grid-cols-[1fr_340px]" noValidate>
              <div className="space-y-6">
                <div className="rounded-[24px] bg-white p-6 sm:p-8" style={{ border: "1px solid #E2E8F0" }}>
                  <div className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "#1D4ED8" }}>Step 1</div>
                  <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]" style={{ color: "#0B1F4D" }}>Personal information</h2>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <Field id="name" label="Name" required error={formErrors.name}>
                      <input id="name" value={form.name} onChange={(event) => updateForm("name", event.target.value)} required aria-invalid={Boolean(formErrors.name)} aria-describedby={formErrors.name ? "name-error" : undefined} style={inputSt} />
                    </Field>
                    <Field id="age" label="Age" required error={formErrors.age}>
                      <input id="age" type="number" min={1} inputMode="numeric" value={form.age} onChange={(event) => updateForm("age", event.target.value)} required aria-invalid={Boolean(formErrors.age)} aria-describedby={formErrors.age ? "age-error" : undefined} style={inputSt} />
                    </Field>
                    <Field id="nationality" label="Nationality" required error={formErrors.nationality}>
                      <input id="nationality" value={form.nationality} onChange={(event) => updateForm("nationality", event.target.value)} required aria-invalid={Boolean(formErrors.nationality)} aria-describedby={formErrors.nationality ? "nationality-error" : undefined} style={inputSt} />
                    </Field>
                  </div>
                </div>

                <div className="rounded-[24px] bg-white p-6 sm:p-8" style={{ border: "1px solid #E2E8F0" }}>
                  <div className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "#1D4ED8" }}>Step 2</div>
                  <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]" style={{ color: "#0B1F4D" }}>Professional information</h2>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <Field id="experience" label="Experience" required error={formErrors.experience}>
                      <input id="experience" value={form.experience} onChange={(event) => updateForm("experience", event.target.value)} placeholder="e.g. 5 years" required aria-invalid={Boolean(formErrors.experience)} aria-describedby={formErrors.experience ? "experience-error" : undefined} style={inputSt} />
                    </Field>
                    <Field id="readyToStart" label="Ready To Start" required>
                      <select id="readyToStart" value={form.readyToStart} onChange={(event) => updateForm("readyToStart", event.target.value)} required style={{ ...inputSt, cursor: "pointer" }}>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="Other">Other</option>
                      </select>
                    </Field>
                    <Field id="expectedSalary" label="Expected Salary" required error={formErrors.expectedSalary}>
                      <input id="expectedSalary" type="number" min={0} inputMode="decimal" value={form.expectedSalary} onChange={(event) => updateForm("expectedSalary", event.target.value)} placeholder="Enter amount only" required aria-invalid={Boolean(formErrors.expectedSalary)} aria-describedby={formErrors.expectedSalary ? "expectedSalary-error" : undefined} style={inputSt} />
                    </Field>
                  </div>
                </div>

                <div className="rounded-[24px] bg-white p-6 sm:p-8" style={{ border: "1px solid #E2E8F0" }}>
                  <div className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "#1D4ED8" }}>Step 3</div>
                  <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]" style={{ color: "#0B1F4D" }}>Additional information</h2>
                  <div className="mt-6">
                    <Field id="additionalNotes" label="Additional Notes">
                      <textarea id="additionalNotes" value={form.additionalNotes} onChange={(event) => updateForm("additionalNotes", event.target.value)} rows={6} style={{ ...inputSt, resize: "vertical", lineHeight: 1.7 }} />
                    </Field>
                  </div>
                </div>
              </div>

              <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-[24px] bg-white p-6" style={{ border: "1px solid #E2E8F0" }}>
                  <div className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "#1D4ED8" }}>CV Upload</div>
                  <h2 className="mt-2 text-xl font-black tracking-[-0.025em]" style={{ color: "#0B1F4D" }}>Attach your CV</h2>
                  <p className="mt-2 text-sm leading-6" style={{ color: "#64748B" }}>PDF, DOC, or DOCX. Maximum file size is 5 MB.</p>

                  <input
                    ref={fileInputRef}
                    id="job-cv-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragging(false);
                      handleFile(event.dataTransfer.files?.[0] ?? null);
                    }}
                    className="mt-5 flex w-full flex-col items-center justify-center gap-3 rounded-[18px] px-4 py-8 text-center transition-colors"
                    style={{ border: `2px dashed ${dragging ? "#1D4ED8" : "#E2E8F0"}`, background: dragging ? "#EFF6FF" : "#F8FAFC" }}
                    aria-describedby={formErrors.cv ? "cv-error" : undefined}
                  >
                    <Upload size={24} style={{ color: dragging ? "#1D4ED8" : "#94A3B8" }} />
                    <span className="text-sm font-bold" style={{ color: dragging ? "#1D4ED8" : "#64748B" }}>
                      {cvFile ? cvFile.name : "Click or drag your CV here"}
                    </span>
                    {cvFile ? <span className="text-xs" style={{ color: "#94A3B8" }}>{formatFileSize(cvFile.size)}</span> : null}
                  </button>

                  {cvFile ? (
                    <button type="button" onClick={() => handleFile(null)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>
                      <X size={12} /> Remove file
                    </button>
                  ) : null}
                  {formErrors.cv ? (
                    <div id="cv-error" className="mt-3 flex items-start gap-1.5 text-xs leading-5" style={{ color: "#DC2626" }}>
                      <FileText size={12} style={{ flexShrink: 0, marginTop: 3 }} />
                      <span>{formErrors.cv}</span>
                    </div>
                  ) : null}
                </div>

                {(submitError || validationMessages.length > 0) ? (
                  <div className="rounded-[18px] px-4 py-3 text-sm" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626" }}>
                    {submitError}
                    {validationMessages.length > 0 ? (
                      <ul className="mt-2 list-disc pl-5">
                        {validationMessages.map((message) => <li key={message}>{message}</li>)}
                      </ul>
                    ) : null}
                  </div>
                ) : null}

                <div className="rounded-[24px] bg-[#0B1F4D] p-6 text-white">
                  <div className="text-sm font-black">Submit application</div>
                  <p className="mt-2 text-sm leading-6 text-white/68">Your application will be sent to JHC using the real job ID for this role.</p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#1D4ED8] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:bg-[#94A3B8]"
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </aside>
            </form>
          </section>
        </main>
      )}
    </div>
  );
}
