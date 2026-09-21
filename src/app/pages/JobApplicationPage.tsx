import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  DollarSign,
  FileText,
  GraduationCap,
  MapPin,
  Share2,
  Upload,
  X,
} from "lucide-react";
import { ImageWithFallback } from "../components/shared/ImageWithFallback";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useLanguage } from "../providers/LanguageProvider";
import jhcLogo from "../../imgs/logo.png";
import { formatJobSalary, getPublicJobBySlug, splitJobSkills, type JobRecord } from "../../services/api/jobsApi";
import { submitJobApplication, type ReadyToStart } from "../../services/api/jobApplicationsApi";
import { getAxiosErrorDetails, getAxiosErrorMessage, isRequestCanceled } from "../../services/api/utils";
import { talentNetwork } from "../../locales/en/talentNetwork";
import { talentNetwork as arabicTalentNetwork } from "../../locales/ar/talentNetwork";

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_CV_EXTENSIONS = [".pdf", ".doc", ".docx"];
const ALLOWED_CV_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const SALARY_CURRENCIES = [
  { code: "EGP", label: "Egyptian Pound" },
  { code: "SAR", label: "Saudi Riyal" },
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "AED", label: "UAE Dirham" },
  { code: "QAR", label: "Qatari Riyal" },
  { code: "KWD", label: "Kuwaiti Dinar" },
  { code: "BHD", label: "Bahraini Dinar" },
  { code: "OMR", label: "Omani Rial" },
];

function isDeadlinePast(value: string | null) {
  if (!value) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed < new Date();
}

type FormState = {
  name: string;
  age: string;
  nationality: string;
  experience: string;
  readyToStart: ReadyToStart;
  expectedSalary: string;
  expectedSalaryCurrency: string;
  additionalNotes: string;
};

type FormErrors = Partial<Record<keyof FormState | "cv", string>>;
type FieldKey = keyof FormState | "cv";

