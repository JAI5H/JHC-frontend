import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight, Upload, FileText, CheckCircle2, ChevronLeft, X } from "lucide-react";
import { ImageWithFallback } from "../components/shared/ImageWithFallback";
import jhcLogo from "../../imgs/logo.png";
import { useTranslation } from "../hooks/useTranslation";
import { useLanguage } from "../providers/LanguageProvider";
import { submitTalentNetworkApplication } from "../../services/api/talentNetworkApi";
import { getAxiosErrorDetails } from "../../services/api/utils";

/* ─── Types ─── */
type Step1 = { fullName: string; email: string; phone: string; nationality: string; currentCountry: string; currentCity: string };
type Step2 = { jobTitle: string; industry: string; yearsExperience: string; expectedSalary: string; employmentType: string[] };
type Step3 = { preferredCountry: string; englishLevel: string; linkedinUrl: string; notes: string; cvFile: File | null };
type SelectOption = string | { label: string; value: string };

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_CV_EXTENSIONS = [".pdf", ".doc", ".docx"];
const ALLOWED_CV_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

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

function isAllowedCvFile(file: File) {
  const normalizedName = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_CV_EXTENSIONS.some((extension) => normalizedName.endsWith(extension));
  const hasAllowedMimeType = !file.type || ALLOWED_CV_MIME_TYPES.includes(file.type);

  return hasAllowedExtension && hasAllowedMimeType && !normalizedName.includes("\0");
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="mb-[6px] block font-semibold tracking-[0.02em] text-slate-500"
        style={{
          fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)",
          fontSize: isArabic ? "13px" : "12px",
        }}
      >
        {label}
        {required && <span style={{ color: "#1D4ED8" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ name, value, onChange, placeholder, type = "text" }: { name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string }) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  return (
    <input
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      dir={isArabic ? "rtl" : "ltr"}
      style={{
        ...S.input,
        fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)",
        fontSize: isArabic ? "0.95rem" : S.input.fontSize,
        textAlign: isArabic ? "right" : "left",
      }}
      onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
      onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
    />
  );
}

