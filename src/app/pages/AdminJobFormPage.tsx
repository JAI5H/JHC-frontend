import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AlertCircle, ArrowLeft, CheckCircle2, ChevronDown, EyeOff, Globe, Lock, Plus, Save, X } from "lucide-react";
import { AdminLayout } from "../components/admin/AdminLayout";
import {
  closeJob,
  createJob,
  getAdminJobById,
  publishJob,
  splitJobSkills,
  unpublishJob,
  updateJob,
  type JobRecord,
  type JobStatus,
} from "../../services/api/jobsApi";
import { getAxiosErrorMessage, isRequestCanceled } from "../../services/api/utils";

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Remote", "Freelance"];
const EXPERIENCE_LEVELS = ["Entry Level", "Mid Level", "Senior", "Manager", "Director", "Executive"];
const GCC_LOCATIONS = [
  "Riyadh, Saudi Arabia",
  "Jeddah, Saudi Arabia",
  "Dammam, Saudi Arabia",
  "Cairo, Egypt",
  "Alexandria, Egypt",
  "Dubai, UAE",
  "Abu Dhabi, UAE",
  "Doha, Qatar",
  "Kuwait City, Kuwait",
  "Manama, Bahrain",
  "Muscat, Oman",
  "Amman, Jordan",
];

const inputSt: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: "10px",
  border: "1px solid #E2E8F0",
  background: "#ffffff",
  fontSize: "0.875rem",
  color: "#0F172A",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.15s",
};

const labelSt: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#64748B",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
};

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <div className="mt-1.5 flex items-center gap-1.5">
      <AlertCircle size={12} style={{ color: "#DC2626" }} />
      <span className="text-xs" style={{ color: "#DC2626" }}>{msg}</span>
    </div>
  );
}

function SelectField({ label, value, onChange, options, required }: { label: string; value: string; onChange: (value: string) => void; options: string[]; required?: boolean }) {
  return (
    <div>
      <label style={labelSt}>{label}{required ? <span style={{ color: "#DC2626" }}> *</span> : null}</label>
      <div className="relative">
        <select value={value} onChange={(event) => onChange(event.target.value)} style={{ ...inputSt, appearance: "none", cursor: "pointer" }}>
          <option value="">Select {label.toLowerCase()}...</option>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
      </div>
    </div>
  );
}