const inputSt: React.CSSProperties = {
  width: "100%",
  minHeight: "52px",
  padding: "13px 16px",
  borderRadius: "12px",
  border: "1px solid #E2E8F0",
  background: "#ffffff",
  fontSize: "0.95rem",
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

function getFileTypeLabel(file: File) {
  const extension = file.name.split(".").pop()?.toUpperCase();
  return extension ? `${extension} file` : "Selected file";
}

function DetailItem({
  icon,
  label,
  value,
  muted,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: "#EFF6FF", color: "#60A5FA" }}>
        {icon}
      </span>
      <span>
        <span className="block text-xs font-semibold" style={{ color: "#94A3B8" }}>{label}</span>
        <span className="mt-0.5 block text-sm font-bold" style={{ color: muted ? "#64748B" : "#0B1F4D" }}>{value}</span>
      </span>
    </div>
  );
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
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [job, setJob] = useState<JobRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">("idle");
  const [pageError, setPageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [focusedField, setFocusedField] = useState<FieldKey | null>(null);
  const [dragging, setDragging] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    age: "",
    nationality: "",
    experience: "",
    readyToStart: "Yes",
    expectedSalary: "",
    expectedSalaryCurrency: "",
    additionalNotes: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);

  const skills = useMemo(() => splitJobSkills(job?.skills), [job?.skills]);
  const salaryLabel = job ? formatJobSalary(job) : "";
  const deadlinePast = isDeadlinePast(job?.applicationDeadline ?? null);
  const isClosed = job?.status === "Closed";
  const canApply = Boolean(job && !isClosed && !deadlinePast);
  const isArabic = language === "ar";
  const heroTextStyle = isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined;
  const nationalityOptions = isArabic
    ? arabicTalentNetwork.options.nationalities
    : talentNetwork.options.nationalities.map((option) => ({ value: option, label: option }));
  const readyToStartLabels: Record<ReadyToStart, string> = isArabic
    ? { Yes: "نعم", No: "لا", Other: "أخرى" }
    : { Yes: "Yes", No: "No", Other: "Other" };
  const missingValueLabel = isArabic ? "غير محدد" : "Not specified";
  const copy = isArabic
    ? {
        navJobDetails: "تفاصيل الوظيفة",
        jobNotFound: "لم يتم العثور على الوظيفة",
        jobNotFoundDescription: "قد تكون هذه الوظيفة غير متاحة أو تم حذفها.",
        backToCareers: "العودة إلى الوظائف",
        successTitle: "تم تقديم الطلب بنجاح",
        successDescription: `شكرًا لتقديمك على وظيفة ${job?.title ?? ""}. تم استلام طلبك بنجاح.`,
        backToJob: "العودة إلى الوظيفة",
        formTitle: "قدّم على هذه الوظيفة",
        personalTitle: "المعلومات الشخصية",
        personalDescription: "",
        professionalTitle: "المعلومات المهنية",
        professionalDescription: "",
        additionalTitle: "",
        additionalDescription: "",
        uploadTitle: "ارفع سيرتك الذاتية",
        uploadDescription: "PDF / DOC / DOCX. الحد الأقصى لحجم الملف 5 ميجابايت.",
        submitNote: "",
        submit: "إرسال الطلب",
        submitting: "جاري الإرسال...",
        cancel: "إلغاء الطلب",
        share: "مشاركة هذه الوظيفة",
        copied: "تم نسخ رابط الوظيفة",
        positionDetails: "تفاصيل الوظيفة",
        location: "الموقع",
        employmentType: "نوع التوظيف",
        experience: "الخبرة",
        salary: "الراتب",
        keySkills: "المهارات الرئيسية",
        noSkills: "لا توجد مهارات رئيسية مدرجة.",
        fields: {
          name: "الاسم",
          age: "العمر",
          nationality: "الجنسية",
          experience: "سنوات الخبرة",
          readyToStart: "جاهز للبدء",
          expectedSalary: "الراتب المتوقع",
          additionalNotes: "ملاحظات إضافية",
        },
        placeholders: {
          name: "اكتب اسمك الكامل",
          age: "اكتب عمرك",
          nationality: "اختر جنسيتك",
          experience: "مثال: 5",
          expectedSalary: "اكتب المبلغ المتوقع",
          currency: "العملة",
          additionalNotes: "أضف أي ملاحظات ذات صلة",
        },
        cvIdle: "انقر أو اسحب سيرتك الذاتية هنا",
        removeFile: "إزالة الملف",
        errors: {
          name: "الاسم مطلوب.",
          ageRequired: "العمر مطلوب.",
          ageInvalid: "أدخل عمرًا رقميًا صحيحًا.",
          nationality: "الجنسية مطلوبة.",
          experience: "الخبرة مطلوبة.",
          salaryInvalid: "أدخل راتبًا متوقعًا رقميًا صحيحًا.",
          salaryCurrency: "اختر عملة للراتب المتوقع.",
          cvRequired: "ملف السيرة الذاتية مطلوب.",
          cvType: "يرجى رفع ملف PDF أو DOC أو DOCX.",
          cvSize: "يرجى رفع ملف سيرة ذاتية أصغر من 5 ميجابايت.",
          cvEmpty: "يرجى رفع ملف سيرة ذاتية صالح وغير فارغ.",
        },
      }
    : {
        navJobDetails: "Job Details",
        jobNotFound: "Job not found",
        jobNotFoundDescription: "This job may have been removed.",
        backToCareers: "Back to Careers",
        successTitle: "Application submitted successfully",
        successDescription: `Thank you for applying to ${job?.title ?? ""}. Your application has been received successfully.`,
        backToJob: "Back to Job",
        formTitle: "Apply for this Position",
        personalTitle: "Personal information",
        personalDescription: "Tell us who you are so the recruitment team can review your application accurately.",
        professionalTitle: "Professional information",
        professionalDescription: "Share your availability, experience, and salary expectation for this role.",
        additionalTitle: "Additional information",
        additionalDescription: "Add anything else that can help JHC understand your fit for this opportunity.",
        uploadTitle: "Upload your CV",
        uploadDescription: "PDF / DOC / DOCX. Maximum file size is 5 MB.",
        submitNote: "Review your details, then submit your application to JHC.",
        submit: "Submit Application",
        submitting: "Submitting...",
        cancel: "Cancel Application",
        share: "Share This Job",
        copied: "Job link copied",
        positionDetails: "Position Details",
        location: "Location",
        employmentType: "Employment Type",
        experience: "Experience",
        salary: "Salary",
        keySkills: "Key Skills",
        noSkills: "No key skills listed.",
        fields: {
          name: "Name",
          age: "Age",
          nationality: "Nationality",
          experience: "Experience",
          readyToStart: "Ready To Start",
          expectedSalary: "Expected Salary",
          additionalNotes: "Additional Notes",
        },
        placeholders: {
          name: "Enter your full name",
          age: "Enter your age",
          nationality: "Select your nationality",
          experience: "e.g. 5",
          expectedSalary: "Enter expected amount",
          currency: "Currency",
          additionalNotes: "Add any relevant notes",
        },
        cvIdle: "Click or drag your CV here",
        removeFile: "Remove file",
        errors: {
          name: "Name is required.",
          ageRequired: "Age is required.",
          ageInvalid: "Enter a valid numeric age.",
          nationality: "Nationality is required.",
          experience: "Experience is required.",
          salaryInvalid: "Enter a valid numeric expected salary.",
          salaryCurrency: "Select a currency for your expected salary.",
          cvRequired: "CV file is required.",
          cvType: "Please upload a PDF, DOC, or DOCX file.",
          cvSize: "Please upload a CV file smaller than 5 MB.",
          cvEmpty: "Please upload a valid non-empty CV file.",
        },
      };

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

  const getFieldError = (field: FieldKey, currentForm = form, currentCvFile = cvFile) => {
    const ageNumber = Number(currentForm.age);
    const salaryNumber = Number(currentForm.expectedSalary);

    if (field === "name" && !currentForm.name.trim()) return copy.errors.name;
    if (field === "age") {
      if (!currentForm.age.trim()) return copy.errors.ageRequired;
      if (!Number.isInteger(ageNumber) || ageNumber <= 0) return copy.errors.ageInvalid;
    }
    if (field === "nationality" && !currentForm.nationality.trim()) return copy.errors.nationality;
    if (field === "experience" && !currentForm.experience.trim()) return copy.errors.experience;
    if (field === "expectedSalary") {
      if (!currentForm.expectedSalary.trim()) return undefined;
      if (!Number.isFinite(salaryNumber) || salaryNumber < 0) return copy.errors.salaryInvalid;
      if (!currentForm.expectedSalaryCurrency) return copy.errors.salaryCurrency;
    }
    if (field === "expectedSalaryCurrency" && currentForm.expectedSalary.trim() && !currentForm.expectedSalaryCurrency) {
      return copy.errors.salaryCurrency;
    }
    if (field === "cv" && !currentCvFile) return copy.errors.cvRequired;
    return undefined;
  };

  const markFieldTouched = (field: FieldKey) => {
    setTouchedFields((current) => ({ ...current, [field]: true }));
    setFormErrors((current) => ({ ...current, [field]: getFieldError(field) }));
  };

  const updateForm = (field: keyof FormState, value: string) => {
    clearSubmissionFeedback();
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (touchedFields[field]) {
        setFormErrors((errors) => ({ ...errors, [field]: getFieldError(field, next) }));
      } else {
        setFormErrors((errors) => ({ ...errors, [field]: undefined }));
      }
      if (field === "expectedSalary" && !value.trim()) {
        setFormErrors((errors) => ({ ...errors, expectedSalary: undefined, expectedSalaryCurrency: undefined }));
      }
      if (field === "expectedSalaryCurrency" && value) {
        setFormErrors((errors) => ({ ...errors, expectedSalaryCurrency: undefined }));
      }
      return next;
    });
  };

  const getControlStyle = (field: FieldKey): React.CSSProperties => {
    const hasError = Boolean(formErrors[field]);
    const isFocused = focusedField === field;
    const isFilled = field === "cv" ? Boolean(cvFile) : Boolean(String(form[field as keyof FormState] ?? "").trim());

    return {
      ...inputSt,
      borderColor: hasError ? "#FCA5A5" : isFocused ? "#60A5FA" : touchedFields[field] && isFilled ? "#86EFAC" : "#E2E8F0",
      boxShadow: isFocused ? "0 0 0 4px rgba(96,165,250,0.18)" : "none",
    };
  };

  const handleFile = (file: File | null) => {
    clearSubmissionFeedback();
    setTouchedFields((current) => ({ ...current, cv: true }));

    if (!file) {
      setFormErrors((current) => ({ ...current, cv: copy.errors.cvRequired }));
      setCvFile(null);
      return;
    }

    if (!isAllowedCvFile(file)) {
      setFormErrors((current) => ({ ...current, cv: copy.errors.cvType }));
      setCvFile(null);
      return;
    }

    if (file.size > MAX_CV_SIZE_BYTES) {
      setFormErrors((current) => ({ ...current, cv: copy.errors.cvSize }));
      setCvFile(null);
      return;
    }

    if (file.size === 0) {
      setFormErrors((current) => ({ ...current, cv: copy.errors.cvEmpty }));
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

    if (!form.name.trim()) nextErrors.name = copy.errors.name;
    if (!form.age.trim()) {
      nextErrors.age = copy.errors.ageRequired;
    } else if (!Number.isInteger(ageNumber) || ageNumber <= 0) {
      nextErrors.age = copy.errors.ageInvalid;
    }
    if (!form.nationality.trim()) nextErrors.nationality = copy.errors.nationality;
    if (!form.experience.trim()) nextErrors.experience = copy.errors.experience;
    if (form.expectedSalary.trim() && (!Number.isFinite(salaryNumber) || salaryNumber < 0)) {
      nextErrors.expectedSalary = copy.errors.salaryInvalid;
    }
    if (form.expectedSalary.trim() && !form.expectedSalaryCurrency) {
      nextErrors.expectedSalaryCurrency = copy.errors.salaryCurrency;
    }
    if (!cvFile) nextErrors.cv = copy.errors.cvRequired;

    setTouchedFields({
      name: true,
      age: true,
      nationality: true,
      experience: true,
      readyToStart: true,
      expectedSalary: true,
      expectedSalaryCurrency: true,
      additionalNotes: true,
      cv: true,
    });
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!job || submitting || !canApply) return;

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
        expectedSalaryCurrency: form.expectedSalary.trim() ? form.expectedSalaryCurrency : "",
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

  const handleShare = async () => {
    if (!job) return;

    try {
      await navigator.clipboard.writeText(`${window.location.origin}/careers/${job.slug}`);
      setShareState("copied");
    } catch {
      setShareState("error");
    }

    window.setTimeout(() => setShareState("idle"), 2200);
  };

  return (
    <div style={{ fontFamily: "var(--font-family-app)", background: "#F8FAFC", minHeight: "100vh" }}>
      <header className="fixed left-1/2 top-4 z-50 w-[calc(100%-24px)] max-w-[1280px] -translate-x-1/2 md:top-6">
        <div
          className="relative flex h-[72px] items-center justify-between rounded-[23px] px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[18px] md:h-[84px] md:px-[30px]"
          style={{
            border: "1px solid rgba(255,255,255,0.25)",
            background: "linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))",
            WebkitBackdropFilter: "blur(18px)",
          }}
          dir={isArabic ? "rtl" : "ltr"}
        >
          <Link to="/">
            <ImageWithFallback src={jhcLogo} alt="JHC" className="h-[34px] w-auto object-contain md:h-[42px]" />
          </Link>
          <Link
            to={slug ? `/careers/${slug}` : "/careers"}
            className={["inline-flex h-[46px] items-center gap-2 rounded-[16px] border px-4 text-sm font-semibold text-white/90 backdrop-blur-[12px] transition-all hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/10 md:h-[52px] md:px-5", isArabic ? "flex-row-reverse" : ""].join(" ")}
            style={{
              ...heroTextStyle,
              borderColor: "rgba(255,255,255,0.18)",
              background: "linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))",
            }}
          >
            <ArrowLeft size={14} /> {copy.navJobDetails}
          </Link>
        </div>
      </header>

      {isLoading ? (
        <LoadingState />
      ) : pageError || !job ? (
        <main className="mx-auto flex min-h-[74vh] max-w-3xl flex-col items-center justify-center px-6 text-center" dir={isArabic ? "rtl" : "ltr"}>
          <div className="flex h-20 w-20 items-center justify-center rounded-[24px]" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
            <AlertCircle size={34} />
          </div>
          <h1 className="mt-6 text-2xl font-black tracking-[-0.03em]" style={{ color: "#0B1F4D" }}>{copy.jobNotFound}</h1>
          <p className="mt-2 text-sm leading-6" style={{ color: "#64748B" }}>{pageError || copy.jobNotFoundDescription}</p>
          <Link to="/careers" className="mt-7 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white" style={{ background: "#0B1F4D" }}>
            <ArrowLeft size={14} /> {copy.backToCareers}
          </Link>
        </main>
      ) : !canApply ? (
        <Navigate replace to={`/careers/${job.slug}`} />
      ) : done ? (
        <main className="mx-auto grid min-h-screen max-w-4xl place-items-center px-4 py-28 sm:px-6 lg:px-8" dir={isArabic ? "rtl" : "ltr"}>
          <div className="w-full rounded-[28px] bg-white p-7 text-center shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:p-10" style={{ border: "1px solid #E2E8F0" }}>
            <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-[24px]" style={{ background: "#F0FDF4", color: "#0B1F4D" }}>
              <CheckCircle2 size={34} />
            </div>
            <h1 className="mt-6 text-3xl font-black tracking-[-0.035em] sm:text-4xl" style={{ ...heroTextStyle, color: "#0B1F4D" }}>{copy.successTitle}</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7" style={{ color: "#64748B" }}>
              {copy.successDescription}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/careers" className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white" style={{ background: "#0B1F4D" }}>
                {copy.backToCareers}
              </Link>
              <Link to={`/careers/${job.slug}`} className="inline-flex items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>
                {copy.backToJob}
              </Link>
            </div>
          </div>
        </main>
      ) : (
        <main>
          <section className="relative overflow-hidden bg-[#030e26] pb-10 pt-[120px] lg:pb-14 lg:pt-36">
            <div
              aria-hidden="true"
              className="absolute inset-0 hidden opacity-100 md:block"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.0525) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.0525) 1px, transparent 1px)",
                backgroundPosition: "-18px 0",
                backgroundSize: "70px 68.94px",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-100 md:hidden"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.03255) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03255) 1px, transparent 1px)",
                backgroundPosition: "-10px 0",
                backgroundSize: "44px 44px",
              }}
            />
            <div aria-hidden="true" className="absolute inset-0 bg-[rgba(3,14,38,0.58)]" />
            <div aria-hidden="true" className="absolute left-[-8%] top-10 h-72 w-72 rounded-full bg-[#2563eb]/12 blur-[70px]" />
            <div aria-hidden="true" className="absolute right-[6%] top-16 h-64 w-64 rounded-full bg-[#3b82f6]/16 blur-[76px]" />
            <div aria-hidden="true" className="absolute bottom-[-20%] left-[35%] h-72 w-72 rounded-full bg-[#1d4ed8]/10 blur-[86px]" />

            <div className={["relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", isArabic ? "text-right" : ""].join(" ")} dir={isArabic ? "rtl" : "ltr"}>
              <div>
                <div>
                  <h1 className="max-w-4xl text-[2.5rem] font-black leading-[1.02] tracking-[-0.045em] text-white sm:text-[4rem]" style={heroTextStyle}>
                    {isArabic ? "قدّم على هذه الوظيفة" : "Apply for this position"}
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-8 sm:text-lg" style={{ ...heroTextStyle, color: "#b8c1d1" }}>
                    {isArabic ? (
                      <>
                        أكمل طلب التقديم المختصر لوظيفة <strong className="text-white">{job.title}</strong>. سيتم إرسال ملفك الشخصي وسيرتك الذاتية إلى JHC للمراجعة.
                      </>
                    ) : (
                      <>
                        Complete the short application for <strong className="text-white">{job.title}</strong>. Your profile and CV will be sent directly to JHC for review.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit} className={["grid gap-7 lg:grid-cols-[minmax(0,760px)_280px] lg:items-start lg:justify-center xl:grid-cols-[minmax(0,820px)_300px] xl:gap-8", isArabic ? "text-right" : ""].join(" ")} dir={isArabic ? "rtl" : "ltr"} noValidate>
              <div className="overflow-hidden rounded-[24px] bg-white" style={{ border: "1px solid #E2E8F0" }}>
                <div className="border-b p-7 sm:px-8 sm:py-7" style={{ borderColor: "#E2E8F0", background: "#0B1F4D", color: "#ffffff" }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black tracking-[-0.03em]" style={heroTextStyle}>{copy.formTitle}</h2>
                      <p className="mt-1 text-sm font-semibold text-white/72">{job.title}</p>
                    </div>
                    <Link to={`/careers/${job.slug}`} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white/65 transition-colors hover:bg-white/16 hover:text-white" aria-label={copy.cancel}>
                      <X size={17} />
                    </Link>
                  </div>
                </div>

                <div className="space-y-8 p-6 sm:p-8">
                  <section>
                    <h3 className="text-lg font-black tracking-[-0.025em]" style={{ ...heroTextStyle, color: "#0B1F4D" }}>{copy.personalTitle}</h3>
                    {copy.personalDescription ? (
                      <p className="mt-1.5 text-sm leading-6" style={{ ...heroTextStyle, color: "#64748B" }}>{copy.personalDescription}</p>
                    ) : null}
                    <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-5">
                      <div className="col-span-2">
                        <Field id="name" label={copy.fields.name} required error={formErrors.name}>
                          <input id="name" value={form.name} onChange={(event) => updateForm("name", event.target.value)} onFocus={() => setFocusedField("name")} onBlur={() => { setFocusedField(null); markFieldTouched("name"); }} placeholder={copy.placeholders.name} required aria-invalid={Boolean(formErrors.name)} aria-describedby={formErrors.name ? "name-error" : undefined} style={getControlStyle("name")} />
                        </Field>
                      </div>
                      <Field id="age" label={copy.fields.age} required error={formErrors.age}>
                        <input
                          id="age"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={form.age}
                          onChange={(event) => updateForm("age", event.target.value.replace(/\D/g, ""))}
                          onKeyDown={(event) => {
                            if (["e", "E", "+", "-", ".", ","].includes(event.key)) event.preventDefault();
                          }}
                          onFocus={() => setFocusedField("age")}
                          onBlur={() => { setFocusedField(null); markFieldTouched("age"); }}
                          placeholder={copy.placeholders.age}
                          required
                          aria-invalid={Boolean(formErrors.age)}
                          aria-describedby={formErrors.age ? "age-error" : undefined}
                          style={getControlStyle("age")}
                        />
                      </Field>
                      <Field id="nationality" label={copy.fields.nationality} required error={formErrors.nationality}>
                        <Select
                          value={form.nationality}
                          onValueChange={(value) => updateForm("nationality", value)}
                          onOpenChange={(open) => {
                            if (!open) {
                              setFocusedField(null);
                              markFieldTouched("nationality");
                            } else {
                              setFocusedField("nationality");
                            }
                          }}
                        >
                          <SelectTrigger
                            id="nationality"
                            aria-label={copy.fields.nationality}
                            aria-invalid={Boolean(formErrors.nationality)}
                            aria-describedby={formErrors.nationality ? "nationality-error" : undefined}
                            className={["w-full justify-between rounded-xl", isArabic ? "relative pl-10 pr-4 text-right [&_[data-slot=select-value]]:absolute [&_[data-slot=select-value]]:left-10 [&_[data-slot=select-value]]:right-4 [&_[data-slot=select-value]]:justify-end [&_[data-slot=select-value]]:[direction:rtl] [&_svg]:absolute [&_svg]:left-4 [&_svg]:right-auto" : "text-left"].join(" ")}
                            dir={isArabic ? "ltr" : "ltr"}
                            style={{ ...getControlStyle("nationality"), cursor: "pointer" }}
                          >
                            <SelectValue placeholder={copy.placeholders.nationality} />
                          </SelectTrigger>
                          <SelectContent
                            align="end"
                            sideOffset={6}
                            className="z-[80] max-h-64 min-w-[112px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-[0_18px_40px_rgba(15,23,42,0.16)] [&_[data-radix-select-viewport]]:h-auto [&_[data-radix-select-viewport]]:max-h-64"
                          >
                            {nationalityOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value} className={["rounded-lg px-3 py-2 text-sm text-[#0B1F4D] focus:bg-[#EFF6FF]", isArabic ? "pl-8 pr-3 text-right [&>span:first-child]:left-2 [&>span:first-child]:right-auto" : ""].join(" ")}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </section>

                  <section className={["border-t", copy.additionalTitle || copy.additionalDescription ? "pt-8" : "pt-5"].join(" ")} style={{ borderColor: "#E2E8F0" }}>
                    <h3 className="text-lg font-black tracking-[-0.025em]" style={{ ...heroTextStyle, color: "#0B1F4D" }}>{copy.professionalTitle}</h3>
                    {copy.professionalDescription ? (
                      <p className="mt-1.5 text-sm leading-6" style={{ ...heroTextStyle, color: "#64748B" }}>{copy.professionalDescription}</p>
                    ) : null}
                    <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-5">
                      <Field id="experience" label={copy.fields.experience} required error={formErrors.experience}>
                        <input
                          id="experience"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={form.experience}
                          onChange={(event) => updateForm("experience", event.target.value.replace(/\D/g, ""))}
                          onKeyDown={(event) => {
                            if (["e", "E", "+", "-", ".", ","].includes(event.key)) event.preventDefault();
                          }}
                          onFocus={() => setFocusedField("experience")}
                          onBlur={() => { setFocusedField(null); markFieldTouched("experience"); }}
                          placeholder={copy.placeholders.experience}
                          required
                          aria-invalid={Boolean(formErrors.experience)}
                          aria-describedby={formErrors.experience ? "experience-error" : undefined}
                          style={getControlStyle("experience")}
                        />
                      </Field>
                      <Field id="readyToStart" label={copy.fields.readyToStart} required>
                        <Select
                          value={form.readyToStart}
                          onValueChange={(value) => updateForm("readyToStart", value)}
                          onOpenChange={(open) => {
                            if (!open) {
                              setFocusedField(null);
                              markFieldTouched("readyToStart");
                            } else {
                              setFocusedField("readyToStart");
                            }
                          }}
                        >
                          <SelectTrigger
                            id="readyToStart"
                            aria-label={copy.fields.readyToStart}
                            className={["w-full justify-between rounded-xl", isArabic ? "relative pl-10 pr-4 text-right [&_[data-slot=select-value]]:absolute [&_[data-slot=select-value]]:left-10 [&_[data-slot=select-value]]:right-4 [&_[data-slot=select-value]]:justify-end [&_[data-slot=select-value]]:[direction:rtl] [&_svg]:absolute [&_svg]:left-4 [&_svg]:right-auto" : "text-left"].join(" ")}
                            dir={isArabic ? "ltr" : "ltr"}
                            style={{ ...getControlStyle("readyToStart"), cursor: "pointer" }}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent
                            align="end"
                            sideOffset={6}
                            className="z-[80] max-h-64 min-w-[112px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-[0_18px_40px_rgba(15,23,42,0.16)] [&_[data-radix-select-viewport]]:h-auto [&_[data-radix-select-viewport]]:max-h-64"
                          >
                            {(["Yes", "No", "Other"] as ReadyToStart[]).map((option) => (
                              <SelectItem key={option} value={option} className={["rounded-lg px-3 py-2 text-sm text-[#0B1F4D] focus:bg-[#EFF6FF]", isArabic ? "pl-8 pr-3 text-right [&>span:first-child]:left-2 [&>span:first-child]:right-auto" : ""].join(" ")}>
                                {readyToStartLabels[option]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <div className="col-span-2 sm:col-span-1">
                        <Field id="expectedSalary" label={copy.fields.expectedSalary} error={formErrors.expectedSalary || formErrors.expectedSalaryCurrency}>
                          <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-2 sm:grid-cols-[minmax(0,1fr)_120px]">
                            <input id="expectedSalary" type="number" min={0} inputMode="decimal" value={form.expectedSalary} onChange={(event) => updateForm("expectedSalary", event.target.value)} onFocus={() => setFocusedField("expectedSalary")} onBlur={() => { setFocusedField(null); markFieldTouched("expectedSalary"); markFieldTouched("expectedSalaryCurrency"); }} placeholder={copy.placeholders.expectedSalary} aria-invalid={Boolean(formErrors.expectedSalary || formErrors.expectedSalaryCurrency)} aria-describedby={(formErrors.expectedSalary || formErrors.expectedSalaryCurrency) ? "expectedSalary-error" : undefined} style={getControlStyle("expectedSalary")} />
                            <Select
                              value={form.expectedSalaryCurrency}
                              onValueChange={(value) => updateForm("expectedSalaryCurrency", value)}
                              onOpenChange={(open) => {
                                if (!open) {
                                  setFocusedField(null);
                                  markFieldTouched("expectedSalaryCurrency");
                                } else {
                                  setFocusedField("expectedSalaryCurrency");
                                }
                              }}
                            >
                              <SelectTrigger
                                id="expectedSalaryCurrency"
                                aria-label={copy.placeholders.currency}
                                aria-invalid={Boolean(formErrors.expectedSalaryCurrency)}
                                aria-describedby={formErrors.expectedSalaryCurrency ? "expectedSalary-error" : undefined}
                                className={["w-full justify-between rounded-xl", isArabic ? "relative pl-10 pr-4 text-right [&_[data-slot=select-value]]:absolute [&_[data-slot=select-value]]:left-10 [&_[data-slot=select-value]]:right-4 [&_[data-slot=select-value]]:justify-end [&_[data-slot=select-value]]:[direction:rtl] [&_svg]:absolute [&_svg]:left-4 [&_svg]:right-auto" : "text-left"].join(" ")}
                                dir={isArabic ? "ltr" : "ltr"}
                                style={{ ...getControlStyle("expectedSalaryCurrency"), cursor: "pointer" }}
                              >
                                <SelectValue placeholder={copy.placeholders.currency} />
                              </SelectTrigger>
                              <SelectContent
                                align="end"
                                sideOffset={6}
                                className="z-[80] max-h-64 min-w-[112px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-[0_18px_40px_rgba(15,23,42,0.16)] [&_[data-radix-select-viewport]]:h-auto [&_[data-radix-select-viewport]]:max-h-64"
                              >
                                {SALARY_CURRENCIES.map((currency) => (
                                  <SelectItem key={currency.code} value={currency.code} className={["rounded-lg px-3 py-2 text-sm text-[#0B1F4D] focus:bg-[#EFF6FF]", isArabic ? "pl-8 pr-3 text-right [&>span:first-child]:left-2 [&>span:first-child]:right-auto" : ""].join(" ")}>
                                    {currency.code}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </Field>
                      </div>
                    </div>
                  </section>

                  <section className="border-t pt-8" style={{ borderColor: "#E2E8F0" }}>
                    {copy.additionalTitle ? (
                      <h3 className="text-lg font-black tracking-[-0.025em]" style={{ ...heroTextStyle, color: "#0B1F4D" }}>{copy.additionalTitle}</h3>
                    ) : null}
                    {copy.additionalDescription ? (
                      <p className="mt-1.5 text-sm leading-6" style={{ ...heroTextStyle, color: "#64748B" }}>{copy.additionalDescription}</p>
                    ) : null}
                    <div className={copy.additionalTitle || copy.additionalDescription ? "mt-5" : ""}>
                      <Field id="additionalNotes" label={copy.fields.additionalNotes}>
                        <textarea id="additionalNotes" value={form.additionalNotes} onChange={(event) => updateForm("additionalNotes", event.target.value)} onFocus={() => setFocusedField("additionalNotes")} onBlur={() => { setFocusedField(null); markFieldTouched("additionalNotes"); }} placeholder={copy.placeholders.additionalNotes} rows={4} className="resize-y" style={{ ...getControlStyle("additionalNotes"), resize: "vertical", lineHeight: 1.7 }} />
                      </Field>
                    </div>
                  </section>

                  <section className="border-t pt-8" style={{ borderColor: "#E2E8F0" }}>
                    <h3 className="text-lg font-black tracking-[-0.025em]" style={{ ...heroTextStyle, color: "#0B1F4D" }}>{copy.uploadTitle}</h3>
                    <p className="mt-1.5 text-sm leading-6" style={{ ...heroTextStyle, color: "#64748B" }}>{copy.uploadDescription}</p>
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
                      className="mt-5 flex w-full flex-col items-center justify-center gap-3 rounded-[18px] px-4 py-10 text-center transition-colors"
                      style={{ border: `2px dashed ${formErrors.cv ? "#FCA5A5" : cvFile ? "#86EFAC" : dragging ? "#1D4ED8" : "#E2E8F0"}`, background: cvFile ? "#F0FDF4" : dragging ? "#EFF6FF" : "#F8FAFC" }}
                      aria-describedby={formErrors.cv ? "cv-error" : undefined}
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: cvFile ? "#DCFCE7" : "#EFF6FF", color: cvFile ? "#16A34A" : "#1D4ED8" }}>
                        {cvFile ? <CheckCircle2 size={24} /> : <Upload size={24} />}
                      </span>
                      <span className="max-w-full truncate text-sm font-bold" style={{ color: cvFile ? "#166534" : dragging ? "#1D4ED8" : "#64748B" }}>
                        {cvFile ? cvFile.name : copy.cvIdle}
                      </span>
                      {cvFile ? (
                        <span className="text-xs font-semibold" style={{ color: "#64748B" }}>
                          {formatFileSize(cvFile.size)} · {getFileTypeLabel(cvFile)}
                        </span>
                      ) : null}
                    </button>

                    {cvFile ? (
                      <button type="button" onClick={() => handleFile(null)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>
                        <X size={12} /> {copy.removeFile}
                      </button>
                    ) : null}
                    {formErrors.cv ? (
                      <div id="cv-error" className="mt-3 flex items-start gap-1.5 text-xs leading-5" style={{ color: "#DC2626" }}>
                        <FileText size={12} style={{ flexShrink: 0, marginTop: 3 }} />
                        <span>{formErrors.cv}</span>
                      </div>
                    ) : null}
                  </section>

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

                  <section className="border-t pt-8" style={{ borderColor: "#E2E8F0" }}>
                    {copy.submitNote ? (
                      <p className="mb-4 text-sm leading-6" style={{ ...heroTextStyle, color: "#64748B" }}>{copy.submitNote}</p>
                    ) : null}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#0B1F4D] px-5 py-4 text-sm font-bold text-white shadow-[0_18px_36px_rgba(11,31,77,0.18)] transition-colors hover:bg-[#132B63] disabled:cursor-not-allowed disabled:bg-[#94A3B8]"
                    >
                      {submitting ? copy.submitting : copy.submit}
                    </button>
                  </section>
                </div>
              </div>

              <aside className="hidden space-y-5 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:pb-1">
                <div className="overflow-hidden rounded-[24px] bg-white" style={{ border: "1px solid #E2E8F0" }}>
                  <div className="border-b px-5 py-4" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
                    <div className="text-xs font-bold uppercase tracking-[0.18em]" style={{ ...heroTextStyle, color: "#94A3B8" }}>{copy.positionDetails}</div>
                  </div>
                  <div className="divide-y px-5" style={{ borderColor: "#F1F5F9" }}>
                    <DetailItem icon={<MapPin size={15} />} label={copy.location} value={job.location || missingValueLabel} />
                    <DetailItem icon={<BriefcaseBusiness size={15} />} label={copy.employmentType} value={job.employmentType || missingValueLabel} />
                    <DetailItem icon={<GraduationCap size={15} />} label={copy.experience} value={job.experienceLevel || missingValueLabel} />
                    <DetailItem icon={<DollarSign size={15} />} label={copy.salary} value={salaryLabel || missingValueLabel} muted={!salaryLabel} />
                  </div>
                </div>

                <div className="rounded-[24px] bg-white p-5" style={{ border: "1px solid #E2E8F0" }}>
                  <div className="text-xs font-bold uppercase tracking-[0.18em]" style={{ ...heroTextStyle, color: "#94A3B8" }}>{copy.keySkills}</div>
                  {skills.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span key={skill} className="rounded-lg px-2.5 py-1 text-xs font-medium" style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #DBEAFE" }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-6" style={{ ...heroTextStyle, color: "#64748B" }}>{copy.noSkills}</p>
                  )}
                </div>

                <Link to={`/careers/${job.slug}`} className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border px-5 text-sm font-semibold transition-colors hover:border-[#0B1F4D] hover:text-[#0B1F4D]" style={{ borderColor: "#E2E8F0", color: "#64748B", background: "#ffffff" }}>
                  {copy.cancel}
                </Link>

                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                  style={{
                    borderColor: shareState === "copied" ? "#BBF7D0" : shareState === "error" ? "#FCA5A5" : "#E2E8F0",
                    color: shareState === "copied" ? "#16A34A" : shareState === "error" ? "#DC2626" : "#64748B",
                    background: shareState === "copied" ? "#F0FDF4" : "#ffffff",
                  }}
                >
                  {shareState === "copied" ? <><Check size={14} />{copy.copied}</> : <><Share2 size={14} />{copy.share}</>}
                </button>
              </aside>
            </form>
          </section>
        </main>
      )}
    </div>
  );
}