function Select({ name, value, onChange, options, placeholder }: { name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: readonly SelectOption[]; placeholder?: string }) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );
  const selectedOption = normalizedOptions.find((option) => option.value === value);
  const listboxId = `${name}-listbox`;

  const triggerChange = (nextValue: string) => {
    onChange({
      target: { name, value: nextValue },
    } as React.ChangeEvent<HTMLSelectElement>);
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;

    const selectedIndex = normalizedOptions.findIndex((option) => option.value === value);
    const nextFocusedOption = optionRefs.current[selectedIndex >= 0 ? selectedIndex : 0];
    nextFocusedOption?.focus();
  }, [normalizedOptions, open, value]);

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
    }
  };

  const handleOptionKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      optionRefs.current[(index + 1) % normalizedOptions.length]?.focus();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      optionRefs.current[(index - 1 + normalizedOptions.length) % normalizedOptions.length]?.focus();
    }
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        className="flex h-12 cursor-pointer select-none items-center justify-between rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] px-4 text-[14px] outline-none transition-colors"
        dir={isArabic ? "rtl" : "ltr"}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={placeholder || name}
        style={{
          color: value === "" ? "#94a3b8" : "#0b1f4d",
          fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)",
          fontSize: isArabic ? "15px" : "14px",
          textAlign: isArabic ? "right" : "left",
          width: "100%",
        }}
      >
        <span>{selectedOption?.label || placeholder || "Select..."}</span>
        <span aria-hidden="true" className="transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <svg className="size-5 text-[#64748b]" fill="none" viewBox="0 0 20 20" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4" />
          </svg>
        </span>
      </button>

      {open && (
        <>
          <div aria-hidden="true" className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div id={listboxId} role="listbox" className="absolute top-[102%] left-0 right-0 z-30 max-h-[180px] origin-top overflow-y-auto rounded-[12px] border border-[#e2e8f0] bg-white py-1 shadow-lg transition-all duration-200">
            {normalizedOptions.map((option, index) => (
              <button
                key={option.value}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                type="button"
                onClick={() => triggerChange(option.value)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
                className="flex cursor-pointer items-center justify-between px-4 py-2 text-[14px] text-[#0b1f4d] transition-colors duration-150 hover:bg-[#f8fafc] hover:text-[#2563eb]"
                dir={isArabic ? "rtl" : "ltr"}
                role="option"
                aria-selected={value === option.value}
                style={{
                  fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)",
                  fontSize: isArabic ? "15px" : "14px",
                  width: "100%",
                  textAlign: isArabic ? "right" : "left",
                }}
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <svg aria-hidden="true" className="size-4 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
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
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const steps = talentNetwork.stepBar.steps;
  const stepPrefix = "prefix" in talentNetwork.stepBar ? talentNetwork.stepBar.prefix : "Step";
  const stepCircleSize = 32;
  const lineInset = stepCircleSize / 2;

  const progressWidth = current === 1 ? "0%" : current === 2 ? "50%" : "100%";

  return (
    <div className="relative flex w-full items-center justify-between" dir="ltr">
      <div
        className="absolute top-[16px] h-[2px] -translate-y-1/2 rounded-full bg-neutral-200 z-0"
        style={isArabic ? { left: `${lineInset}px`, right: `${lineInset}px` } : { left: "20px", right: "20px" }}
      />
      <div
        className="absolute top-[16px] h-[2px] -translate-y-1/2 rounded-full bg-blue-600 z-0 transition-all duration-300 ease-in-out"
        style={{
          width: isArabic
            ? `calc((100% - ${stepCircleSize}px) * ${
                progressWidth === "0%" ? "0" : progressWidth === "50%" ? "0.5" : "1"
              })`
            : `calc((100% - 40px) * ${progressWidth === "0%" ? "0" : progressWidth === "50%" ? "0.5" : "1"})`,
          ...(isArabic ? { right: `${lineInset}px` } : { left: "20px" }),
        }}
      />
      {steps.map((s, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;

        return (
          <div
            key={s.num}
            className={[
              "relative flex flex-1 flex-col",
              isArabic ? (i === 0 ? "order-3" : i === 1 ? "order-2" : "order-1") : "",
              isArabic
                ? i === 0
                  ? "items-end text-right"
                  : i === steps.length - 1
                    ? "items-start text-left"
                    : "items-center text-center"
                : i === 0
                  ? "items-start text-left"
                  : i === steps.length - 1
                    ? "items-end text-right"
                    : "items-center text-center",
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
              <div
                className="font-bold uppercase tracking-[0.08em]"
                style={{
                  color: active ? "#0B1F4D" : done ? "#64748B" : "#94A3B8",
                  fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)",
                  fontSize: isArabic ? "12px" : "11px",
                }}
              >
                {isArabic ? `${stepPrefix} ${s.num}` : `Step ${s.num}`}
              </div>
              <div
                className="mt-1"
                style={{
                  color: active ? "#1D4ED8" : "#94A3B8",
                  fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)",
                  fontSize: isArabic ? "13px" : "12px",
                }}
              >
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
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const valid = data.fullName && data.email && data.phone && data.nationality && data.currentCountry && data.currentCity;
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 style={{ fontSize: isArabic ? "1.625rem" : "1.5rem", fontWeight: 800, color: "#0B1F4D", letterSpacing: "-0.02em", fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)" }}>{talentNetwork.step1.title}</h2>
        <p className="mt-1 text-sm" style={{ color: "#64748B", fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)", fontSize: isArabic ? "0.95rem" : undefined }}>{talentNetwork.step1.description}</p>
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
        className="inline-flex items-center gap-2 px-7 py-3 rounded-[16px] text-sm font-semibold text-white transition-[transform,background-color,border-color,color] duration-200 ease-out hover:-translate-y-px active:translate-y-0"
          style={{ background: valid ? "#1D4ED8" : "#CBD5E1", cursor: valid ? "pointer" : "not-allowed", fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)", fontSize: isArabic ? "15px" : undefined }}
          onMouseEnter={(e) => { if (valid) (e.currentTarget as HTMLElement).style.background = "#0B1F4D"; }}
          onMouseLeave={(e) => { if (valid) (e.currentTarget as HTMLElement).style.background = "#1D4ED8"; }}
        >
          {isArabic ? (
            <>
              <span>{talentNetwork.step1.nextButton}</span>
              <ArrowLeft size={15} />
            </>
          ) : (
            <>
              {talentNetwork.step1.nextButton} <ArrowRight size={15} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Step 2 ─── */
function Step2Form({
  data,
  onChange,
  onEmploymentTypeToggle,
  onNext,
  onPrev,
}: {
  data: Step2;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onEmploymentTypeToggle: (value: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const { talentNetwork } = useTranslation();
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const valid = data.jobTitle && data.industry && data.yearsExperience && data.expectedSalary && data.employmentType.length > 0;
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 style={{ fontSize: isArabic ? "1.625rem" : "1.5rem", fontWeight: 800, color: "#0B1F4D", letterSpacing: "-0.02em", fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)" }}>{talentNetwork.step2.title}</h2>
        <p className="mt-1 text-sm" style={{ color: "#64748B", fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)", fontSize: isArabic ? "0.95rem" : undefined }}>{talentNetwork.step2.description}</p>
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

      {/* Employment type multi-select */}
      <Field label={talentNetwork.step2.fields.employmentType} required>
        <div className="mt-1 grid gap-3 sm:grid-cols-2">
          {talentNetwork.step2.employmentOptions.map((opt) => {
            const active = data.employmentType.includes(opt.value);
            return (
              <label
                key={opt.value}
                className="flex flex-col gap-1.5 p-4 rounded-xl cursor-pointer transition-all duration-150"
                style={{
                  border: `1px solid ${active ? "#1D4ED8" : "#E2E8F0"}`,
                  background: active ? "#EFF6FF" : "#F8FAFC",
                }}
              >
                <input
                  type="checkbox"
                  name="employmentType"
                  value={opt.value}
                  checked={active}
                  onChange={() => onEmploymentTypeToggle(opt.value)}
                  className="sr-only"
                />
                <div className="flex items-center gap-2">
                  <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[4px] border-2"
                    style={{ borderColor: active ? "#1D4ED8" : "#CBD5E1" }}>
                    {active ? <div className="h-2 w-2 rounded-[2px]" style={{ background: "#1D4ED8" }} /> : null}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: active ? "#0B1F4D" : "#0F172A", fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)", fontSize: isArabic ? "15px" : undefined }}>{opt.label}</span>
                </div>
                <span className="text-xs ml-6" style={{ color: "#64748B", fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)", fontSize: isArabic ? "13px" : undefined }}>{opt.desc}</span>
              </label>
            );
          })}
        </div>
      </Field>

      <div className="flex items-center justify-between pt-2">
        <button onClick={onPrev} className="inline-flex items-center gap-2 px-6 py-3 rounded-[16px] text-sm font-medium border transition-[transform,border-color,color,background-color] duration-200 ease-out hover:-translate-y-px active:translate-y-0"
          style={{ borderColor: "#E2E8F0", color: "#64748B", fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)", fontSize: isArabic ? "15px" : undefined }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#0B1F4D"; (e.currentTarget as HTMLElement).style.color = "#0B1F4D"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLElement).style.color = "#64748B"; }}>
          {isArabic ? (
            <>
              <ArrowRight size={15} />
              <span>{talentNetwork.step2.previousButton}</span>
            </>
          ) : (
            <>
              <ChevronLeft size={15} /> {talentNetwork.step2.previousButton}
            </>
          )}
        </button>
        <button onClick={onNext} disabled={!valid}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-[16px] text-sm font-semibold text-white transition-[transform,background-color,border-color,color] duration-200 ease-out hover:-translate-y-px active:translate-y-0"
          style={{ background: valid ? "#1D4ED8" : "#CBD5E1", cursor: valid ? "pointer" : "not-allowed", fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)", fontSize: isArabic ? "15px" : undefined }}
          onMouseEnter={(e) => { if (valid) (e.currentTarget as HTMLElement).style.background = "#0B1F4D"; }}
          onMouseLeave={(e) => { if (valid) (e.currentTarget as HTMLElement).style.background = "#1D4ED8"; }}>
          {isArabic ? (
            <>
              <span>{talentNetwork.step2.nextButton}</span>
              <ArrowLeft size={15} />
            </>
          ) : (
            <>
              {talentNetwork.step2.nextButton} <ArrowRight size={15} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Step 3 ─── */
function Step3Form({ data, onChange, onFileChange, onPrev, onSubmit, submitting, submitError, validationMessages, fileError }: {
  data: Step3;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onFileChange: (f: File | null) => void;
  onPrev: () => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError: string | null;
  validationMessages: string[];
  fileError: string | null;
}) {
  const { talentNetwork } = useTranslation();
  const { language } = useLanguage();
  const isArabic = language === "ar";
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
        <h2 style={{ fontSize: isArabic ? "1.625rem" : "1.5rem", fontWeight: 800, color: "#0B1F4D", letterSpacing: "-0.02em", fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)" }}>{talentNetwork.step3.title}</h2>
        <p className="mt-1 text-sm" style={{ color: "#64748B", fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)", fontSize: isArabic ? "0.95rem" : undefined }}>{talentNetwork.step3.description}</p>
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
          dir={isArabic ? "rtl" : "ltr"}
          style={{ ...S.input, resize: "vertical", lineHeight: 1.65, boxSizing: "border-box", fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)", fontSize: isArabic ? "0.95rem" : S.input.fontSize, textAlign: isArabic ? "right" : "left" }}
          onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
          onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
        />
      </Field>

      {/* CV Dropzone */}
      <div>
        <label className="mb-[6px] block text-[12px] font-semibold tracking-[0.02em] text-slate-500" style={{ fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)", fontSize: isArabic ? "13px" : undefined }}>
          {talentNetwork.step3.fields.cvUpload} <span style={{ color: "#1D4ED8" }}>*</span>
        </label>
        <div
          className="relative mt-2 flex min-h-[176px] flex-col items-center justify-center gap-3 rounded-xl px-4 py-6 text-center transition-all duration-150 sm:mt-3 sm:min-h-[220px] sm:gap-4 sm:p-10"
          style={{
            border: `1.5px dashed ${dragOver ? "#1D4ED8" : data.cvFile ? "#0B1F4D" : "#BFDBFE"}`,
            background: dragOver ? "#EFF6FF" : data.cvFile ? "#F0F9FF" : "#F8FAFC",
          }}
          role="button"
          tabIndex={0}
          aria-label={talentNetwork.step3.fields.cvUpload}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              fileRef.current?.click();
            }
          }}
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
                <div className="break-words text-sm font-semibold" style={{ color: "#0B1F4D", fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)", fontSize: isArabic ? "15px" : undefined }}>{data.cvFile.name}</div>
                <div className="text-xs mt-0.5" style={{ color: "#64748B", fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)", fontSize: isArabic ? "13px" : undefined }}>
                  {(data.cvFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onFileChange(null); }}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-[transform,border-color,color,background-color] duration-200 ease-out hover:-translate-y-px active:translate-y-0"
                style={{ color: "#64748B", border: "1px solid #E2E8F0", fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)", fontSize: isArabic ? "13px" : undefined }}
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
                <div className="text-sm font-semibold leading-5 sm:leading-normal" style={{ color: "#0B1F4D", fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)", fontSize: isArabic ? "15px" : undefined }}>
                  {talentNetwork.step3.emptyStateTitle}
                </div>
                <div className="mt-1 text-xs leading-5 sm:mt-1.5" style={{ color: "#94A3B8", fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)", fontSize: isArabic ? "13px" : undefined }}>
                  {talentNetwork.step3.emptyStateDescription}
                </div>
              </div>
            </div>
          )}
        </div>
        {fileError ? (
          <p className="mt-2 text-sm" style={{ color: "#DC2626" }}>
            {fileError}
          </p>
        ) : null}
      </div>

      {(submitError || validationMessages.length > 0) ? (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ border: "1px solid #FECACA", background: "#FEF2F2", color: "#991B1B" }}
        >
          {submitError ? <p>{submitError}</p> : null}
          {validationMessages.length > 0 ? (
            <ul className="mt-2 list-disc ps-5">
              {validationMessages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-stretch gap-2.5 pt-1 sm:flex-nowrap sm:justify-between sm:gap-3 sm:pt-2">
        <button onClick={onPrev}
          className="inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-[16px] border px-4 text-center text-sm font-medium whitespace-nowrap transition-[transform,border-color,color,background-color] duration-200 ease-out hover:-translate-y-px active:translate-y-0 sm:flex-none sm:px-6"
          style={{ borderColor: "#E2E8F0", color: "#64748B", fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)", fontSize: isArabic ? "15px" : undefined }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#0B1F4D"; (e.currentTarget as HTMLElement).style.color = "#0B1F4D"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLElement).style.color = "#64748B"; }}>
          {isArabic ? (
            <>
              <ArrowRight size={15} />
              <span>{talentNetwork.step3.previousButton}</span>
            </>
          ) : (
            <>
              <ChevronLeft size={15} /> {talentNetwork.step3.previousButton}
            </>
          )}
        </button>
        <button onClick={onSubmit} disabled={!canSubmit}
          className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-[16px] px-4 py-3 text-center text-sm font-semibold text-white whitespace-normal break-words transition-[transform,background-color,border-color,color] duration-200 ease-out hover:-translate-y-px active:translate-y-0 sm:flex-none sm:px-8"
          style={{
            background: canSubmit ? "#0B1F4D" : "#CBD5E1",
            cursor: canSubmit ? "pointer" : "not-allowed",
            fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)",
            fontSize: isArabic ? "15px" : undefined,
          }}
          onMouseEnter={(e) => { if (canSubmit) (e.currentTarget as HTMLElement).style.background = "#1D4ED8"; }}
          onMouseLeave={(e) => { if (canSubmit) (e.currentTarget as HTMLElement).style.background = "#0B1F4D"; }}>
          {submitting ? talentNetwork.step3.submittingLabel : isArabic ? (
            <>
              <span className="sm:hidden">{talentNetwork.step3.submitButtonMobile}</span>
              <span className="hidden sm:inline">{talentNetwork.step3.submitButtonDesktop}</span>
              <ArrowLeft className="shrink-0" size={15} />
            </>
          ) : (
            <>
              <span className="sm:hidden">{talentNetwork.step3.submitButtonMobile}</span>
              <span className="hidden sm:inline">{talentNetwork.step3.submitButtonDesktop}</span>
              <ArrowRight className="shrink-0" size={15} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Success screen ─── */
function SuccessScreen() {
  const { talentNetwork } = useTranslation();
  const { language } = useLanguage();
  const isArabic = language === "ar";
  return (
    <div className="flex flex-col items-center text-center py-16 gap-6 max-w-md mx-auto">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
        <CheckCircle2 size={36} style={{ color: "#1D4ED8" }} />
      </div>
      <div>
        <h2 style={{ fontSize: isArabic ? "1.875rem" : "1.75rem", fontWeight: 800, color: "#0B1F4D", letterSpacing: "-0.02em", fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)" }}>{talentNetwork.success.title}</h2>
        <p className="mt-3 text-base leading-relaxed" style={{ color: "#64748B", fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)", fontSize: isArabic ? "1.05rem" : undefined }}>
          {talentNetwork.success.description}
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-xs pt-2">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[16px] text-sm font-semibold text-white transition-[transform,background-color,border-color,color] duration-200 ease-out hover:-translate-y-px active:translate-y-0"
          style={{ background: "#0B1F4D", fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)", fontSize: isArabic ? "15px" : undefined }}
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
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [step, setStep]           = useState<1 | 2 | 3>(1);
  const [done, setDone]           = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const [s1, setS1] = useState<Step1>({ fullName: "", email: "", phone: "", nationality: "", currentCountry: "", currentCity: "" });
  const [s2, setS2] = useState<Step2>({ jobTitle: "", industry: "", yearsExperience: "", expectedSalary: "", employmentType: [] });
  const [s3, setS3] = useState<Step3>({ preferredCountry: "", englishLevel: "", linkedinUrl: "", notes: "", cvFile: null });

  const clearSubmissionFeedback = () => {
    setSubmitError(null);
    setValidationMessages([]);
  };

  const onChange1 = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    clearSubmissionFeedback();
    setS1((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const onChange2 = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    clearSubmissionFeedback();
    setS2((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const onEmploymentTypeToggle = (value: string) => {
    clearSubmissionFeedback();
    setS2((current) => ({
      ...current,
      employmentType: current.employmentType.includes(value)
        ? current.employmentType.filter((item) => item !== value)
        : [...current.employmentType, value],
    }));
  };

  const onChange3 = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    clearSubmissionFeedback();
    setS3((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const onFileChange = (file: File | null) => {
    clearSubmissionFeedback();

    if (!file) {
      setFileError(null);
      setS3((p) => ({ ...p, cvFile: null }));
      return;
    }

    if (!isAllowedCvFile(file)) {
      setFileError("Please upload a PDF, DOC, or DOCX file.");
      setS3((p) => ({ ...p, cvFile: null }));
      return;
    }

    if (file.size > MAX_CV_SIZE_BYTES) {
      setFileError("Please upload a CV file smaller than 5 MB.");
      setS3((p) => ({ ...p, cvFile: null }));
      return;
    }

    if (file.size === 0) {
      setFileError("Please upload a valid non-empty CV file.");
      setS3((p) => ({ ...p, cvFile: null }));
      return;
    }

    setFileError(null);
    setS3((p) => ({ ...p, cvFile: file }));
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    if (window.location.hash === "#application-start") {
      requestAnimationFrame(() => {
        document.getElementById("application-start")?.scrollIntoView({ block: "start" });
      });
    }
  }, []);

  const handleSubmit = async () => {
    if (!s3.cvFile || submitting) return;

    clearSubmissionFeedback();
    setSubmitting(true);

    try {
      await submitTalentNetworkApplication({
        FullName: s1.fullName,
        Email: s1.email,
        MobileNumber: s1.phone,
        Nationality: s1.nationality,
        CurrentCountry: s1.currentCountry,
        CurrentCity: s1.currentCity,
        CurrentJobTitle: s2.jobTitle,
        YearsOfExperience: s2.yearsExperience,
        Industry: s2.industry,
        ExpectedSalary: s2.expectedSalary,
        EmploymentType: s2.employmentType,
        PreferredWorkCountry: s3.preferredCountry,
        EnglishLevel: s3.englishLevel,
        AvailableToRelocate: s1.currentCountry !== s3.preferredCountry ? "Yes" : "No",
        LinkedInProfile: s3.linkedinUrl,
        AdditionalNotes: s3.notes,
        CvFile: s3.cvFile,
      });

      setDone(true);
    } catch (error) {
      const { message, validationMessages: nextValidationMessages } = getAxiosErrorDetails(
        error,
        "Something went wrong while submitting your application. Please try again.",
      );
      setSubmitError(message);
      setValidationMessages(nextValidationMessages);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)", background: "#F8F9FA", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

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
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{
                  color: "#1D4ED8",
                  fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)",
                  fontSize: isArabic ? "13px" : undefined,
                }}
              >
                {talentNetwork.page.eyebrow}
              </span>
              <h1
                className="mt-2"
                style={{
                  fontSize: isArabic ? "clamp(1.95rem, 4.2vw, 2.45rem)" : "clamp(1.75rem, 4vw, 2.25rem)",
                  fontWeight: 800,
                  color: "#0B1F4D",
                  letterSpacing: "-0.025em",
                  fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)",
                }}
              >
                {talentNetwork.page.title}
              </h1>
              <p
                className="mt-2 text-sm"
                style={{
                  color: "#64748B",
                  fontFamily: isArabic ? "'Cairo', system-ui, sans-serif" : "var(--font-family-app)",
                  fontSize: isArabic ? "1rem" : undefined,
                }}
              >
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
              <Step2Form data={s2} onChange={onChange2} onEmploymentTypeToggle={onEmploymentTypeToggle} onNext={() => setStep(3)} onPrev={() => setStep(1)} />
            ) : (
              <Step3Form
                data={s3}
                onChange={onChange3}
                onFileChange={onFileChange}
                onPrev={() => setStep(2)}
                onSubmit={handleSubmit}
                submitting={submitting}
                submitError={submitError}
                validationMessages={validationMessages}
                fileError={fileError}
              />
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
