import { useEffect, useState } from "react";
import { AlertCircle, FileText } from "lucide-react";
import { AdminLayout } from "../components/admin/AdminLayout";
import { hasAdminAccessToken } from "../components/admin/adminSession";
import {
  deriveCandidateStatsFromList,
  getAllCandidates,
  getCandidateStats,
  getCandidates,
  type CandidateRecord,
  type CandidateStats,
} from "../../services/api/candidatesApi";
import { getAdminArticles } from "../../services/api/articlesApi";
import { getJobApplications, type JobApplicationRecord } from "../../services/api/jobApplicationsApi";
import { getAdminJobs } from "../../services/api/jobsApi";
import { getAdministrators } from "../../services/api/settingsApi";
import { getAxiosErrorMessage, isRequestCanceled } from "../../services/api/utils";
import { parseBackendUtcTimestamp } from "../../services/dateTime";

type MetricCard = {
  label: string;
  value: string;
  delta: string;
  color: string;
};

type ActivityItem = {
  id: string;
  text: string;
  time: string | null;
  timestamp: string | null;
};

type ActivitySection = {
  title: string;
  emptyText: string;
  items: ActivityItem[];
};

type MetricSection = {
  title: string;
  cards: MetricCard[];
};

const TYPE_COLORS = {
  background: "#F8FAFC",
  text: "#64748B",
};

const JOB_RECRUITMENT_PAGE_SIZE = 100;
const RECENT_ACTIVITY_LIMIT = 5;

function formatRelativeTime(value: string | null) {
  if (!value) return "Recently";

  const parsed = parseBackendUtcTimestamp(value);
  if (!parsed) return "Recently";

  const diffMs = parsed.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, "minute");

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return formatter.format(diffHours, "hour");

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, "day");
}

async function getJobRecruitmentOverview(signal: AbortSignal) {
  const firstJobsPage = await getAdminJobs(
    { pageNumber: 1, pageSize: JOB_RECRUITMENT_PAGE_SIZE },
    { signal },
  );
  const allJobs = [...firstJobsPage.items];
  const totalPages = Math.ceil(firstJobsPage.totalCount / JOB_RECRUITMENT_PAGE_SIZE);

  for (let pageNumber = 2; pageNumber <= totalPages; pageNumber += 1) {
    if (signal.aborted) {
      throw new DOMException("The operation was aborted.", "AbortError");
    }

    const nextJobsPage = await getAdminJobs(
      { pageNumber, pageSize: JOB_RECRUITMENT_PAGE_SIZE },
      { signal },
    );
    allJobs.push(...nextJobsPage.items);
  }

  const applicationsByJob = await Promise.all(
    allJobs.map(async (job) => {
      const applicationsResult = await getJobApplications(
        job.id,
        { pageNumber: 1, pageSize: RECENT_ACTIVITY_LIMIT },
        { signal },
      );
      return {
        jobTitle: job.title,
        items: applicationsResult.items,
        totalCount: applicationsResult.totalCount,
      };
    }),
  );

  const recentApplications = applicationsByJob
    .flatMap((entry) =>
      entry.items.map((application) => ({
        ...application,
        jobTitle: application.jobTitle || entry.jobTitle,
      })),
    )
    .sort((first, second) => getTimeValue(second.createdAt) - getTimeValue(first.createdAt))
    .slice(0, RECENT_ACTIVITY_LIMIT);

  return {
    totalJobs: firstJobsPage.totalCount,
    totalJobApplications: applicationsByJob.reduce((sum, entry) => sum + entry.totalCount, 0),
    recentApplications,
  };
}

function getTimeValue(value: string | null) {
  if (!value) return 0;
  return parseBackendUtcTimestamp(value)?.getTime() ?? 0;
}

