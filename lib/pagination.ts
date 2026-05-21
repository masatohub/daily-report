export type PageItem = number | "ellipsis-start" | "ellipsis-end";

export function calcTotalPages(total: number, perPage: number): number {
  if (perPage <= 0) return 0;
  return Math.ceil(total / perPage);
}

export function calcPageItems(
  currentPage: number,
  totalPages: number,
): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const delta = 2;
  const left = Math.max(2, currentPage - delta);
  const right = Math.min(totalPages - 1, currentPage + delta);

  const items: PageItem[] = [1];

  if (left > 2) items.push("ellipsis-start");

  for (let i = left; i <= right; i++) {
    items.push(i);
  }

  if (right < totalPages - 1) items.push("ellipsis-end");

  items.push(totalPages);

  return items;
}
