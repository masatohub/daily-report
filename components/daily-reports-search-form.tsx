"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";

/** Returns the first day of the current month as a YYYY-MM-DD string. */
function getDefaultFrom(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

/** Returns today's date as a YYYY-MM-DD string. */
function getDefaultTo(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

const MOCK_USERS = [
  { id: "0", name: "全員" },
  { id: "1", name: "田中太郎" },
  { id: "2", name: "佐藤花子" },
] as const;

export function DailyReportsSearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") ?? getDefaultFrom();
  const to = searchParams.get("to") ?? getDefaultTo();
  const userId = searchParams.get("user_id") ?? "0";
  const keyword = searchParams.get("keyword") ?? "";

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const data = new FormData(form);

      const params = new URLSearchParams();
      const fromVal = (data.get("from") as string) || getDefaultFrom();
      const toVal = (data.get("to") as string) || getDefaultTo();
      const userIdVal = (data.get("user_id") as string) || "0";
      const keywordVal = (data.get("keyword") as string) || "";

      params.set("from", fromVal);
      params.set("to", toVal);
      if (userIdVal !== "0") params.set("user_id", userIdVal);
      if (keywordVal.trim() !== "") params.set("keyword", keywordVal.trim());
      params.set("page", "1");

      router.push(`/daily-reports?${params.toString()}`);
    },
    [router],
  );

  const handleReset = useCallback(() => {
    const params = new URLSearchParams();
    params.set("from", getDefaultFrom());
    params.set("to", getDefaultTo());
    params.set("page", "1");
    router.push(`/daily-reports?${params.toString()}`);
  }, [router]);

  return (
    <form
      onSubmit={handleSubmit}
      className="border-border bg-card mb-6 rounded-lg border p-4"
      aria-label="日報フィルター"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 期間（開始） */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="from"
            className="text-foreground text-sm font-medium"
          >
            期間（開始）
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={from}
            className="border-input bg-background text-foreground focus-visible:ring-ring rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          />
        </div>

        {/* 期間（終了） */}
        <div className="flex flex-col gap-1">
          <label htmlFor="to" className="text-foreground text-sm font-medium">
            期間（終了）
          </label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={to}
            className="border-input bg-background text-foreground focus-visible:ring-ring rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          />
        </div>

        {/* 営業担当者 */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="user_id"
            className="text-foreground text-sm font-medium"
          >
            営業担当者
          </label>
          <select
            id="user_id"
            name="user_id"
            defaultValue={userId}
            className="border-input bg-background text-foreground focus-visible:ring-ring rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            {MOCK_USERS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {/* キーワード */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="keyword"
            className="text-foreground text-sm font-medium"
          >
            キーワード（Problem / Plan）
          </label>
          <input
            id="keyword"
            name="keyword"
            type="text"
            defaultValue={keyword}
            placeholder="例: A社、アポイント"
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button type="submit" size="sm">
          検索
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleReset}>
          リセット
        </Button>
      </div>
    </form>
  );
}
