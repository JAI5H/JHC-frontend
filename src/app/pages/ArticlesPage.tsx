import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { AlertCircle, ArrowLeft, ArrowRight, BookOpen, RefreshCw, Search, X } from "lucide-react";
import { ImageWithFallback } from "../components/shared/ImageWithFallback";
import { useLanguage } from "../providers/LanguageProvider";
import jhcLogo from "../../imgs/logo.png";
import { getPublicArticles, type ArticleRecord } from "../../services/api/articlesApi";
import { apiClient } from "../../services/api/client";
import { getAxiosErrorMessage, isRequestCanceled } from "../../services/api/utils";

const PER_PAGE = 6;
const COVER_GRADIENTS = [
  "linear-gradient(135deg, #0B1F4D 0%, #1D4ED8 100%)",
  "linear-gradient(135deg, #1e3a8a 0%, #3B82F6 100%)",
  "linear-gradient(135deg, #0F172A 0%, #1D4ED8 100%)",
  "linear-gradient(135deg, #0B1F4D 0%, #334155 100%)",
  "linear-gradient(135deg, #1D4ED8 0%, #60A5FA 100%)",
  "linear-gradient(135deg, #0F172A 0%, #0B1F4D 100%)",
];

function formatDate(value: string | null) {
  if (!value) return "Recently published";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function getArticleCoverImageSrc(slug: string) {
  const baseUrl = String(apiClient.defaults.baseURL ?? "").replace(/\/$/, "");
  return `${baseUrl}/api/articles/${encodeURIComponent(slug)}/cover-image`;
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl" style={{ border: "1px solid #E2E8F0", background: "#ffffff" }}>
      <div className="h-48 animate-pulse" style={{ background: "#F1F5F9" }} />
      <div className="flex flex-col gap-3 p-6">
        <div className="h-4 w-[85%] animate-pulse rounded-lg" style={{ background: "#F1F5F9" }} />
        <div className="h-4 w-[65%] animate-pulse rounded-lg" style={{ background: "#F1F5F9" }} />
        <div className="h-3 w-full animate-pulse rounded-lg" style={{ background: "#F1F5F9" }} />
        <div className="h-3 w-[80%] animate-pulse rounded-lg" style={{ background: "#F1F5F9" }} />
        <div className="mt-2 flex items-center justify-between">
          <div className="h-3 w-[40%] animate-pulse rounded-lg" style={{ background: "#F1F5F9" }} />
          <div className="h-8 w-28 animate-pulse rounded-xl" style={{ background: "#F1F5F9" }} />
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article, index, isArabic }: { article: ArticleRecord; index: number; isArabic: boolean }) {
  const gradient = COVER_GRADIENTS[index % COVER_GRADIENTS.length];
  const coverImageSrc = getArticleCoverImageSrc(article.slug);
  const uiFontStyle = isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined;

  return (
    <article
      className="flex flex-col overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
      style={{ border: "1px solid #E2E8F0", background: "#ffffff", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      onMouseEnter={(event) => { event.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.09)"; }}
      onMouseLeave={(event) => { event.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}
    >
      <div className="relative h-48 flex-shrink-0 overflow-hidden" style={{ background: gradient }}>
        {article.coverImageUrl ? (
          <ImageWithFallback src={coverImageSrc} alt={article.title} className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen size={36} style={{ color: "rgba(255,255,255,0.2)" }} />
          </div>
        )}
      </div>

      <div className={["flex flex-1 flex-col gap-4 p-6", isArabic ? "text-right" : ""].join(" ")} dir={isArabic ? "rtl" : "ltr"}>
        <h2
          className="font-bold leading-snug"
          style={{
            fontSize: "1.0625rem",
            color: "#0B1F4D",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.title}
        </h2>
        <p
          className="flex-1 text-sm leading-relaxed"
          style={{
            color: "#64748B",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.summary}
        </p>

        <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: "#F1F5F9" }}>
          <div>
            <div className="text-xs font-semibold" style={{ ...uiFontStyle, color: "#0B1F4D" }}>{article.author}</div>
            <div className="mt-0.5 text-xs" style={{ ...uiFontStyle, color: "#94A3B8" }}>{formatDate(article.publishedAt)}</div>
          </div>
          <Link
            to={`/articles/${article.slug}`}
            className={["inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-150", isArabic ? "flex-row-reverse" : ""].join(" ")}
            style={{ ...uiFontStyle, background: "#0B1F4D", color: "#ffffff" }}
            onMouseEnter={(event) => { event.currentTarget.style.background = "#1D4ED8"; }}
            onMouseLeave={(event) => { event.currentTarget.style.background = "#0B1F4D"; }}
          >
            {isArabic ? "اقرأ المقال" : "Read Article"} {isArabic ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
          </Link>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ searching, isArabic }: { searching: boolean; isArabic: boolean }) {
  const uiFontStyle = isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined;

  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-5 py-24">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "#F1F5F9" }}>
        <BookOpen size={28} style={{ color: "#94A3B8" }} />
      </div>
      <div className="text-center">
        <div className="font-semibold" style={{ ...uiFontStyle, color: "#0B1F4D" }}>{searching ? (isArabic ? "لم يتم العثور على مقالات" : "No articles found") : (isArabic ? "لا توجد مقالات حالياً" : "No articles yet")}</div>
        <p className="mt-1 text-sm" style={{ ...uiFontStyle, color: "#64748B" }}>
          {searching ? (isArabic ? "جرّب كلمة بحث مختلفة." : "Try a different search term.") : (isArabic ? "يعمل فريقنا على إعداد محتوى متخصص. تفضل بزيارتنا قريباً." : "Our team is working on insightful content. Check back soon.")}
        </p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry, isArabic }: { message: string; onRetry: () => void; isArabic: boolean }) {
  const uiFontStyle = isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined;

  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-5 py-24">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "#FEF2F2" }}>
        <AlertCircle size={28} style={{ color: "#DC2626" }} />
      </div>
      <div className="text-center">
        <div className="font-semibold" style={{ ...uiFontStyle, color: "#0B1F4D" }}>{isArabic ? "تعذر تحميل المقالات" : "Unable to load articles"}</div>
        <p className="mt-1 text-sm" style={{ ...uiFontStyle, color: "#64748B" }}>{message || (isArabic ? "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى." : "Something went wrong. Please try again.")}</p>
      </div>
      <button type="button" onClick={onRetry} className={["inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all", isArabic ? "flex-row-reverse" : ""].join(" ")} style={{ ...uiFontStyle, borderColor: "#E2E8F0", color: "#64748B" }}>
        <RefreshCw size={14} /> {isArabic ? "حاول مرة أخرى" : "Try Again"}
      </button>
    </div>
  );
}

export default function ArticlesPage() {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const isArabic = language === "ar";
  const uiFontStyle = isArabic ? { fontFamily: "'Cairo', system-ui, sans-serif" } : undefined;
  const copy = isArabic
    ? {
        home: "الرئيسية",
        articles: "المقالات",
        eyebrow: "رؤى ووجهات نظر",
        description: "أفكار استراتيجية ورؤى متخصصة حول القوى العاملة وإرشادات عملية لقادة الأعمال وموارد بشرية في دول الخليج.",
        searchPlaceholder: "ابحث في المقالات...",
        result: "نتيجة",
        results: "نتائج",
        forSearch: "عن",
        noResults: "لا توجد نتائج عن",
        loadError: "تعذر تحميل المقالات الآن.",
      }
    : {
        home: "Home",
        articles: "Articles",
        eyebrow: "Insights & Perspectives",
        description: "Strategic thinking, workforce insights, and practical guidance for GCC business leaders and HR professionals.",
        searchPlaceholder: "Search articles...",
        result: "result",
        results: "results",
        forSearch: "for",
        noResults: "No results for",
        loadError: "Unable to load articles right now.",
      };

  const loadArticles = () => {
    const controller = new AbortController();
    setIsLoading(true);
    setError("");

    void getPublicArticles({ isPublished: true, pageNumber: 1, pageSize: 100 }, { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        setArticles(result.items);
      })
      .catch((requestError) => {
        if (isRequestCanceled(requestError) || controller.signal.aborted) return;
        setError(getAxiosErrorMessage(requestError, copy.loadError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return controller;
  };

  useEffect(() => {
    const controller = loadArticles();
    return () => controller.abort();
  }, []);

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return articles.filter((article) =>
      !query ||
      article.title.toLowerCase().includes(query) ||
      article.summary.toLowerCase().includes(query) ||
      article.slug.toLowerCase().includes(query) ||
      article.author.toLowerCase().includes(query),
    );
  }, [articles, search]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const visibleArticles = filteredArticles.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div dir={isArabic ? "rtl" : "ltr"} style={{ fontFamily: "var(--font-family-app)", background: "#F8FAFC", minHeight: "100vh" }}>
      <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <ImageWithFallback src={jhcLogo} alt="JHC" className="h-8 w-auto object-contain" />
          </Link>
          <Link
            to="/"
            className={["inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors hover:border-[#0B1F4D] hover:text-[#0B1F4D]", isArabic ? "flex-row-reverse" : ""].join(" ")}
            style={{ ...uiFontStyle, borderColor: "#E2E8F0", color: "#64748B" }}
          >
            <ArrowLeft size={14} className={isArabic ? "rotate-180" : undefined} /> {copy.home}
          </Link>
        </div>
      </header>

      <section className="px-6 pb-12 pt-16 lg:px-8 lg:pt-24" style={{ background: "#ffffff", borderBottom: "1px solid #E2E8F0" }}>
        <div className={["mx-auto max-w-7xl", isArabic ? "text-right" : ""].join(" ")}>
          <nav aria-label="Breadcrumb" className={["mb-8 flex items-center gap-2 text-xs", isArabic ? "justify-start" : ""].join(" ")} style={{ ...uiFontStyle, color: "#94A3B8" }}>
            <Link to="/" className="transition-colors hover:text-[#0B1F4D]">{copy.home}</Link>
            <ArrowRight size={12} className={isArabic ? "rotate-180" : undefined} />
            <span style={{ color: "#475569" }}>{copy.articles}</span>
          </nav>
          <div className={["max-w-4xl", isArabic ? "ml-auto pr-2 sm:pr-4 lg:pr-6" : ""].join(" ")}>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ ...uiFontStyle, color: "#1D4ED8" }}>
            {copy.eyebrow}
          </span>
          <h1
            className="mb-4 mt-3"
            style={{ ...uiFontStyle, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, color: "#0B1F4D", lineHeight: 1.1, letterSpacing: "-0.025em" }}
          >
            {copy.articles}
          </h1>
          <p className="mb-8 max-w-xl text-base leading-relaxed" style={{ ...uiFontStyle, color: "#64748B" }}>
            {copy.description}
          </p>

          <div className="relative max-w-md">
            <Search size={16} className={["pointer-events-none absolute top-1/2 -translate-y-1/2", isArabic ? "right-4" : "left-4"].join(" ")} style={{ color: "#94A3B8" }} />
            <input
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder={copy.searchPlaceholder}
              className={["w-full rounded-xl py-3 text-sm", isArabic ? "pl-10 pr-11 text-right" : "pl-11 pr-10"].join(" ")}
              style={{ border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#0F172A", outline: "none", fontFamily: "inherit", transition: "border-color 0.15s" }}
              onFocus={(event) => { event.target.style.borderColor = "#1D4ED8"; }}
              onBlur={(event) => { event.target.style.borderColor = "#E2E8F0"; }}
            />
            {search ? (
              <button type="button" onClick={() => handleSearch("")} className={["absolute top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors", isArabic ? "left-3" : "right-3"].join(" ")} style={{ color: "#94A3B8" }}>
                <X size={14} />
              </button>
            ) : null}
          </div>

          {search && !isLoading ? (
            <p className="mt-3 text-sm" style={{ color: "#64748B" }}>
              {filteredArticles.length > 0
                ? isArabic
                  ? `${filteredArticles.length} ${filteredArticles.length === 1 ? copy.result : copy.results} ${copy.forSearch} "${search}"`
                  : `${filteredArticles.length} ${filteredArticles.length !== 1 ? copy.results : copy.result} ${copy.forSearch} "${search}"`
                : `${copy.noResults} "${search}"`}
            </p>
          ) : null}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
          ) : error ? (
            <ErrorState message={error} onRetry={() => { loadArticles(); }} isArabic={isArabic} />
          ) : visibleArticles.length === 0 ? (
            <EmptyState searching={Boolean(search)} isArabic={isArabic} />
          ) : (
            visibleArticles.map((article, index) => (
              <ArticleCard key={article.id} article={article} index={(safePage - 1) * PER_PAGE + index} isArabic={isArabic} />
            ))
          )}
        </div>

        {!isLoading && !error && totalPages > 1 ? (
          <div className="mt-14 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={safePage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl border text-sm transition-all"
              style={{ borderColor: "#E2E8F0", color: safePage === 1 ? "#CBD5E1" : "#64748B", cursor: safePage === 1 ? "not-allowed" : "pointer" }}
            >
              {isArabic ? "›" : "‹"}
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-medium transition-all"
                style={{ borderColor: item === safePage ? "#1D4ED8" : "#E2E8F0", background: item === safePage ? "#1D4ED8" : "transparent", color: item === safePage ? "#ffffff" : "#64748B" }}
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={safePage === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-xl border text-sm transition-all"
              style={{ borderColor: "#E2E8F0", color: safePage === totalPages ? "#CBD5E1" : "#64748B", cursor: safePage === totalPages ? "not-allowed" : "pointer" }}
            >
              {isArabic ? "‹" : "›"}
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
