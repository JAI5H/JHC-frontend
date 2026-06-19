import { useEffect, useState } from "react";
import { AlertCircle, FileText } from "lucide-react";
import { AdminLayout } from "../components/admin/AdminLayout";
import { hasAdminAccessToken } from "../components/admin/adminSession";
import {
  deriveCandidateStatsFromList,
  getCandidateStats,
  getCandidates,
  type CandidateRecord,
  type CandidateStats,
} from "../../services/api/candidatesApi";
import { getAdministrators } from "../../services/api/settingsApi";
import { getAxiosErrorMessage, isRequestCanceled } from "../../services/api/utils";

type MetricCard = {
  label: string;
  value: string;
  delta: string;
  color: string;
};

type ActivityItem = {
  id: number;
  text: string;
  time: string;
};

const TYPE_COLORS = {
  background: "#F8FAFC",
  text: "#64748B",
};

function formatRelativeTime(value: string | null) {
  if (!value) return "Recently";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently";

  const diffMs = parsed.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, "minute");

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return formatter.format(diffHours, "hour");

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, "day");
}

function buildMetricCards(stats: CandidateStats, adminCount: number): MetricCard[] {
  return [
    {
      label: "TOTAL TALENTS",
      value: stats.totalCandidates.toLocaleString("en-US"),
      delta: "Total approved candidates in system",
      color: "#1D4ED8",
    },
    {
      label: "PENDING REVIEWS",
      value: stats.newCandidates.toLocaleString("en-US"),
      delta: "New applications awaiting action",
      color: "#D97706",
    },
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
  ];
}

function buildActivityItems(candidates: CandidateRecord[]): ActivityItem[] {
  return candidates.slice(0, 5).map((candidate) => ({
    id: candidate.id,
    text: `${candidate.fullName} submitted an application for ${candidate.currentJobTitle}.`,
    time: formatRelativeTime(candidate.createdAt),
  }));
}

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    if (!hasAdminAccessToken()) {
      setIsLoading(false);
      setMetrics([]);
      setActivity([]);
      setError("");
      return () => {
        controller.abort();
      };
    }

    const loadDashboard = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [statsResult, candidatesResult, adminsResult] = await Promise.allSettled([
          getCandidateStats({ signal: controller.signal }),
          getCandidates({ pageNumber: 1, pageSize: 5, sort: "Newest" }, { signal: controller.signal }),
          getAdministrators({ signal: controller.signal }),
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

        setMetrics(buildMetricCards(resolvedStats, adminCount));
        setActivity(buildActivityItems(candidateList));

        if (
          statsResult.status === "rejected" &&
          candidatesResult.status === "rejected" &&
          adminsResult.status === "rejected"
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(isLoading ? Array.from({ length: 4 }, () => null) : metrics).map((metric, index) => (
            <div key={metric?.label ?? index} className="flex flex-col gap-3 rounded-xl bg-white p-5" style={{ border: "1px solid #E2E8F0" }}>
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

        <div className="flex flex-col rounded-xl bg-white" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "#E2E8F0" }}>
            <div>
              <div className="font-bold" style={{ fontSize: "0.9375rem", color: "#0B1F4D" }}>Recent Activity</div>
              <div className="mt-0.5 text-xs" style={{ color: "#94A3B8" }}>Latest candidate submissions</div>
            </div>
            <span
              className="rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}
            >
              Live
            </span>
          </div>
          {(isLoading ? Array.from({ length: 5 }, () => null) : activity).map((item, index) => (
            <div
              key={item?.id ?? index}
              className="flex items-start gap-4 px-6 py-4 transition-colors"
              style={{ borderBottom: index < 4 ? "1px solid #F1F5F9" : "none" }}
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
                {isLoading ? "..." : item.time}
              </span>
            </div>
          ))}
          {!isLoading && activity.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm" style={{ color: "#94A3B8" }}>
              No recent candidate activity is available yet.
            </div>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  );
}
