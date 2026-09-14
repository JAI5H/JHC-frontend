import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { AlertCircle, ArrowLeft, CheckCircle2, FileText, Upload, X } from "lucide-react";
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

const inputSt: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: "10px",
  border: "1px solid #E2E8F0",
  background: "#ffffff",
  fontSize: "0.9rem",
  color: "#0F172A",
  outline: "none",
  fontFamily: "var(--font-family-app)",
};

function isAllowedCvFile(file: File) {
  const normalizedName = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_CV_EXTENSIONS.some((extension) => normalizedName.endsWith(extension));
  const hasAllowedMimeType = ALLOWED_CV_MIME_TYPES.includes(file.type);
  return hasAllowedExtension && hasAllowedMimeType;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.07em]" style={{ color: "#64748B" }}>
        {label}{required ? <span style={{ color: "#1D4ED8" }}> *</span> : null}
      </label>
      {children}
    </div>
  );
}

export default function JobApplicationPage() {
  const { slug } = useParams<{ slug: string }>();
  const [job, setJob] = useState<JobRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [pageError, setPageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [fileError, setFileError] = useState("");
  const [form, setForm] = useState({
    name: "",
    age: "",
    nationality: "",
    experience: "",
    readyToStart: "Yes" as ReadyToStart,
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

  const updateForm = (field: keyof typeof form, value: string) => {
    setSubmitError("");
    setValidationMessages([]);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleFile = (file: File | null) => {
    setSubmitError("");
    setValidationMessages([]);

    if (!file) {
      setFileError("");
      setCvFile(null);
      return;
    }

    if (!isAllowedCvFile(file)) {
      setFileError("Please upload a PDF, DOC, or DOCX file.");
      setCvFile(null);
      return;
    }

    if (file.size > MAX_CV_SIZE_BYTES) {
      setFileError("Please upload a CV file smaller than 5 MB.");
      setCvFile(null);
      return;
    }

    if (file.size === 0) {
      setFileError("Please upload a valid non-empty CV file.");
      setCvFile(null);
      return;
    }

    setFileError("");
    setCvFile(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!job || !cvFile || submitting) return;

    setSubmitError("");
    setValidationMessages([]);

    if (!form.name.trim() || !form.age || !form.nationality.trim() || !form.experience.trim() || !form.expectedSalary.trim()) {
      setSubmitError("Please complete all required fields.");
      return;
    }

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
      <header className="sticky top-0 z-40 bg-white" style={{ borderBottom: "1px solid #E2E8F0" }}>
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/"><ImageWithFallback src={jhcLogo} alt="JHC" className="h-8 w-auto object-contain" /></Link>
          <Link to={slug ? `/careers/${slug}` : "/careers"} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold" style={{ borderColor: "#E2E8F0", color: "#64748B" }}><ArrowLeft size={14} /> Job Details</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {isLoading ? (
          <div className="rounded-xl bg-white px-6 py-16 text-center text-sm" style={{ border: "1px solid #E2E8F0", color: "#94A3B8" }}>Loading job...</div>
        ) : pageError || !job ? (
          <div className="rounded-xl bg-white px-6 py-16 text-center" style={{ border: "1px solid #E2E8F0" }}>
            <AlertCircle size={28} className="mx-auto mb-4" style={{ color: "#DC2626" }} />
            <div className="font-semibold" style={{ color: "#0B1F4D" }}>Job not found</div>
            <p className="mt-1 text-sm" style={{ color: "#64748B" }}>{pageError || "This job may have been removed."}</p>
          </div>
        ) : done ? (
          <div className="rounded-2xl bg-white p-8 text-center" style={{ border: "1px solid #E2E8F0" }}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "#F0FDF4", color: "#16A34A" }}><CheckCircle2 size={30} /></div>
            <h1 className="mt-5 text-2xl font-black" style={{ color: "#0B1F4D" }}>Application submitted</h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6" style={{ color: "#64748B" }}>Thank you for applying to {job.title}. The JHC team will review your profile and CV.</p>
            <Link to="/careers" className="mt-6 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white" style={{ background: "#0B1F4D" }}>Back to Careers</Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#1D4ED8" }}>Job Application</span>
              <h1 className="mt-2 text-3xl font-black" style={{ color: "#0B1F4D", letterSpacing: "-0.03em" }}>{job.title}</h1>
              <p className="mt-2 text-sm" style={{ color: "#64748B" }}>{job.location}</p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-7 lg:p-9" style={{ border: "1px solid #E2E8F0" }}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" required><input value={form.name} onChange={(event) => updateForm("name", event.target.value)} style={inputSt} /></Field>
                <Field label="Age" required><input type="number" min={16} value={form.age} onChange={(event) => updateForm("age", event.target.value)} style={inputSt} /></Field>
                <Field label="Nationality" required><input value={form.nationality} onChange={(event) => updateForm("nationality", event.target.value)} style={inputSt} /></Field>
                <Field label="Experience" required><input value={form.experience} onChange={(event) => updateForm("experience", event.target.value)} placeholder="e.g. 5 years" style={inputSt} /></Field>
                <Field label="Ready To Start" required>
                  <select value={form.readyToStart} onChange={(event) => updateForm("readyToStart", event.target.value)} style={{ ...inputSt, cursor: "pointer" }}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
                <Field label="Expected Salary" required><input value={form.expectedSalary} onChange={(event) => updateForm("expectedSalary", event.target.value)} placeholder="e.g. SAR 18,000" style={inputSt} /></Field>
              </div>

              <div className="mt-5">
                <Field label="Additional Notes">
                  <textarea value={form.additionalNotes} onChange={(event) => updateForm("additionalNotes", event.target.value)} rows={5} style={{ ...inputSt, resize: "vertical", lineHeight: 1.7 }} />
                </Field>
              </div>

              <div className="mt-5">
                <Field label="CV" required>
                  <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" id="job-cv-upload" onChange={(event) => handleFile(event.target.files?.[0] ?? null)} />
                  <label htmlFor="job-cv-upload" className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl px-4 py-8 text-center" style={{ border: "2px dashed #E2E8F0", background: "#F8FAFC" }}>
                    <Upload size={22} style={{ color: "#94A3B8" }} />
                    <span className="text-sm font-semibold" style={{ color: "#64748B" }}>{cvFile ? cvFile.name : "Upload PDF, DOC, or DOCX"}</span>
                  </label>
                  {cvFile ? (
                    <button type="button" onClick={() => handleFile(null)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>
                      <X size={12} /> Remove file
                    </button>
                  ) : null}
                  {fileError ? <div className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: "#DC2626" }}><FileText size={12} /> {fileError}</div> : null}
                </Field>
              </div>

              {submitError ? (
                <div className="mt-6 rounded-xl px-4 py-3 text-sm" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626" }}>
                  {submitError}
                  {validationMessages.length > 0 ? (
                    <ul className="mt-2 list-disc pl-5">{validationMessages.map((message) => <li key={message}>{message}</li>)}</ul>
                  ) : null}
                </div>
              ) : null}

              <button type="submit" disabled={submitting || !cvFile} className="mt-7 inline-flex w-full items-center justify-center rounded-xl px-5 py-3.5 text-sm font-semibold text-white" style={{ background: submitting || !cvFile ? "#94A3B8" : "#0B1F4D", cursor: submitting || !cvFile ? "not-allowed" : "pointer" }}>
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
