import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AlertCircle, ArrowLeft, CheckCircle2, EyeOff, Globe, ImageOff, Save, Upload, X } from "lucide-react";
import { AdminLayout } from "../components/admin/AdminLayout";
import {
  createArticle,
  getAdminArticleById,
  publishArticle,
  unpublishArticle,
  updateArticle,
  type ArticleRecord,
} from "../../services/api/articlesApi";
import { apiClient } from "../../services/api/client";
import { getAxiosErrorMessage, isRequestCanceled } from "../../services/api/utils";

const MAX_TITLE = 200;
const MAX_SUMMARY = 500;
const MAX_IMAGE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

function generateSlug(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getArticleCoverImageSrc(slug: string) {
  const baseUrl = String(apiClient.defaults.baseURL ?? "").replace(/\/$/, "");
  return `${baseUrl}/api/articles/${encodeURIComponent(slug)}/cover-image`;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <div className="mt-1.5 flex items-center gap-1.5">
      <AlertCircle size={12} style={{ color: "#DC2626", flexShrink: 0 }} />
      <span className="text-xs" style={{ color: "#DC2626" }}>{msg}</span>
    </div>
  );
}

function CharCounter({ current, max }: { current: number; max: number }) {
  return <span className="text-xs" style={{ color: current > max ? "#DC2626" : "#94A3B8" }}>{current}/{max}</span>;
}

