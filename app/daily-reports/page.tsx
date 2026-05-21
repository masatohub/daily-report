import Link from "next/link";
import { Suspense } from "react";
import { DailyReportsPagination } from "@/components/daily-reports-pagination";
import { DailyReportsSearchForm } from "@/components/daily-reports-search-form";
import { filterDailyReports } from "@/lib/daily-reports-filter";
import type { DailyReport, DailyReportsResponse } from "@/types/daily-report";

const PER_PAGE = 10;

// Today fixed to 2026-05-21 for mock data consistency
const MOCK_TODAY = "2026-05-21";

function generateMockReports(): DailyReport[] {
  const users = [
    { id: 1, name: "田中太郎" },
    { id: 2, name: "佐藤花子" },
  ];
  return Array.from({ length: 25 }, (_, i) => {
    const date = new Date(MOCK_TODAY);
    date.setDate(date.getDate() - i);
    const user = users[i % users.length];
    return {
      id: i + 1,
      report_date: date.toISOString().slice(0, 10),
      user,
      visit_count: (i % 3) + 1,
      problem:
        i % 4 === 0
          ? null
          : `課題${i + 1}: A社の担当者が異動になり引き継ぎが不透明な状況です。`,
      plan:
        i % 5 === 0
          ? null
          : `計画${i + 1}: 翌日のアポイントを取得して新担当者へご挨拶する予定。`,
      comment_count: i % 3,
      created_at: `${date.toISOString().slice(0, 10)}T09:00:00Z`,
      updated_at: `${date.toISOString().slice(0, 10)}T10:30:00Z`,
    };
  });
}

type FilterParams = {
  page: number;
  from?: string;
  to?: string;
  user_id?: string;
  keyword?: string;
};

function getMockDailyReports(
  params: FilterParams,
  perPage: number,
): DailyReportsResponse {
  const allReports = generateMockReports();
  const filtered = filterDailyReports(allReports, {
    from: params.from,
    to: params.to,
    user_id: params.user_id,
    keyword: params.keyword,
  });
  const start = (params.page - 1) * perPage;
  return {
    data: filtered.slice(start, start + perPage),
    meta: { total: filtered.length, page: params.page, per_page: perPage },
  };
}

type PageProps = {
  searchParams: Promise<{
    page?: string;
    from?: string;
    to?: string;
    user_id?: string;
    keyword?: string;
  }>;
};

export default async function DailyReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));

  const filterParams: FilterParams = {
    page,
    from: params.from,
    to: params.to,
    user_id: params.user_id,
    keyword: params.keyword,
  };

  const { data: reports, meta } = getMockDailyReports(filterParams, PER_PAGE);

  // Build a searchQuery string that carries filter params (excluding page)
  // so that pagination links can preserve the current filter state.
  const filterSearchParams = new URLSearchParams();
  if (params.from) filterSearchParams.set("from", params.from);
  if (params.to) filterSearchParams.set("to", params.to);
  if (params.user_id) filterSearchParams.set("user_id", params.user_id);
  if (params.keyword) filterSearchParams.set("keyword", params.keyword);
  const searchQuery = filterSearchParams.toString();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-foreground text-2xl font-semibold">日報一覧</h1>
        <Link
          href="/daily-reports/new"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
        >
          新規作成
        </Link>
      </div>

      {/* Filter form — wrapped in Suspense because it uses useSearchParams internally */}
      <Suspense fallback={null}>
        <DailyReportsSearchForm />
      </Suspense>

      <div className="border-border bg-card rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border bg-muted/50 border-b">
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                報告日
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                担当者
              </th>
              <th className="text-muted-foreground px-4 py-3 text-center font-medium">
                訪問件数
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                課題（Problem）
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                計画（Plan）
              </th>
              <th className="text-muted-foreground px-4 py-3 text-center font-medium">
                コメント
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr
                key={report.id}
                className="border-border hover:bg-muted/30 border-b last:border-0"
              >
                <td className="text-foreground px-4 py-3">
                  <Link
                    href={`/daily-reports/${report.id}`}
                    className="block hover:underline"
                  >
                    {report.report_date}
                  </Link>
                </td>
                <td className="text-foreground px-4 py-3">
                  {report.user.name}
                </td>
                <td className="text-foreground px-4 py-3 text-center">
                  {report.visit_count}
                </td>
                <td className="text-muted-foreground max-w-[180px] truncate px-4 py-3">
                  {report.problem ? report.problem.slice(0, 50) : "—"}
                </td>
                <td className="text-muted-foreground max-w-[180px] truncate px-4 py-3">
                  {report.plan ? report.plan.slice(0, 50) : "—"}
                </td>
                <td className="text-foreground px-4 py-3 text-center">
                  {report.comment_count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {reports.length === 0 && (
          <p className="text-muted-foreground py-12 text-center">
            表示できる日報がありません
          </p>
        )}
      </div>

      <div className="text-muted-foreground mt-4 flex items-center justify-between text-sm">
        <span>
          {meta.total === 0
            ? "0 件"
            : `${meta.total} 件中 ${(page - 1) * PER_PAGE + 1}〜${Math.min(page * PER_PAGE, meta.total)} 件を表示`}
        </span>
      </div>

      <DailyReportsPagination
        total={meta.total}
        currentPage={page}
        perPage={PER_PAGE}
        basePath="/daily-reports"
        searchQuery={searchQuery}
      />
    </div>
  );
}
