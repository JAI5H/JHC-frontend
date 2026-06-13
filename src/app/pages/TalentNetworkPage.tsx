import { useState, useRef } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight, Upload, FileText, CheckCircle2, ChevronLeft, X, MapPin, Phone, Mail } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import jhcLogo from "figma:asset/jhc-logo.png";

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
  label: {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#64748B",
    marginBottom: "6px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.07em",
  } as React.CSSProperties,
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
    fontFamily: "'Inter', system-ui, sans-serif",
  } as React.CSSProperties,
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={S.label}>{label}{required && <span style={{ color: "#1D4ED8" }}> *</span>}</label>
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
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      style={{ ...S.input, cursor: "pointer", appearance: "none" }}
      onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
      onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
    >
      <option value="">{placeholder || "Select…"}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

/* ─── Step indicators ─── */
function StepBar({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { num: "01", label: "Personal Information" },
    { num: "02", label: "Professional Experience" },
    { num: "03", label: "Preferences & Attachments" },
  ];
  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((s, i) => {
        const idx = i + 1;
        const done    = idx < current;
        const active  = idx === current;
        return (
          <div key={s.num} className="flex items-center flex-1">
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Circle */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{
                  background: done ? "#0B1F4D" : active ? "#1D4ED8" : "#F1F5F9",
                  border: done || active ? "none" : "1px solid #E2E8F0",
                }}
              >
                {done
                  ? <CheckCircle2 size={16} style={{ color: "#60A5FA" }} />
                  : <span className="text-xs font-black" style={{ color: active ? "#ffffff" : "#94A3B8" }}>{s.num}</span>
                }
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold uppercase tracking-wide" style={{ color: active ? "#0B1F4D" : done ? "#64748B" : "#94A3B8" }}>
                  Step {s.num}
                </div>
                <div className="text-xs" style={{ color: active ? "#1D4ED8" : "#94A3B8" }}>{s.label}</div>
              </div>
            </div>
            {/* Connector */}
            {i < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div className="h-0.5 rounded-full" style={{ background: done ? "#0B1F4D" : "#E2E8F0" }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Step 1 ─── */
function Step1Form({ data, onChange, onNext }: { data: Step1; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; onNext: () => void }) {
  const valid = data.fullName && data.email && data.phone && data.nationality && data.currentCountry && data.currentCity;
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0B1F4D", letterSpacing: "-0.02em" }}>Personal Information</h2>
        <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Tell us about yourself so we can match you with the right opportunities.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Full Name" required>
          <Input name="fullName" value={data.fullName} onChange={onChange} placeholder="Write your full name as in passport" />
        </Field>
        <Field label="Email Address" required>
          <Input name="email" value={data.email} onChange={onChange} type="email" placeholder="example@domain.com" />
        </Field>
        <Field label="Phone Number" required>
          <Input name="phone" value={data.phone} onChange={onChange} type="tel" placeholder="+966 5X XXX XXXX" />
        </Field>
        <Field label="Nationality" required>
          <Select name="nationality" value={data.nationality} onChange={onChange} options={NATIONALITIES} placeholder="Select your nationality" />
        </Field>
        <Field label="Current Country" required>
          <Select name="currentCountry" value={data.currentCountry} onChange={onChange} options={COUNTRIES} placeholder="Select your current country" />
        </Field>
        <Field label="Current City" required>
          <Input name="currentCity" value={data.currentCity} onChange={onChange} placeholder="e.g., Riyadh or Cairo" />
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
          Next Step <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

/* ─── Step 2 ─── */
function Step2Form({ data, onChange, onNext, onPrev }: { data: Step2; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; onNext: () => void; onPrev: () => void }) {
  const valid = data.jobTitle && data.industry && data.yearsExperience && data.expectedSalary && data.employmentType;
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0B1F4D", letterSpacing: "-0.02em" }}>Professional Experience</h2>
        <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Share your professional background and work preferences.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Current Job Title" required>
          <Input name="jobTitle" value={data.jobTitle} onChange={onChange} placeholder="e.g., UI/UX Designer or Operations Lead" />
        </Field>
        <Field label="Industry / Sector" required>
          <Select name="industry" value={data.industry} onChange={onChange} options={INDUSTRIES} placeholder="Select your industry" />
        </Field>
        <Field label="Years of Experience" required>
          <Input name="yearsExperience" value={data.yearsExperience} onChange={onChange} type="number" placeholder="e.g., 5" />
        </Field>
        <Field label="Expected Monthly Salary (USD)" required>
          <Input name="expectedSalary" value={data.expectedSalary} onChange={onChange} placeholder="Amount in USD" />
        </Field>
      </div>

      {/* Employment type radio group */}
      <Field label="Preferred Employment Type" required>
        <div className="grid sm:grid-cols-3 gap-3 mt-1">
          {[
            { value: "remote", label: "Remote Full-Time", desc: "Work from anywhere" },
            { value: "local",  label: "Local Full-Time",  desc: "On-site at client" },
            { value: "project",label: "Project-Based Contract", desc: "Fixed-scope engagements" },
          ].map((opt) => {
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
          <ChevronLeft size={15} /> Previous
        </button>
        <button onClick={onNext} disabled={!valid}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150"
          style={{ background: valid ? "#1D4ED8" : "#CBD5E1", cursor: valid ? "pointer" : "not-allowed" }}
          onMouseEnter={(e) => { if (valid) (e.currentTarget as HTMLElement).style.background = "#0B1F4D"; }}
          onMouseLeave={(e) => { if (valid) (e.currentTarget as HTMLElement).style.background = "#1D4ED8"; }}>
          Next Step <ArrowRight size={15} />
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
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileChange(file);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0B1F4D", letterSpacing: "-0.02em" }}>Preferences & Attachments</h2>
        <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Final details and your CV to complete your application.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Preferred Work Country" required>
          <Select name="preferredCountry" value={data.preferredCountry} onChange={onChange} options={COUNTRIES} placeholder="Select preferred country" />
        </Field>
        <Field label="English Proficiency Level" required>
          <Select name="englishLevel" value={data.englishLevel} onChange={onChange} options={ENG_LEVELS} placeholder="Select proficiency" />
        </Field>
        <Field label="LinkedIn Profile URL">
          <Input name="linkedinUrl" value={data.linkedinUrl} onChange={onChange} placeholder="https://linkedin.com/in/yourprofile" />
        </Field>
      </div>

      <Field label="Additional Notes">
        <textarea
          name="notes"
          value={data.notes}
          onChange={onChange}
          rows={4}
          placeholder="Any additional context about your background, availability, or specific interests…"
          style={{ ...S.input, resize: "vertical", lineHeight: 1.65 }}
          onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
          onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
        />
      </Field>

      {/* CV Dropzone */}
      <div>
        <label style={S.label}>CV / Resume Upload <span style={{ color: "#1D4ED8" }}>*</span></label>
        <div
          className="relative flex flex-col items-center justify-center gap-4 rounded-xl p-10 text-center cursor-pointer transition-all duration-150"
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
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#EFF6FF" }}>
                <FileText size={22} style={{ color: "#1D4ED8" }} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: "#0B1F4D" }}>{data.cvFile.name}</div>
                <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                  {(data.cvFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onFileChange(null); }}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: "#64748B", border: "1px solid #E2E8F0" }}
              >
                <X size={12} /> Remove file
              </button>
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
                <Upload size={24} style={{ color: "#1D4ED8" }} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: "#0B1F4D" }}>
                  Drag & drop your CV file here, or click to browse
                </div>
                <div className="text-xs mt-1.5" style={{ color: "#94A3B8" }}>
                  Supported formats: PDF, DOC, DOCX — up to 5 MB maximum
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={onPrev}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border transition-colors"
          style={{ borderColor: "#E2E8F0", color: "#64748B" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#0B1F4D"; (e.currentTarget as HTMLElement).style.color = "#0B1F4D"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLElement).style.color = "#64748B"; }}>
          <ChevronLeft size={15} /> Previous
        </button>
        <button onClick={onSubmit} disabled={!data.preferredCountry || !data.englishLevel || !data.cvFile || submitting}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150"
          style={{
            background: (!data.preferredCountry || !data.englishLevel || !data.cvFile || submitting) ? "#CBD5E1" : "#0B1F4D",
            cursor: (!data.preferredCountry || !data.englishLevel || !data.cvFile || submitting) ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => { if (data.preferredCountry && data.englishLevel && data.cvFile && !submitting) (e.currentTarget as HTMLElement).style.background = "#1D4ED8"; }}
          onMouseLeave={(e) => { if (data.preferredCountry && data.englishLevel && data.cvFile && !submitting) (e.currentTarget as HTMLElement).style.background = "#0B1F4D"; }}>
          {submitting ? "Submitting…" : <>Submit Application <ArrowRight size={15} /></>}
        </button>
      </div>
    </div>
  );
}

/* ─── Success screen ─── */
function SuccessScreen() {
  return (
    <div className="flex flex-col items-center text-center py-16 gap-6 max-w-md mx-auto">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
        <CheckCircle2 size={36} style={{ color: "#1D4ED8" }} />
      </div>
      <div>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0B1F4D", letterSpacing: "-0.02em" }}>Application Submitted!</h2>
        <p className="mt-3 text-base leading-relaxed" style={{ color: "#64748B" }}>
          Thank you for joining the JHC Talent Network. Our team will review your profile and reach out within 3–5 business days.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-xs pt-2">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ background: "#0B1F4D" }}
        >
          Back to Main Site
        </Link>
      </div>
    </div>
  );
}

/* ═══════════════════ MAIN PAGE ═══════════════════ */
export default function TalentNetworkPage() {
  const [step, setStep]           = useState<1 | 2 | 3>(1);
  const [done, setDone]           = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [s1, setS1] = useState<Step1>({ fullName: "", email: "", phone: "", nationality: "", currentCountry: "", currentCity: "" });
  const [s2, setS2] = useState<Step2>({ jobTitle: "", industry: "", yearsExperience: "", expectedSalary: "", employmentType: "" });
  const [s3, setS3] = useState<Step3>({ preferredCountry: "", englishLevel: "", linkedinUrl: "", notes: "", cvFile: null });

  const onChange1 = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setS1((p) => ({ ...p, [e.target.name]: e.target.value }));
  const onChange2 = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setS2((p) => ({ ...p, [e.target.name]: e.target.value }));
  const onChange3 = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setS3((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setDone(true); }, 1600);
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#F8F9FA", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white" style={{ borderBottom: "1px solid #E2E8F0" }}>
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between" style={{ height: "64px" }}>
          <div className="flex items-center gap-6">
            <ImageWithFallback src={jhcLogo} alt="JHC" className="h-8 w-auto object-contain" />
            <div className="hidden sm:block w-px h-5" style={{ background: "#E2E8F0" }} />
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: "#64748B" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#0B1F4D")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#64748B")}
            >
              <ArrowLeft size={14} /> Back to Main Site
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-xs font-semibold uppercase tracking-widest" style={{ color: "#94A3B8" }}>
              Talent Network
            </span>
            <Link
              to="/#contact"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"
              style={{ borderColor: "#E2E8F0", color: "#0B1F4D" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#0B1F4D"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; }}
            >
              For Businesses
            </Link>
          </div>
        </div>
      </header>

      {/* ── Page body ── */}
      <main className="flex-1 py-10 px-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">

          {/* Page title */}
          {!done && (
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#1D4ED8" }}>JHC Talent Network</span>
              <h1 className="mt-2" style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "#0B1F4D", letterSpacing: "-0.025em" }}>
                Join Our Talent Network
              </h1>
              <p className="mt-2 text-sm" style={{ color: "#64748B" }}>
                Complete your profile in 3 steps and get matched with enterprise opportunities across the GCC.
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

      {/* ── Sticky Footer ── */}
      <footer style={{ background: "#ffffff", borderTop: "1px solid #E2E8F0" }}>
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: "#94A3B8" }}>
            © 2026 JHC – Jisr Human Capital. All Rights Reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "#64748B" }}>
              <MapPin size={11} style={{ color: "#1D4ED8" }} />
              New Cairo, Egypt
              <span style={{ color: "#CBD5E1", margin: "0 4px" }}>·</span>
              <Phone size={11} style={{ color: "#1D4ED8" }} />
              +20 100 000 0000
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "#64748B" }}>
              <MapPin size={11} style={{ color: "#1D4ED8" }} />
              Riyadh, Saudi Arabia
              <span style={{ color: "#CBD5E1", margin: "0 4px" }}>·</span>
              <Phone size={11} style={{ color: "#1D4ED8" }} />
              +966 11 234 5678
            </div>
            <a href="mailto:talent@jhc-group.com" className="flex items-center gap-1.5 text-xs transition-colors" style={{ color: "#64748B" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#1D4ED8")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#64748B")}>
              <Mail size={11} style={{ color: "#1D4ED8" }} />
              talent@jhc-group.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
