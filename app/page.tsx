import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: number;
  description: string;
};

function StatCard({ title, value, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl font-bold tabular-nums">
          {value}
          <span className="text-muted-foreground ml-1 text-base font-normal">件</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-xs">{description}</p>
      </CardContent>
    </Card>
  );
}

type RecentReport = {
  id: number;
  reportDate: string;
  userName: string;
  visitCount: number;
  problemSummary: string;
  commentCount: number;
};

const mockRecentReports: RecentReport[] = [
  {
    id: 1,
    reportDate: "2026-05-21",
    userName: "田中太郎",
    visitCount: 3,
    problemSummary: "A社の担当者が異動になり、引き継ぎが不透明な状況。",
    commentCount: 2,
  },
  {
    id: 2,
    reportDate: "2026-05-21",
    userName: "佐藤花子",
    visitCount: 2,
    problemSummary: "B社の予算承認が遅延しており、契約時期が不明確。",
    commentCount: 1,
  },
  {
    id: 3,
    reportDate: "2026-05-20",
    userName: "田中太郎",
    visitCount: 4,
    problemSummary: "新製品の競合他社との差別化ポイントの整理が必要。",
    commentCount: 0,
  },
  {
    id: 4,
    reportDate: "2026-05-20",
    userName: "佐藤花子",
    visitCount: 1,
    problemSummary: "",
    commentCount: 3,
  },
  {
    id: 5,
    reportDate: "2026-05-19",
    userName: "田中太郎",
    visitCount: 2,
    problemSummary: "C社の発注量が先月比30%減。原因調査が必要。",
    commentCount: 1,
  },
];

const mockStats = {
  thisMonth: 18,
  thisWeek: 6,
  today: 2,
  thisMonthVisits: 47,
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">ダッシュボード</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            営業日報の統計情報と最新レポートを確認できます
          </p>
        </div>
        <Link href="/reports/new" className={buttonVariants()}>
          日報を作成
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="今月の日報件数"
          value={mockStats.thisMonth}
          description="2026年5月の提出合計"
        />
        <StatCard
          title="今週の日報件数"
          value={mockStats.thisWeek}
          description="今週（月〜日）の提出合計"
        />
        <StatCard
          title="今日の日報件数"
          value={mockStats.today}
          description="本日提出済みの件数"
        />
        <StatCard
          title="今月の訪問件数"
          value={mockStats.thisMonthVisits}
          description="訪問記録の合計件数"
        />
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium">最近の日報</h2>
          <Link href="/reports" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            すべて見る
          </Link>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-left">
                  <th className="px-4 py-3 font-medium">報告日</th>
                  <th className="px-4 py-3 font-medium">担当者</th>
                  <th className="px-4 py-3 text-right font-medium">訪問件数</th>
                  <th className="px-4 py-3 font-medium">課題（Problem）</th>
                  <th className="px-4 py-3 text-right font-medium">コメント</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {mockRecentReports.map((report, index) => (
                  <tr
                    key={report.id}
                    className={index < mockRecentReports.length - 1 ? "border-b" : ""}
                  >
                    <td className="text-muted-foreground px-4 py-3 tabular-nums">
                      {report.reportDate}
                    </td>
                    <td className="px-4 py-3 font-medium">{report.userName}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {report.visitCount}
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      {report.problemSummary ? (
                        <span className="text-muted-foreground line-clamp-1">
                          {report.problemSummary.slice(0, 50)}
                          {report.problemSummary.length > 50 ? "…" : ""}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {report.commentCount > 0 ? (
                        <Badge variant="secondary">{report.commentCount}</Badge>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/reports/${report.id}`}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                      >
                        詳細
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">日報一覧</CardTitle>
            <CardDescription>期間・担当者で絞り込んで閲覧</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/reports" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
              一覧を開く
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">顧客マスタ</CardTitle>
            <CardDescription>顧客の登録・編集・削除</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/customers" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
              一覧を開く
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">ユーザーマスタ</CardTitle>
            <CardDescription>担当者の登録・編集・削除</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/users" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
              一覧を開く
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