function buildMetricSections(
  stats: CandidateStats,
  adminCount: number,
  jobsTotal: number,
  jobApplicationsTotal: number,
  articlesTotal: number,
  applicantsTotal: number,
): MetricSection[] {
  return [
    {
      title: "TALENT NETWORK",
      cards: [
        {
          label: "TOTAL APPLICANTS",
          value: applicantsTotal.toLocaleString("en-US"),
          delta: "Live candidate total",
          color: "#1D4ED8",
        },
        {
          label: "PENDING REVIEWS",
          value: (stats.reviewedCandidates + stats.interviewCandidates).toLocaleString("en-US"),
          delta: "Candidates awaiting review",
          color: "#D97706",
        },
      ],
    },
    {
      title: "JOB RECRUITMENT",
      cards: [
        {
          label: "TOTAL JOBS",
          value: jobsTotal.toLocaleString("en-US"),
          delta: "Total job posts in the system",
          color: "#2563EB",
        },
        {
          label: "TOTAL JOB APPLICATIONS",
          value: jobApplicationsTotal.toLocaleString("en-US"),
          delta: "Applications submitted for jobs",
          color: "#7C3AED",
        },
      ],
    },
    {
      title: "SYSTEM",
      cards: [
        {
          label: "ACTIVE PARTNERS",
          value: stats.shortlistedCandidates.toLocaleString("en-US"),
          delta: "Corporate clients with live contracts",
          color: "#16A34A",
        },
        {
          label: "TOTAL ADMINISTRATORS",
          value: adminCount.toLocaleString("en-US"),
          delta: "Active team profiles in directory",
          color: "#0B1F4D",
        },
        {
          label: "TOTAL ARTICLES",
          value: articlesTotal.toLocaleString("en-US"),
          delta: "Total articles in the system",
          color: "#7C3AED",
        },
      ],
    },
  ];
}

function buildTalentActivityItems(candidates: CandidateRecord[]): ActivityItem[] {
  return [...candidates]
    .sort((first, second) => getTimeValue(second.createdAt) - getTimeValue(first.createdAt))
    .slice(0, RECENT_ACTIVITY_LIMIT)
    .map((candidate) => ({
      id: `talent-${candidate.id}`,
      text: `${candidate.fullName} submitted a Talent Network profile${candidate.currentJobTitle ? ` for ${candidate.currentJobTitle}` : ""}.`,
      time: candidate.createdAt ? formatRelativeTime(candidate.createdAt) : null,
      timestamp: candidate.createdAt,
    }));
}

function buildJobApplicationActivityItems(applications: JobApplicationRecord[]): ActivityItem[] {
  return applications.map((application) => ({
    id: `job-application-${application.id}`,
    text: `${application.name} submitted a job application for ${application.jobTitle || "a job post"}.`,
    time: application.createdAt ? formatRelativeTime(application.createdAt) : null,
    timestamp: application.createdAt,
  }));
}

