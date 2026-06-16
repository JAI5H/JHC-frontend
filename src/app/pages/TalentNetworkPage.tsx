import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight, Upload, FileText, CheckCircle2, ChevronLeft, X } from "lucide-react";
import { ImageWithFallback } from "../components/shared/ImageWithFallback";
import jhcLogo from "../../imgs/logo.png";
import { useTranslation } from "../hooks/useTranslation";

/* ─── Types ─── */
type Step1 = { fullName: string; email: string; phone: string; nationality: string; currentCountry: string; currentCity: string };
type Step2 = { jobTitle: string; industry: string; yearsExperience: string; expectedSalary: string; employmentType: string };
type Step3 = { preferredCountry: string; englishLevel: string; linkedinUrl: string; notes: string; cvFile: File | null };

const NATIONALITIES = ["Saudi Arabian","Egyptian","Emirati","Qatari","Kuwaiti","Bahraini","Omani","Jordanian","Lebanese","Pakistani","Indian","Filipino","British","American","Other"];
const COUNTRIES     = ["Saudi Arabia","Egypt","United Arab Emirates","Qatar","Kuwait","Bahrain","Oman","Jordan","Lebanon","United Kingdom","United States","Other"];
const INDUSTRIES    = ["Energy & Oil","Technology","Finance & Banking","Healthcare","Construction & Real Estate","Retail & E-Commerce","Telecommunications","Government","Education","Consulting","Other"];
const ENG_LEVELS    = ["Native / Bilingual","Professional Proficiency (C1–C2)","Business Proficiency (B1–B2)","Basic (A1–A2)"];

