import { render, screen } from "@testing-library/react";
import { DailyReportsPagination } from "@/components/daily-reports-pagination";

vi.mock("@/components/ui/pagination", () => ({
  Pagination: ({ children }: { children: React.ReactNode }) => (
    <nav aria-label="pagination">{children}</nav>
  ),
  PaginationContent: ({ children }: { children: React.ReactNode }) => (
    <ul>{children}</ul>
  ),
  PaginationItem: ({ children }: { children: React.ReactNode }) => (
    <li>{children}</li>
  ),
  PaginationLink: ({
    href,
    isActive,
    children,
  }: {
    href?: string;
    isActive?: boolean;
    children: React.ReactNode;
  }) => (
    <a href={href} aria-current={isActive ? "page" : undefined}>
      {children}
    </a>
  ),
  PaginationPrevious: ({
    href,
    text,
  }: {
    href?: string;
    "aria-disabled"?: string;
    text?: string;
  }) => <a href={href}>{text ?? "前へ"}</a>,
  PaginationNext: ({
    href,
    text,
  }: {
    href?: string;
    "aria-disabled"?: string;
    text?: string;
  }) => <a href={href}>{text ?? "次へ"}</a>,
  PaginationEllipsis: () => <span aria-hidden>…</span>,
}));

describe("DailyReportsPagination", () => {
  const basePath = "/daily-reports";

  describe("非表示条件", () => {
    it("総件数が perPage 以下のとき何も描画しない", () => {
      const { container } = render(
        <DailyReportsPagination
          total={10}
          currentPage={1}
          perPage={10}
          basePath={basePath}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("total が 0 のとき何も描画しない", () => {
      const { container } = render(
        <DailyReportsPagination
          total={0}
          currentPage={1}
          perPage={10}
          basePath={basePath}
        />,
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("ページリンク生成", () => {
    it("25件・10件/ページのとき 3 ページ分のリンクを生成する", () => {
      render(
        <DailyReportsPagination
          total={25}
          currentPage={1}
          perPage={10}
          basePath={basePath}
        />,
      );
      expect(screen.getByRole("link", { name: "1" })).toHaveAttribute(
        "href",
        "/daily-reports?page=1",
      );
      expect(screen.getByRole("link", { name: "2" })).toHaveAttribute(
        "href",
        "/daily-reports?page=2",
      );
      expect(screen.getByRole("link", { name: "3" })).toHaveAttribute(
        "href",
        "/daily-reports?page=3",
      );
    });

    it("現在のページに aria-current='page' が付く", () => {
      render(
        <DailyReportsPagination
          total={25}
          currentPage={2}
          perPage={10}
          basePath={basePath}
        />,
      );
      const page2 = screen.getByRole("link", { name: "2" });
      expect(page2).toHaveAttribute("aria-current", "page");

      const page1 = screen.getByRole("link", { name: "1" });
      expect(page1).not.toHaveAttribute("aria-current");
    });
  });

  describe("前へ・次へリンク", () => {
    it("1 ページ目のとき「前へ」は href なし", () => {
      render(
        <DailyReportsPagination
          total={25}
          currentPage={1}
          perPage={10}
          basePath={basePath}
        />,
      );
      // href なしの <a> は ARIA 上 link ロールを持たないため getByText で取得
      const prev = screen.getByText("前へ");
      expect(prev).not.toHaveAttribute("href");
    });

    it("最終ページのとき「次へ」は href なし", () => {
      render(
        <DailyReportsPagination
          total={25}
          currentPage={3}
          perPage={10}
          basePath={basePath}
        />,
      );
      const next = screen.getByText("次へ");
      expect(next).not.toHaveAttribute("href");
    });

    it("2 ページ目のとき「前へ」は 1 ページ目を指す", () => {
      render(
        <DailyReportsPagination
          total={25}
          currentPage={2}
          perPage={10}
          basePath={basePath}
        />,
      );
      expect(screen.getByRole("link", { name: "前へ" })).toHaveAttribute(
        "href",
        "/daily-reports?page=1",
      );
    });

    it("2 ページ目のとき「次へ」は 3 ページ目を指す", () => {
      render(
        <DailyReportsPagination
          total={25}
          currentPage={2}
          perPage={10}
          basePath={basePath}
        />,
      );
      expect(screen.getByRole("link", { name: "次へ" })).toHaveAttribute(
        "href",
        "/daily-reports?page=3",
      );
    });
  });

  describe("省略記号（エリプシス）", () => {
    it("ページ数が多いとき省略記号が表示される", () => {
      render(
        <DailyReportsPagination
          total={100}
          currentPage={5}
          perPage={10}
          basePath={basePath}
        />,
      );
      const ellipses = screen.getAllByText("…");
      expect(ellipses.length).toBeGreaterThanOrEqual(1);
    });

    it("ページ数が少ないとき省略記号が表示されない", () => {
      render(
        <DailyReportsPagination
          total={30}
          currentPage={2}
          perPage={10}
          basePath={basePath}
        />,
      );
      expect(screen.queryByText("…")).toBeNull();
    });
  });
});
