import { describe, it, expect } from "vitest";
import { filterDailyReports } from "@/lib/daily-reports-filter";
import type { DailyReport } from "@/types/daily-report";

function makeReport(overrides: Partial<DailyReport> & Pick<DailyReport, "id" | "report_date">): DailyReport {
  return {
    user: { id: 1, name: "田中太郎" },
    visit_count: 1,
    problem: null,
    plan: null,
    comment_count: 0,
    created_at: `${overrides.report_date}T09:00:00Z`,
    updated_at: `${overrides.report_date}T09:00:00Z`,
    ...overrides,
  };
}

const REPORTS: DailyReport[] = [
  makeReport({ id: 1, report_date: "2026-05-01", user: { id: 1, name: "田中太郎" }, problem: "A社の課題あり", plan: "アポイントを取る" }),
  makeReport({ id: 2, report_date: "2026-05-10", user: { id: 2, name: "佐藤花子" }, problem: "B社の予算縮小", plan: "フォローアップ電話" }),
  makeReport({ id: 3, report_date: "2026-05-15", user: { id: 1, name: "田中太郎" }, problem: null, plan: "C社デモ資料準備" }),
  makeReport({ id: 4, report_date: "2026-05-20", user: { id: 2, name: "佐藤花子" }, problem: "D社担当者が異動", plan: null }),
  makeReport({ id: 5, report_date: "2026-05-21", user: { id: 1, name: "田中太郎" }, problem: "E社案件停滞", plan: "新担当者に挨拶" }),
];

describe("filterDailyReports", () => {
  describe("フィルターなし", () => {
    it("パラメータが空のとき全件返す", () => {
      const result = filterDailyReports(REPORTS, {});
      expect(result).toHaveLength(REPORTS.length);
    });
  });

  describe("日付範囲フィルター", () => {
    it("from を指定するとその日付以降の日報のみ返す", () => {
      const result = filterDailyReports(REPORTS, { from: "2026-05-15" });
      const dates = result.map((r) => r.report_date);
      expect(dates).toEqual(["2026-05-15", "2026-05-20", "2026-05-21"]);
    });

    it("to を指定するとその日付以前の日報のみ返す", () => {
      const result = filterDailyReports(REPORTS, { to: "2026-05-10" });
      const dates = result.map((r) => r.report_date);
      expect(dates).toEqual(["2026-05-01", "2026-05-10"]);
    });

    it("from と to の両方を指定すると範囲内の日報のみ返す", () => {
      const result = filterDailyReports(REPORTS, { from: "2026-05-10", to: "2026-05-20" });
      const ids = result.map((r) => r.id);
      expect(ids).toEqual([2, 3, 4]);
    });

    it("from と to が同じ日のとき当日の日報のみ返す", () => {
      const result = filterDailyReports(REPORTS, { from: "2026-05-10", to: "2026-05-10" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it("範囲外のとき空配列を返す", () => {
      const result = filterDailyReports(REPORTS, { from: "2026-06-01", to: "2026-06-30" });
      expect(result).toHaveLength(0);
    });
  });

  describe("ユーザーフィルター", () => {
    it("user_id を指定するとそのユーザーの日報のみ返す", () => {
      const result = filterDailyReports(REPORTS, { user_id: "1" });
      expect(result.every((r) => r.user.id === 1)).toBe(true);
      // 田中のレポートは id:1, id:3, id:5 の3件
      expect(result).toHaveLength(3);
    });

    it("存在しない user_id を指定すると空配列を返す", () => {
      const result = filterDailyReports(REPORTS, { user_id: "99" });
      expect(result).toHaveLength(0);
    });

    it("user_id が '0' のとき全ユーザーを返す", () => {
      const result = filterDailyReports(REPORTS, { user_id: "0" });
      expect(result).toHaveLength(REPORTS.length);
    });

    it("user_id が空文字のとき全ユーザーを返す", () => {
      const result = filterDailyReports(REPORTS, { user_id: "" });
      expect(result).toHaveLength(REPORTS.length);
    });
  });

  describe("キーワードフィルター", () => {
    it("problem に一致するキーワードで絞り込める", () => {
      const result = filterDailyReports(REPORTS, { keyword: "A社" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it("plan に一致するキーワードで絞り込める", () => {
      const result = filterDailyReports(REPORTS, { keyword: "フォローアップ" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it("problem と plan の両方を対象に部分一致検索する", () => {
      // "担当者" は problem(id:4) と plan(id:5) の両方に含まれる
      const result = filterDailyReports(REPORTS, { keyword: "担当者" });
      const ids = result.map((r) => r.id).sort();
      expect(ids).toEqual([4, 5]);
    });

    it("大文字・小文字を区別しない（ASCII範囲）", () => {
      const reportsWithAscii: DailyReport[] = [
        makeReport({ id: 10, report_date: "2026-05-01", problem: "ABC issue", plan: null }),
      ];
      const result = filterDailyReports(reportsWithAscii, { keyword: "abc" });
      expect(result).toHaveLength(1);
    });

    it("problem・plan が両方 null の日報はキーワードにマッチしない", () => {
      const reportsAllNull: DailyReport[] = [
        makeReport({ id: 20, report_date: "2026-05-01", problem: null, plan: null }),
      ];
      const result = filterDailyReports(reportsAllNull, { keyword: "anything" });
      expect(result).toHaveLength(0);
    });

    it("空白のみのキーワードはフィルターを適用しない", () => {
      const result = filterDailyReports(REPORTS, { keyword: "   " });
      expect(result).toHaveLength(REPORTS.length);
    });

    it("一致しないキーワードで空配列を返す", () => {
      const result = filterDailyReports(REPORTS, { keyword: "存在しないキーワード" });
      expect(result).toHaveLength(0);
    });
  });

  describe("複合フィルター", () => {
    it("日付範囲・ユーザー・キーワードを組み合わせて絞り込める", () => {
      // 田中(user_id:1)、2026-05-15以降、"担当者"を含むレポート
      // → id:5 のみ該当（problem: "E社案件停滞", plan: "新担当者に挨拶"）
      const result = filterDailyReports(REPORTS, {
        from: "2026-05-15",
        user_id: "1",
        keyword: "担当者",
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(5);
    });

    it("ユーザーと日付範囲の組み合わせで正しく絞り込める", () => {
      // 佐藤(user_id:2)、2026-05-10〜2026-05-20
      const result = filterDailyReports(REPORTS, {
        from: "2026-05-10",
        to: "2026-05-20",
        user_id: "2",
      });
      const ids = result.map((r) => r.id);
      expect(ids).toEqual([2, 4]);
    });
  });
});