export default function AdminOverviewPage() {
  const [metricSections, setMetricSections] = useState<MetricSection[]>([]);
  const [activitySections, setActivitySections] = useState<ActivitySection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    if (!hasAdminAccessToken()) {
      setIsLoading(false);
      setMetricSections([]);
      setActivitySections([]);
      setError("");
      return () => {
        controller.abort();
      };
    }

    const loadDashboard = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [statsResult, candidatesResult, adminsResult, jobRecruitmentResult, articlesResult, applicantsResult] = await Promise.allSettled([
          getCandidateStats({ signal: controller.signal }),
          getCandidates({ pageNumber: 1, pageSize: 5, sort: "Newest" }, { signal: controller.signal }),
          getAdministrators({ signal: controller.signal }),
          getJobRecruitmentOverview(controller.signal),
          getAdminArticles({ pageNumber: 1, pageSize: 1 }, { signal: controller.signal }),
          getAllCandidates({ pageSize: 100 }, { signal: controller.signal }),
        ]);

        if (controller.signal.aborted) return;

        const candidateList =
          candidatesResult.status === "fulfilled"
            ? candidatesResult.value.items
            : [];
        const totalCandidates =
          candidatesResult.status === "fulfilled"
            ? candidatesResult.value.totalCount
            : 0;

        const resolvedStats =
          statsResult.status === "fulfilled"
            ? statsResult.value
            : deriveCandidateStatsFromList(candidateList, totalCandidates);

        const adminCount =
          adminsResult.status === "fulfilled"
            ? adminsResult.value.length
            : 0;

        const jobsTotal =
          jobRecruitmentResult.status === "fulfilled"
            ? jobRecruitmentResult.value.totalJobs
            : 0;

        const jobApplicationsTotal =
          jobRecruitmentResult.status === "fulfilled"
            ? jobRecruitmentResult.value.totalJobApplications
            : 0;
        const recentJobApplications =
          jobRecruitmentResult.status === "fulfilled"
            ? jobRecruitmentResult.value.recentApplications
            : [];

        const articlesTotal =
          articlesResult.status === "fulfilled"
            ? articlesResult.value.totalCount
            : 0;

        const applicantsTotal = applicantsResult.status === "fulfilled"
          ? deriveCandidateStatsFromList(applicantsResult.value.items, applicantsResult.value.items.length).totalCandidates
          : 0;

        setMetricSections(buildMetricSections(resolvedStats, adminCount, jobsTotal, jobApplicationsTotal, articlesTotal, applicantsTotal));
        setActivitySections([
          {
            title: "TALENT NETWORK",
            emptyText: "No recent Talent Network submissions are available yet.",
            items: buildTalentActivityItems(candidateList),
          },
          {
            title: "JOB RECRUITMENT",
            emptyText: "No recent job applications are available yet.",
            items: buildJobApplicationActivityItems(recentJobApplications),
          },
        ]);

        if (
          statsResult.status === "rejected" &&
          candidatesResult.status === "rejected" &&
          adminsResult.status === "rejected" &&
          jobRecruitmentResult.status === "rejected" &&
          articlesResult.status === "rejected" &&
          applicantsResult.status === "rejected"
        ) {
          setError("Unable to load dashboard data right now.");
        }
      } catch (requestError) {
        if (isRequestCanceled(requestError) || controller.signal.aborted) return;
        setError(getAxiosErrorMessage(requestError, "Unable to load dashboard data right now."));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <AdminLayout title="Overview">
      <div className="flex flex-col gap-6">
        {error ? (
          <div
            className="flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm"
            style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626" }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          {(isLoading ? ["TALENT NETWORK", "JOB RECRUITMENT", "SYSTEM"] : metricSections.map((section) => section.title)).map((title, sectionIndex) => {
            const isSystemSection = title === "SYSTEM";
            const cards = isLoading
              ? Array.from({ length: isSystemSection ? 3 : 2 }, () => null)
              : metricSections[sectionIndex]?.cards ?? [];

            return (
              <section key={title} className="flex flex-col gap-3">
                <h2 className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "#94A3B8" }}>
                  {title}
                </h2>
                <div className={isSystemSection ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-2" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-1"}>
                  {cards.map((metric, index) => (
                    <div
                      key={metric?.label ?? index}
                      className={[
                        "flex flex-col gap-3 rounded-xl bg-white p-5",
                        isSystemSection && index === 0 ? "sm:col-span-2 lg:col-span-2" : "",
                      ].join(" ")}
                      style={{ border: "1px solid #E2E8F0" }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#94A3B8" }}>
                          {isLoading ? "Loading..." : metric.label}
                        </span>
                        <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: isLoading ? "#CBD5E1" : metric.color }} />
                      </div>
                      <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0B1F4D", lineHeight: 1, letterSpacing: "-0.025em" }}>
                        {isLoading ? "..." : metric.value}
                      </div>
                      <div className="text-xs font-medium" style={{ color: "#64748B" }}>
                        {isLoading ? "Fetching live data" : metric.delta}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="flex flex-col rounded-xl bg-white" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "#E2E8F0" }}>
            <div>
              <div className="font-bold" style={{ fontSize: "0.9375rem", color: "#0B1F4D" }}>Recent Activity</div>
              <div className="mt-0.5 text-xs" style={{ color: "#94A3B8" }}>Latest Talent Network and job recruitment submissions</div>
            </div>
            <span
              className="rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}
            >
              Live
            </span>
          </div>
          <div className="grid gap-0 md:grid-cols-2">
            {(isLoading
              ? [
                  { title: "TALENT NETWORK", emptyText: "", items: Array.from({ length: 3 }, () => null) },
                  { title: "JOB RECRUITMENT", emptyText: "", items: Array.from({ length: 3 }, () => null) },
                ]
              : activitySections
            ).map((section, sectionIndex) => (
              <section
                key={section.title}
                className={[
                  "min-w-0",
                  sectionIndex > 0 ? "border-t border-[#F1F5F9] md:border-l md:border-t-0" : "",
                ].join(" ")}
              >
                <div className="border-b px-6 py-3" style={{ borderColor: "#F1F5F9" }}>
                  <span className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "#94A3B8" }}>
                    {section.title}
                  </span>
                </div>
                {section.items.map((item, index) => (
                  <div
                    key={item?.id ?? index}
                    className="flex items-start gap-4 px-6 py-4 transition-colors"
                    style={{ borderBottom: index < section.items.length - 1 ? "1px solid #F1F5F9" : "none" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#FAFBFC")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                  >
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-sm"
                      style={{ background: TYPE_COLORS.background, color: TYPE_COLORS.text }}
                    >
                      <FileText size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm" style={{ color: "#0F172A" }}>
                        {isLoading ? "Loading recent activity..." : item.text}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-xs" style={{ color: "#94A3B8" }}>
                      {isLoading ? "..." : item.time ?? "Date unavailable"}
                    </span>
                  </div>
                ))}
                {!isLoading && section.items.length === 0 ? (
                  <div className="px-6 py-8 text-center text-sm" style={{ color: "#94A3B8" }}>
                    {section.emptyText}
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