/* ─── Shared styles ─── */
const S = {
  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "10px",
    border: "1px solid #E2E8F0",
    background: "#ffffff",
    fontSize: "0.9rem",
    color: "#0F172A",
    outline: "none",
    transition: "border-color 0.15s",
    fontFamily: "var(--font-family-app)",
  } as React.CSSProperties,
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="mb-[6px] block text-[12px] font-semibold tracking-[0.02em] text-slate-500">
        {label}
        {required && <span style={{ color: "#1D4ED8" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ name, value, onChange, placeholder, type = "text" }: { name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string }) {
  return (
    <input
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      style={S.input}
      onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
      onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
    />
  );
}

function Select({ name, value, onChange, options, placeholder }: { name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[]; placeholder?: string }) {
  const [open, setOpen] = useState(false);

  const triggerChange = (nextValue: string) => {
    onChange({
      target: { name, value: nextValue },
    } as React.ChangeEvent<HTMLSelectElement>);
    setOpen(false);
  };

  return (
    <div className="relative">
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-12 cursor-pointer select-none items-center justify-between rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] px-4 text-[14px] outline-none transition-colors"
        style={{ color: value === "" ? "#94a3b8" : "#0b1f4d" }}
      >
        <span>{value || placeholder || "Select..."}</span>
        <span className="transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <svg className="size-5 text-[#64748b]" fill="none" viewBox="0 0 20 20" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4" />
          </svg>
        </span>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute top-[102%] left-0 right-0 z-30 max-h-[180px] origin-top overflow-y-auto rounded-[12px] border border-[#e2e8f0] bg-white py-1 shadow-lg transition-all duration-200">
            {options.map((option) => (
              <div
                key={option}
                onClick={() => triggerChange(option)}
                className="flex cursor-pointer items-center justify-between px-4 py-2 text-[14px] text-[#0b1f4d] transition-colors duration-150 hover:bg-[#f8fafc] hover:text-[#2563eb]"
              >
                <span>{option}</span>
                {value === option && (
                  <svg className="size-4 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Step indicators ─── */
function StepBar({ current }: { current: 1 | 2 | 3 }) {
  const { talentNetwork } = useTranslation();
  const steps = talentNetwork.stepBar.steps;

  const progressWidth = current === 1 ? "0%" : current === 2 ? "50%" : "100%";

  return (
    <div className="relative flex w-full items-center justify-between">
      <div className="absolute left-[20px] right-[20px] top-[16px] h-[2px] -translate-y-1/2 rounded-full bg-neutral-200 z-0" />
      <div
        className="absolute left-[20px] top-[16px] h-[2px] -translate-y-1/2 rounded-full bg-blue-600 z-0 transition-all duration-300 ease-in-out"
        style={{ width: `calc((100% - 40px) * ${progressWidth === "0%" ? "0" : progressWidth === "50%" ? "0.5" : "1"})` }}
      />
      {steps.map((s, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;

        return (
          <div
            key={s.num}
            className={[
              "relative flex flex-col",
              i === 0 ? "items-start text-left" : i === steps.length - 1 ? "items-end text-right" : "items-center text-center",
            ].join(" ")}
          >
            <div
              className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white transition-all duration-200"
              style={{
                background: done ? "#0B1F4D" : active ? "#1D4ED8" : "#F1F5F9",
                border: done || active ? "none" : "1px solid #E2E8F0",
              }}
            >
              {done ? (
                <CheckCircle2 size={16} style={{ color: "#60A5FA" }} />
              ) : (
                <span className="text-xs font-black" style={{ color: active ? "#ffffff" : "#94A3B8" }}>{s.num}</span>
              )}
            </div>
            <div className="mt-3 hidden sm:block">
              <div className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: active ? "#0B1F4D" : done ? "#64748B" : "#94A3B8" }}>
                Step {s.num}
              </div>
              <div className="mt-1 text-xs" style={{ color: active ? "#1D4ED8" : "#94A3B8" }}>
                {s.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Step 1 ─── */
function Step1Form({ data, onChange, onNext }: { data: Step1; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; onNext: () => void }) {
  const { talentNetwork } = useTranslation();
  const valid = data.fullName && data.email && data.phone && data.nationality && data.currentCountry && data.currentCity;
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0B1F4D", letterSpacing: "-0.02em" }}>{talentNetwork.step1.title}</h2>
        <p className="mt-1 text-sm" style={{ color: "#64748B" }}>{talentNetwork.step1.description}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label={talentNetwork.step1.fields.fullName} required>
          <Input name="fullName" value={data.fullName} onChange={onChange} placeholder={talentNetwork.step1.placeholders.fullName} />
        </Field>
        <Field label={talentNetwork.step1.fields.email} required>
          <Input name="email" value={data.email} onChange={onChange} type="email" placeholder={talentNetwork.step1.placeholders.email} />
        </Field>
        <Field label={talentNetwork.step1.fields.phone} required>
          <Input name="phone" value={data.phone} onChange={onChange} type="tel" placeholder={talentNetwork.step1.placeholders.phone} />
        </Field>
        <Field label={talentNetwork.step1.fields.nationality} required>
          <Select name="nationality" value={data.nationality} onChange={onChange} options={talentNetwork.options.nationalities} placeholder={talentNetwork.step1.placeholders.nationality} />
        </Field>
        <Field label={talentNetwork.step1.fields.currentCountry} required>
          <Select name="currentCountry" value={data.currentCountry} onChange={onChange} options={talentNetwork.options.countries} placeholder={talentNetwork.step1.placeholders.currentCountry} />
        </Field>
        <Field label={talentNetwork.step1.fields.currentCity} required>
          <Input name="currentCity" value={data.currentCity} onChange={onChange} placeholder={talentNetwork.step1.placeholders.currentCity} />
        </Field>
      </div>
      <div className="flex justify-end pt-2">
        <button
          onClick={onNext}
          disabled={!valid}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150"
          style={{ background: valid ? "#1D4ED8" : "#CBD5E1", cursor: valid ? "pointer" : "not-allowed" }}
          onMouseEnter={(e) => { if (valid) (e.currentTarget as HTMLElement).style.background = "#0B1F4D"; }}
          onMouseLeave={(e) => { if (valid) (e.currentTarget as HTMLElement).style.background = "#1D4ED8"; }}
        >
          {talentNetwork.step1.nextButton} <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

/* ─── Step 2 ─── */
function Step2Form({ data, onChange, onNext, onPrev }: { data: Step2; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; onNext: () => void; onPrev: () => void }) {
  const { talentNetwork } = useTranslation();
  const valid = data.jobTitle && data.industry && data.yearsExperience && data.expectedSalary && data.employmentType;
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0B1F4D", letterSpacing: "-0.02em" }}>{talentNetwork.step2.title}</h2>
        <p className="mt-1 text-sm" style={{ color: "#64748B" }}>{talentNetwork.step2.description}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label={talentNetwork.step2.fields.jobTitle} required>
          <Input name="jobTitle" value={data.jobTitle} onChange={onChange} placeholder={talentNetwork.step2.placeholders.jobTitle} />
        </Field>
        <Field label={talentNetwork.step2.fields.industry} required>
          <Select name="industry" value={data.industry} onChange={onChange} options={talentNetwork.options.industries} placeholder={talentNetwork.step2.placeholders.industry} />
        </Field>
        <Field label={talentNetwork.step2.fields.yearsExperience} required>
          <Input name="yearsExperience" value={data.yearsExperience} onChange={onChange} type="number" placeholder={talentNetwork.step2.placeholders.yearsExperience} />
        </Field>
        <Field label={talentNetwork.step2.fields.expectedSalary} required>
          <Input name="expectedSalary" value={data.expectedSalary} onChange={onChange} placeholder={talentNetwork.step2.placeholders.expectedSalary} />
        </Field>
      </div>

      {/* Employment type radio group */}
      <Field label={talentNetwork.step2.fields.employmentType} required>
        <div className="grid sm:grid-cols-3 gap-3 mt-1">
          {talentNetwork.step2.employmentOptions.map((opt) => {
            const active = data.employmentType === opt.value;
            return (
              <label
                key={opt.value}
                className="flex flex-col gap-1.5 p-4 rounded-xl cursor-pointer transition-all duration-150"
                style={{
                  border: `1px solid ${active ? "#1D4ED8" : "#E2E8F0"}`,
                  background: active ? "#EFF6FF" : "#F8FAFC",
                }}
              >
                <input type="radio" name="employmentType" value={opt.value} checked={active} onChange={onChange} className="sr-only" />
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: active ? "#1D4ED8" : "#CBD5E1" }}>
                    {active && <div className="w-2 h-2 rounded-full" style={{ background: "#1D4ED8" }} />}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: active ? "#0B1F4D" : "#0F172A" }}>{opt.label}</span>
                </div>
                <span className="text-xs ml-6" style={{ color: "#64748B" }}>{opt.desc}</span>
              </label>
            );
          })}
        </div>
      </Field>

      <div className="flex items-center justify-between pt-2">
        <button onClick={onPrev} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border transition-colors"
          style={{ borderColor: "#E2E8F0", color: "#64748B" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#0B1F4D"; (e.currentTarget as HTMLElement).style.color = "#0B1F4D"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLElement).style.color = "#64748B"; }}>
          <ChevronLeft size={15} /> {talentNetwork.step2.previousButton}
        </button>
        <button onClick={onNext} disabled={!valid}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150"
          style={{ background: valid ? "#1D4ED8" : "#CBD5E1", cursor: valid ? "pointer" : "not-allowed" }}
          onMouseEnter={(e) => { if (valid) (e.currentTarget as HTMLElement).style.background = "#0B1F4D"; }}
          onMouseLeave={(e) => { if (valid) (e.currentTarget as HTMLElement).style.background = "#1D4ED8"; }}>
          {talentNetwork.step2.nextButton} <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

/* ─── Step 3 ─── */
function Step3Form({ data, onChange, onFileChange, onPrev, onSubmit, submitting }: {
  data: Step3;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onFileChange: (f: File | null) => void;
  onPrev: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const { talentNetwork } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const canSubmit = !!data.preferredCountry && !!data.englishLevel && !!data.cvFile && !submitting;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileChange(file);
  };

  return (
    <div className="flex min-w-0 flex-col gap-6 sm:gap-8">
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0B1F4D", letterSpacing: "-0.02em" }}>{talentNetwork.step3.title}</h2>
        <p className="mt-1 text-sm" style={{ color: "#64748B" }}>{talentNetwork.step3.description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        <Field label={talentNetwork.step3.fields.preferredCountry} required>
          <Select name="preferredCountry" value={data.preferredCountry} onChange={onChange} options={talentNetwork.options.countries} placeholder={talentNetwork.step3.placeholders.preferredCountry} />
        </Field>
        <Field label={talentNetwork.step3.fields.englishLevel} required>
          <Select name="englishLevel" value={data.englishLevel} onChange={onChange} options={talentNetwork.options.englishLevels} placeholder={talentNetwork.step3.placeholders.englishLevel} />
        </Field>
        <Field label={talentNetwork.step3.fields.linkedinUrl}>
          <Input name="linkedinUrl" value={data.linkedinUrl} onChange={onChange} placeholder={talentNetwork.step3.placeholders.linkedinUrl} />
        </Field>
      </div>

      <Field label={talentNetwork.step3.fields.notes}>
        <textarea
          name="notes"
          value={data.notes}
          onChange={onChange}
          rows={4}
          placeholder={talentNetwork.step3.placeholders.notes}
          className="block w-full min-w-0 max-w-full overflow-x-hidden"
          style={{ ...S.input, resize: "vertical", lineHeight: 1.65, boxSizing: "border-box" }}
          onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
          onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
        />
      </Field>

      {/* CV Dropzone */}
      <div>
        <label className="mb-[6px] block text-[12px] font-semibold tracking-[0.02em] text-slate-500">
          {talentNetwork.step3.fields.cvUpload} <span style={{ color: "#1D4ED8" }}>*</span>
        </label>
        <div
          className="relative mt-2 flex min-h-[176px] flex-col items-center justify-center gap-3 rounded-xl px-4 py-6 text-center transition-all duration-150 sm:mt-3 sm:min-h-[220px] sm:gap-4 sm:p-10"
          style={{
            border: `1.5px dashed ${dragOver ? "#1D4ED8" : data.cvFile ? "#0B1F4D" : "#BFDBFE"}`,
            background: dragOver ? "#EFF6FF" : data.cvFile ? "#F0F9FF" : "#F8FAFC",
          }}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />

          {data.cvFile ? (
            /* File selected state */
            <div className="flex min-w-0 flex-col items-center gap-2.5 sm:gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl sm:h-12 sm:w-12" style={{ background: "#EFF6FF" }}>
                <FileText size={20} style={{ color: "#1D4ED8" }} />
              </div>
              <div className="min-w-0">
                <div className="break-words text-sm font-semibold" style={{ color: "#0B1F4D" }}>{data.cvFile.name}</div>
                <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                  {(data.cvFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onFileChange(null); }}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: "#64748B", border: "1px solid #E2E8F0" }}
              >
                <X size={12} /> {talentNetwork.step3.removeFile}
              </button>
            </div>
          ) : (
            /* Empty state */
            <div className="flex min-w-0 flex-col items-center gap-2.5 sm:gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl sm:h-14 sm:w-14" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
                <Upload size={22} style={{ color: "#1D4ED8" }} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold leading-5 sm:leading-normal" style={{ color: "#0B1F4D" }}>
                  {talentNetwork.step3.emptyStateTitle}
                </div>
                <div className="mt-1 text-xs leading-5 sm:mt-1.5" style={{ color: "#94A3B8" }}>
                  {talentNetwork.step3.emptyStateDescription}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-stretch gap-2.5 pt-1 sm:flex-nowrap sm:justify-between sm:gap-3 sm:pt-2">
        <button onClick={onPrev}
          className="inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border px-4 text-center text-sm font-medium whitespace-nowrap transition-colors sm:flex-none sm:px-6"
          style={{ borderColor: "#E2E8F0", color: "#64748B" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#0B1F4D"; (e.currentTarget as HTMLElement).style.color = "#0B1F4D"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLElement).style.color = "#64748B"; }}>
          <ChevronLeft size={15} /> {talentNetwork.step3.previousButton}
        </button>
        <button onClick={onSubmit} disabled={!canSubmit}
          className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-sm font-semibold text-white whitespace-normal break-words transition-all duration-150 sm:flex-none sm:px-8"
          style={{
            background: canSubmit ? "#0B1F4D" : "#CBD5E1",
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
          onMouseEnter={(e) => { if (canSubmit) (e.currentTarget as HTMLElement).style.background = "#1D4ED8"; }}
          onMouseLeave={(e) => { if (canSubmit) (e.currentTarget as HTMLElement).style.background = "#0B1F4D"; }}>
          {submitting ? talentNetwork.step3.submittingLabel : <><span className="sm:hidden">{talentNetwork.step3.submitButtonMobile}</span><span className="hidden sm:inline">{talentNetwork.step3.submitButtonDesktop}</span> <ArrowRight className="shrink-0" size={15} /></>}
        </button>
      </div>
    </div>
  );
}

/* ─── Success screen ─── */
function SuccessScreen() {
  const { talentNetwork } = useTranslation();
  return (
    <div className="flex flex-col items-center text-center py-16 gap-6 max-w-md mx-auto">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
        <CheckCircle2 size={36} style={{ color: "#1D4ED8" }} />
      </div>
      <div>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0B1F4D", letterSpacing: "-0.02em" }}>{talentNetwork.success.title}</h2>
        <p className="mt-3 text-base leading-relaxed" style={{ color: "#64748B" }}>
          {talentNetwork.success.description}
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-xs pt-2">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ background: "#0B1F4D" }}
        >
          {talentNetwork.success.backButton}
        </Link>
      </div>
    </div>
  );
}

/* ═══════════════════ MAIN PAGE ═══════════════════ */
export default function TalentNetworkPage() {
  const { talentNetwork } = useTranslation();
  const [step, setStep]           = useState<1 | 2 | 3>(1);
  const [done, setDone]           = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [s1, setS1] = useState<Step1>({ fullName: "", email: "", phone: "", nationality: "", currentCountry: "", currentCity: "" });
  const [s2, setS2] = useState<Step2>({ jobTitle: "", industry: "", yearsExperience: "", expectedSalary: "", employmentType: "" });
  const [s3, setS3] = useState<Step3>({ preferredCountry: "", englishLevel: "", linkedinUrl: "", notes: "", cvFile: null });

  const onChange1 = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setS1((p) => ({ ...p, [e.target.name]: e.target.value }));
  const onChange2 = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setS2((p) => ({ ...p, [e.target.name]: e.target.value }));
  const onChange3 = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setS3((p) => ({ ...p, [e.target.name]: e.target.value }));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    if (window.location.hash === "#application-start") {
      requestAnimationFrame(() => {
        document.getElementById("application-start")?.scrollIntoView({ block: "start" });
      });
    }
  }, []);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setDone(true); }, 1600);
  };

  return (
    <div style={{ fontFamily: "var(--font-family-app)", background: "#F8F9FA", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white" style={{ borderBottom: "1px solid #E2E8F0" }}>
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between" style={{ height: "64px" }}>
          <div className="flex items-center gap-6">
            <ImageWithFallback src={jhcLogo} alt="JHC" className="h-8 w-auto object-contain" />
            <div className="hidden sm:block w-px h-5" style={{ background: "#E2E8F0" }} />
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"
              style={{ borderColor: "#E2E8F0", color: "#64748B" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#0B1F4D"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; }}
            >
              <ArrowLeft size={14} /> {talentNetwork.page.backToMainSite}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/#contact"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"
              style={{ borderColor: "#E2E8F0", color: "#0B1F4D" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#0B1F4D"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; }}
            >
              {talentNetwork.page.forBusinesses}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Page body ── */}
      <main className="flex-1 py-10 px-4">
        <div id="application-start" className="max-w-3xl mx-auto flex flex-col gap-8">

          {/* Page title */}
          {!done && (
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#1D4ED8" }}>{talentNetwork.page.eyebrow}</span>
              <h1 className="mt-2" style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "#0B1F4D", letterSpacing: "-0.025em" }}>
                {talentNetwork.page.title}
              </h1>
              <p className="mt-2 text-sm" style={{ color: "#64748B" }}>
                {talentNetwork.page.description}
              </p>
            </div>
          )}

          {/* Step bar */}
          {!done && (
            <div className="rounded-2xl p-5 bg-white" style={{ border: "1px solid #E2E8F0" }}>
              <StepBar current={step} />
            </div>
          )}

          {/* Form card */}
          <div className="rounded-2xl bg-white p-8 lg:p-10" style={{ border: "1px solid #E2E8F0" }}>
            {done ? (
              <SuccessScreen />
            ) : step === 1 ? (
              <Step1Form data={s1} onChange={onChange1} onNext={() => setStep(2)} />
            ) : step === 2 ? (
              <Step2Form data={s2} onChange={onChange2} onNext={() => setStep(3)} onPrev={() => setStep(1)} />
            ) : (
              <Step3Form data={s3} onChange={onChange3} onFileChange={(f) => setS3((p) => ({ ...p, cvFile: f }))} onPrev={() => setStep(2)} onSubmit={handleSubmit} submitting={submitting} />
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: "#ffffff", borderTop: "1px solid #E2E8F0" }}>
        <div className="mx-auto max-w-5xl px-6 py-5 text-center">
          <p className="text-xs" style={{ color: "#A3A3A3" }}>
            {talentNetwork.page.footerCopyright}
          </p>
        </div>
      </footer>
    </div>
  );
}