export default function AdminArticleFormPage() {
  const { id } = useParams<{ id?: string }>();
  const articleId = id ? Number(id) : null;
  const isEdit = Number.isFinite(articleId) && articleId !== null;
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [existing, setExisting] = useState<ArticleRecord | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [removeCoverImage, setRemoveCoverImage] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [coverImageError, setCoverImageError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(Boolean(isEdit));
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [saved, setSaved] = useState(false);

  const previewUrl = useMemo(() => {
    if (coverImageFile) return URL.createObjectURL(coverImageFile);
    if (coverImageUrl && existing?.slug) return getArticleCoverImageSrc(existing.slug);
    return coverImageUrl;
  }, [coverImageFile, coverImageUrl, existing?.slug]);

  useEffect(() => {
    return () => {
      if (previewUrl && coverImageFile) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [coverImageFile, previewUrl]);

  useEffect(() => {
    if (!slugTouched && !isEdit) {
      setSlug(generateSlug(title));
    }
  }, [isEdit, slugTouched, title]);

  useEffect(() => {
    if (!isEdit || !articleId) return;
    const controller = new AbortController();

    const loadArticle = async () => {
      setIsLoading(true);
      setPageError("");
      try {
        const article = await getAdminArticleById(articleId, { signal: controller.signal });
        if (controller.signal.aborted) return;
        setExisting(article);
        setTitle(article.title);
        setSlug(article.slug);
        setSummary(article.summary);
        setContent(article.content);
        setPublished(article.isPublished);
        setCoverImageUrl(article.coverImageUrl);
      } catch (requestError) {
        if (isRequestCanceled(requestError) || controller.signal.aborted) return;
        setPageError(getAxiosErrorMessage(requestError, "Unable to load this article right now."));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadArticle();
    return () => controller.abort();
  }, [articleId, isEdit]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = "Title is required.";
    if (title.length > MAX_TITLE) nextErrors.title = `Title must be ${MAX_TITLE} characters or less.`;
    if (!summary.trim()) nextErrors.summary = "Summary is required.";
    if (summary.length > MAX_SUMMARY) nextErrors.summary = `Summary must be ${MAX_SUMMARY} characters or less.`;
    if (!content.trim()) nextErrors.content = "Content is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleImageFile = (file: File) => {
    setCoverImageError("");
    const extension = file.name.toLowerCase().split(".").pop();
    const allowedExtension = extension === "jpg" || extension === "jpeg" || extension === "png" || extension === "webp";
    const allowedMimeType = file.type ? ACCEPTED_IMAGE_TYPES.includes(file.type) : true;

    if (!allowedExtension || !allowedMimeType) {
      setCoverImageError("Only JPG, JPEG, PNG, or WebP images are accepted.");
      return;
    }

    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setCoverImageError(`Image must be smaller than ${MAX_IMAGE_MB}MB.`);
      return;
    }

    setCoverImageFile(file);
    setRemoveCoverImage(false);
  };

  const clearCoverImage = () => {
    setCoverImageFile(null);
    setCoverImageUrl(null);
    setRemoveCoverImage(Boolean(existing?.coverImageUrl));
  };

  const handleSave = async (publishOverride?: boolean) => {
    if (!validate() || saving || saved) return;
    setSaving(true);
    setPageError("");
    setSaved(false);

    const nextPublished = publishOverride ?? published;

    try {
      let savedArticle: ArticleRecord;
      if (isEdit && articleId) {
        savedArticle = await updateArticle(articleId, {
          title: title.trim(),
          slug: slug.trim(),
          summary: summary.trim(),
          content,
          coverImage: coverImageFile,
          removeCoverImage,
        });

        if (existing && nextPublished !== existing.isPublished) {
          if (nextPublished) {
            await publishArticle(articleId);
          } else {
            await unpublishArticle(articleId);
          }
          savedArticle = { ...savedArticle, isPublished: nextPublished };
        }
      } else {
        savedArticle = await createArticle({
          title: title.trim(),
          slug: slug.trim(),
          summary: summary.trim(),
          content,
          coverImage: coverImageFile,
          isPublished: nextPublished,
        });
      }

      setExisting(savedArticle);
      setSaved(true);
      window.setTimeout(() => navigate("/admin/articles"), 900);
    } catch (requestError) {
      setPageError(getAxiosErrorMessage(requestError, "Unable to save article right now."));
    } finally {
      setSaving(false);
    }
  };

  const formActionsDisabled = saving || saved;

  return (
    <AdminLayout title={isEdit ? "Edit Article" : "Create Article"}>
      {saved ? (
        <div className="fixed right-5 top-5 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-semibold text-white shadow-xl" style={{ background: "#16A34A" }}>
          <CheckCircle2 size={16} /> Article saved. Redirecting...
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        <button type="button" onClick={() => navigate("/admin/articles")} className="inline-flex self-start items-center gap-2 text-sm font-medium" style={{ color: "#64748B" }}>
          <ArrowLeft size={14} /> Back to Articles
        </button>

        {pageError ? (
          <div className="flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626" }}>
            <AlertCircle size={14} /> {pageError}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-xl bg-white px-6 py-16 text-center text-sm" style={{ border: "1px solid #E2E8F0", color: "#94A3B8" }}>Loading article...</div>
        ) : (
          <div className="flex flex-col items-start gap-6 lg:flex-row">
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              <div className="rounded-xl bg-white p-7" style={{ border: "1px solid #E2E8F0" }}>
                <h2 className="mb-6 font-bold" style={{ fontSize: "0.9375rem", color: "#0B1F4D" }}>Article Content</h2>

                <div className="mb-5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <label style={labelSt}>Title <span style={{ color: "#DC2626" }}>*</span></label>
                    <CharCounter current={title.length} max={MAX_TITLE} />
                  </div>
                  <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Enter article title..." style={{ ...inputSt, borderColor: errors.title ? "#DC2626" : "#E2E8F0" }} />
                  <FieldError msg={errors.title} />
                </div>

                <div className="mb-5">
                  <label style={labelSt}>Slug <span style={{ color: "#94A3B8", fontSize: "0.6875rem", letterSpacing: 0, textTransform: "none" }}>(optional)</span></label>
                  <input value={slug} onChange={(event) => { setSlug(event.target.value); setSlugTouched(true); }} placeholder="article-slug" style={{ ...inputSt, fontFamily: "monospace", fontSize: "0.8125rem" }} />
                </div>

                <div className="mb-5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <label style={labelSt}>Summary <span style={{ color: "#DC2626" }}>*</span></label>
                    <CharCounter current={summary.length} max={MAX_SUMMARY} />
                  </div>
                  <textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={3} placeholder="A concise summary displayed in article cards..." style={{ ...inputSt, resize: "vertical", borderColor: errors.summary ? "#DC2626" : "#E2E8F0" }} />
                  <FieldError msg={errors.summary} />
                </div>

                <div>
                  <label style={labelSt}>Content <span style={{ color: "#DC2626" }}>*</span></label>
                  <p className="mb-2 text-xs" style={{ color: "#94A3B8" }}>Use ## Heading and ### Sub-heading. Double line breaks create paragraphs.</p>
                  <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    rows={18}
                    placeholder={"Write your article content here...\n\n## Section Heading\n\nParagraph text goes here."}
                    style={{ ...inputSt, resize: "vertical", lineHeight: 1.7, fontFamily: "'SFMono-Regular', Consolas, monospace", fontSize: "0.8125rem", borderColor: errors.content ? "#DC2626" : "#E2E8F0" }}
                  />
                  <FieldError msg={errors.content} />
                </div>
              </div>
            </div>

            <div className="flex w-full flex-shrink-0 flex-col gap-5 lg:w-80">
              <div className="rounded-xl bg-white p-6" style={{ border: "1px solid #E2E8F0" }}>
                <div className="mb-4 text-sm font-bold" style={{ color: "#0B1F4D" }}>Cover Image</div>
                <p className="mb-4 text-xs leading-relaxed" style={{ color: "#64748B" }}>Optional. JPG, JPEG, PNG, or WebP. Max {MAX_IMAGE_MB}MB.</p>

                {previewUrl ? (
                  <div className="relative overflow-hidden rounded-xl" style={{ border: "1px solid #E2E8F0" }}>
                    <img src={previewUrl} alt="Cover preview" className="w-full object-cover" style={{ height: "160px" }} />
                    <div className="absolute inset-0 flex items-end justify-end gap-2 p-2 opacity-0 transition-opacity hover:opacity-100" style={{ background: "rgba(0,0,0,0.3)" }}>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold" style={{ color: "#0B1F4D" }}>Replace</button>
                      <button type="button" onClick={clearCoverImage} className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ background: "#DC2626", color: "#ffffff" }}>Remove</button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragging(false);
                      const file = event.dataTransfer.files[0];
                      if (file) handleImageFile(file);
                    }}
                    className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl"
                    style={{ height: "140px", border: `2px dashed ${dragging ? "#1D4ED8" : "#E2E8F0"}`, background: dragging ? "#EFF6FF" : "#F8FAFC" }}
                  >
                    {dragging ? <Upload size={22} style={{ color: "#1D4ED8" }} /> : <ImageOff size={22} style={{ color: "#94A3B8" }} />}
                    <div className="text-xs font-semibold" style={{ color: dragging ? "#1D4ED8" : "#64748B" }}>{dragging ? "Drop to upload" : "Click or drag an image"}</div>
                  </div>
                )}

                {coverImageError ? <FieldError msg={coverImageError} /> : null}
                <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) handleImageFile(file); event.target.value = ""; }} />
              </div>

              <div className="rounded-xl bg-white p-6" style={{ border: "1px solid #E2E8F0" }}>
                <div className="mb-4 text-sm font-bold" style={{ color: "#0B1F4D" }}>Publication</div>
                <button type="button" onClick={() => setPublished((value) => !value)} className="flex w-full items-center gap-3 rounded-xl p-3 text-left" style={{ background: published ? "#EFF6FF" : "#F8FAFC", border: `1px solid ${published ? "#BFDBFE" : "#E2E8F0"}` }}>
                  <span className="relative h-6 w-10 rounded-full" style={{ background: published ? "#1D4ED8" : "#E2E8F0" }}>
                    <span className="absolute top-1 h-4 w-4 rounded-full bg-white transition-all" style={{ left: published ? "22px" : "2px" }} />
                  </span>
                  <span className="text-sm font-semibold" style={{ color: published ? "#0B1F4D" : "#64748B" }}>{published ? "Published" : "Unpublished (draft)"}</span>
                </button>
              </div>

              <div className="flex flex-col gap-3 rounded-xl bg-white p-6" style={{ border: "1px solid #E2E8F0" }}>
                <button type="button" onClick={() => void handleSave()} disabled={formActionsDisabled} className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white" style={{ background: formActionsDisabled ? "#94A3B8" : "#0B1F4D" }}>
                  {saving ? "Saving..." : <><Save size={15} /> {isEdit ? "Save Changes" : "Create Article"}</>}
                </button>
                {!published ? (
                  <button type="button" onClick={() => { setPublished(true); void handleSave(true); }} disabled={formActionsDisabled} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold" style={{ borderColor: "#16A34A", color: "#16A34A" }}>
                    <Globe size={15} /> Save & Publish
                  </button>
                ) : (
                  <button type="button" onClick={() => { setPublished(false); void handleSave(false); }} disabled={formActionsDisabled} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold" style={{ borderColor: "#D97706", color: "#D97706" }}>
                    <EyeOff size={15} /> Save & Unpublish
                  </button>
                )}
                <button type="button" onClick={() => navigate("/admin/articles")} disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium" style={{ color: "#64748B" }}>
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
