export type DailyReport = {
  id: number;
  report_date: string;
  user: {
    id: number;
    name: string;
  };
  visit_count: number;
  problem: string | null;
  plan: string | null;
  comment_count: number;
  created_at: string;
  updated_at: string;
};

export type PaginationMeta = {
  total: number;
  page: number;
  per_page: number;
};

export type DailyReportsResponse = {
  data: DailyReport[];
  meta: PaginationMeta;
};
