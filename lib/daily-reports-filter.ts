import type { DailyReport } from "@/types/daily-report";

export type DailyReportsFilterParams = {
  from?: string;
  to?: string;
  user_id?: string;
  keyword?: string;
};

/**
 * Filter an array of DailyReport records by date range, user, and keyword.
 *
 * - `from` / `to`: inclusive date range against `report_date` (YYYY-MM-DD strings)
 * - `user_id`: exact match against `user.id` (parsed as integer; "0" or empty = no filter)
 * - `keyword`: case-insensitive partial match against `problem` and/or `plan`
 */
export function filterDailyReports(
  reports: DailyReport[],
  params: DailyReportsFilterParams,
): DailyReport[] {
  const { from, to, user_id, keyword } = params;

  return reports.filter((report) => {
    if (from && report.report_date < from) return false;
    if (to && report.report_date > to) return false;

    const userId = user_id ? parseInt(user_id, 10) : 0;
    if (userId > 0 && report.user.id !== userId) return false;

    if (keyword && keyword.trim() !== "") {
      const needle = keyword.trim().toLowerCase();
      const inProblem = report.problem?.toLowerCase().includes(needle) ?? false;
      const inPlan = report.plan?.toLowerCase().includes(needle) ?? false;
      if (!inProblem && !inPlan) return false;
    }

    return true;
  });
}