function SkillsInput({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  const [input, setInput] = useState("");
  const addSkill = () => {
    const nextSkill = input.trim();
    if (nextSkill && !value.includes(nextSkill)) {
      onChange([...value, nextSkill]);
    }
    setInput("");
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        {value.map((skill) => (
          <span key={skill} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium" style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #DBEAFE" }}>
            {skill}
            <button type="button" onClick={() => onChange(value.filter((item) => item !== skill))}><X size={10} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addSkill(); } }} placeholder="Add a skill, press Enter..." style={{ ...inputSt, flex: 1 }} />
        <button type="button" onClick={addSkill} disabled={!input.trim()} className="rounded-lg border px-3 py-2 text-sm font-semibold" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function AdminJobFormPage() {
  const { id } = useParams<{ id?: string }>();
  const jobId = id ? Number(id) : null;
  const isEdit = Number.isFinite(jobId) && jobId !== null;
  const navigate = useNavigate();

  const [existing, setExisting] = useState<JobRecord | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [deadline, setDeadline] = useState("");
  const [targetStatus, setTargetStatus] = useState<JobStatus>("Draft");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(Boolean(isEdit));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    if (!isEdit || !jobId) return;
    const controller = new AbortController();
    const loadJob = async () => {
      setIsLoading(true);
      setPageError("");
      try {
        const job = await getAdminJobById(jobId, { signal: controller.signal });
        if (controller.signal.aborted) return;
        setExisting(job);
        setTitle(job.title);
        setDescription(job.description);
        setRequirements(job.requirements);
        setResponsibilities(job.responsibilities);
        setLocation(job.location);
        setEmploymentType(job.employmentType);
        setExperienceLevel(job.experienceLevel);
        setSalaryRange(job.salaryRange ?? "");
        setSkills(splitJobSkills(job.skills));
        setDeadline(job.applicationDeadline ? job.applicationDeadline.slice(0, 10) : "");
        setTargetStatus(job.status ?? "Draft");
      } catch (requestError) {
        if (isRequestCanceled(requestError) || controller.signal.aborted) return;
        setPageError(getAxiosErrorMessage(requestError, "Unable to load this job right now."));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    void loadJob();
    return () => controller.abort();
  }, [isEdit, jobId]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = "Job title is required.";
    if (!description.trim()) nextErrors.description = "Description is required.";
    if (!requirements.trim()) nextErrors.requirements = "Requirements are required.";
    if (!responsibilities.trim()) nextErrors.responsibilities = "Responsibilities are required.";
    if (!location.trim()) nextErrors.location = "Location is required.";
    if (!employmentType) nextErrors.employmentType = "Employment type is required.";
    if (!experienceLevel) nextErrors.experienceLevel = "Experience level is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const applyStatus = async (job: JobRecord, nextStatus: JobStatus) => {
    if (!job.id || job.status === nextStatus) return job;
    if (nextStatus === "Published") return publishJob(job.id);
    if (nextStatus === "Draft") return unpublishJob(job.id);
    return closeJob(job.id);
  };

  const handleSave = async (statusOverride?: JobStatus) => {
    if (!validate() || saving) return;
    setSaving(true);
    setSaved(false);
    setPageError("");

    const nextStatus = statusOverride ?? targetStatus;

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        requirements: requirements.trim(),
        responsibilities: responsibilities.trim(),
        location: location.trim(),
        employmentType,
        experienceLevel,
        salaryRange,
        skills,
        applicationDeadline: deadline || null,
      };

      const savedJob = isEdit && jobId
        ? await updateJob(jobId, payload)
        : await createJob(payload);
      await applyStatus(savedJob, nextStatus);
      setSaved(true);
      window.setTimeout(() => navigate("/admin/jobs"), 900);
    } catch (requestError) {
      setPageError(getAxiosErrorMessage(requestError, "Unable to save job right now."));
    } finally {
      setSaving(false);
    }
  };

  const textareaSt: React.CSSProperties = { ...inputSt, resize: "vertical", lineHeight: 1.7 };

  return (
    <AdminLayout title={isEdit ? "Edit Job" : "Create Job"}>
      {saved ? (
        <div className="fixed right-5 top-5 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-semibold text-white shadow-xl" style={{ background: "#16A34A" }}>
          <CheckCircle2 size={16} /> Job saved. Redirecting...
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        <button type="button" onClick={() => navigate("/admin/jobs")} className="inline-flex self-start items-center gap-2 text-sm font-medium" style={{ color: "#64748B" }}>
          <ArrowLeft size={14} /> Back to Job Management
        </button>

        {pageError ? (
          <div className="flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626" }}>
            <AlertCircle size={14} /> {pageError}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-xl bg-white px-6 py-16 text-center text-sm" style={{ border: "1px solid #E2E8F0", color: "#94A3B8" }}>Loading job...</div>
        ) : (
          <div className="flex flex-col items-start gap-6 lg:flex-row">
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              <div className="rounded-xl bg-white p-7" style={{ border: "1px solid #E2E8F0" }}>
                <h2 className="mb-6 text-sm font-bold" style={{ color: "#0B1F4D" }}>Job Details</h2>
                <div className="mb-5">
                  <label style={labelSt}>Job Title <span style={{ color: "#DC2626" }}>*</span></label>
                  <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Senior Financial Analyst" style={{ ...inputSt, borderColor: errors.title ? "#DC2626" : "#E2E8F0" }} />
                  <FieldError msg={errors.title} />
                </div>

                {existing?.slug ? (
                  <div className="mb-5 rounded-xl px-4 py-3 text-xs" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#64748B" }}>
                    Shareable link: <span style={{ color: "#1D4ED8", fontFamily: "monospace" }}>/careers/{existing.slug}</span>
                  </div>
                ) : null}

                <div className="mb-5">
                  <label style={labelSt}>Description <span style={{ color: "#DC2626" }}>*</span></label>
                  <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={5} placeholder="Describe the role, team, and opportunity..." style={{ ...textareaSt, borderColor: errors.description ? "#DC2626" : "#E2E8F0" }} />
                  <FieldError msg={errors.description} />
                </div>

                <div className="mb-5">
                  <label style={labelSt}>Requirements <span style={{ color: "#DC2626" }}>*</span></label>
                  <p className="mb-2 text-xs" style={{ color: "#94A3B8" }}>List one requirement per line.</p>
                  <textarea value={requirements} onChange={(event) => setRequirements(event.target.value)} rows={7} style={{ ...textareaSt, fontFamily: "'SFMono-Regular', Consolas, monospace", fontSize: "0.8125rem", borderColor: errors.requirements ? "#DC2626" : "#E2E8F0" }} />
                  <FieldError msg={errors.requirements} />
                </div>

                <div>
                  <label style={labelSt}>Responsibilities <span style={{ color: "#DC2626" }}>*</span></label>
                  <p className="mb-2 text-xs" style={{ color: "#94A3B8" }}>List one responsibility per line.</p>
                  <textarea value={responsibilities} onChange={(event) => setResponsibilities(event.target.value)} rows={7} style={{ ...textareaSt, fontFamily: "'SFMono-Regular', Consolas, monospace", fontSize: "0.8125rem", borderColor: errors.responsibilities ? "#DC2626" : "#E2E8F0" }} />
                  <FieldError msg={errors.responsibilities} />
                </div>
              </div>
            </div>

            <div className="flex w-full flex-shrink-0 flex-col gap-5 lg:w-72">
              <div className="rounded-xl bg-white p-6" style={{ border: "1px solid #E2E8F0" }}>
                <div className="mb-4 text-sm font-bold" style={{ color: "#0B1F4D" }}>Classification</div>
                <div className="flex flex-col gap-4">
                  <div>
                    <label style={labelSt}>Location <span style={{ color: "#DC2626" }}>*</span></label>
                    <input list="locations" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="e.g. Riyadh, Saudi Arabia" style={{ ...inputSt, borderColor: errors.location ? "#DC2626" : "#E2E8F0" }} />
                    <datalist id="locations">{GCC_LOCATIONS.map((item) => <option key={item} value={item} />)}</datalist>
                    <FieldError msg={errors.location} />
                  </div>
                  <SelectField label="Employment Type" value={employmentType} onChange={setEmploymentType} options={EMPLOYMENT_TYPES} required />
                  <FieldError msg={errors.employmentType} />
                  <SelectField label="Experience Level" value={experienceLevel} onChange={setExperienceLevel} options={EXPERIENCE_LEVELS} required />
                  <FieldError msg={errors.experienceLevel} />
                </div>
              </div>

              <div className="rounded-xl bg-white p-6" style={{ border: "1px solid #E2E8F0" }}>
                <div className="mb-1 text-sm font-bold" style={{ color: "#0B1F4D" }}>Optional Details</div>
                <p className="mb-4 text-xs" style={{ color: "#94A3B8" }}>Leave blank to skip.</p>
                <div className="flex flex-col gap-4">
                  <div>
                    <label style={labelSt}>Salary Range</label>
                    <input value={salaryRange} onChange={(event) => setSalaryRange(event.target.value)} placeholder="e.g. SAR 18,000 - 25,000 / mo" style={inputSt} />
                  </div>
                  <div>
                    <label style={labelSt}>Application Deadline</label>
                    <input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} style={inputSt} />
                  </div>
                  <div>
                    <label style={labelSt}>Skills</label>
                    <SkillsInput value={skills} onChange={setSkills} />
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white p-6" style={{ border: "1px solid #E2E8F0" }}>
                <div className="mb-4 text-sm font-bold" style={{ color: "#0B1F4D" }}>Status</div>
                <div className="flex flex-col gap-2">
                  {(["Draft", "Published", "Closed"] as JobStatus[]).map((status) => (
                    <label key={status} className="flex cursor-pointer items-center gap-3 rounded-xl p-3" style={{ background: targetStatus === status ? "#EFF6FF" : "#F8FAFC", border: `1px solid ${targetStatus === status ? "#DBEAFE" : "#F1F5F9"}` }}>
                      <input type="radio" name="status" value={status} checked={targetStatus === status} onChange={() => setTargetStatus(status)} className="accent-blue-600" />
                      <div>
                        <div className="text-sm font-semibold" style={{ color: targetStatus === status ? "#1D4ED8" : "#0F172A" }}>{status}</div>
                        <div className="text-xs" style={{ color: "#94A3B8" }}>{status === "Draft" ? "Not publicly visible" : status === "Published" ? "Visible to candidates" : "Closed to applications"}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-xl bg-white p-6" style={{ border: "1px solid #E2E8F0" }}>
                <button type="button" onClick={() => void handleSave()} disabled={saving || saved} className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white" style={{ background: saving || saved ? "#94A3B8" : "#0B1F4D" }}>
                  {saving ? "Saving..." : <><Save size={15} /> {isEdit ? "Save Changes" : "Save as Draft"}</>}
                </button>
                {targetStatus !== "Published" ? (
                  <button type="button" onClick={() => { setTargetStatus("Published"); void handleSave("Published"); }} disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold" style={{ borderColor: "#16A34A", color: "#16A34A" }}>
                    <Globe size={15} /> Save & Publish
                  </button>
                ) : (
                  <button type="button" onClick={() => { setTargetStatus("Draft"); void handleSave("Draft"); }} disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold" style={{ borderColor: "#D97706", color: "#D97706" }}>
                    <EyeOff size={15} /> Move to Draft
                  </button>
                )}
                {targetStatus !== "Closed" ? (
                  <button type="button" onClick={() => { setTargetStatus("Closed"); void handleSave("Closed"); }} disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold" style={{ borderColor: "#DC2626", color: "#DC2626" }}>
                    <Lock size={15} /> Save & Close
                  </button>
                ) : null}
                <button type="button" onClick={() => navigate("/admin/jobs")} disabled={saving} className="w-full rounded-xl py-2.5 text-sm font-medium" style={{ color: "#64748B" }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
