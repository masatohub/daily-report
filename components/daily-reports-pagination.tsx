import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { calcPageItems, calcTotalPages } from "@/lib/pagination";

type Props = {
  total: number;
  currentPage: number;
  perPage: number;
  basePath: string;
};

export function DailyReportsPagination({
  total,
  currentPage,
  perPage,
  basePath,
}: Props) {
  const totalPages = calcTotalPages(total, perPage);

  if (totalPages <= 1) return null;

  const pageItems = calcPageItems(currentPage, totalPages);

  const href = (page: number) => `${basePath}?page=${page}`;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={currentPage > 1 ? href(currentPage - 1) : undefined}
            aria-disabled={currentPage <= 1}
            text="前へ"
          />
        </PaginationItem>

        {pageItems.map((item, idx) => {
          if (item === "ellipsis-start" || item === "ellipsis-end") {
            return (
              <PaginationItem key={item}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }
          return (
            <PaginationItem key={idx}>
              <PaginationLink href={href(item)} isActive={item === currentPage}>
                {item}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            href={currentPage < totalPages ? href(currentPage + 1) : undefined}
            aria-disabled={currentPage >= totalPages}
            text="次へ"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
