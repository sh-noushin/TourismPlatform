import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type QueryInput =
  | URLSearchParams
  | Record<string, string | string[] | undefined>
  | string
  | undefined;

interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  basePath?: string;
  currentQuery?: QueryInput;
  className?: string;
}

const normalizeQuery = (input: QueryInput) => {
  if (!input) {
    return new URLSearchParams();
  }

  if (typeof input === "string") {
    return new URLSearchParams(input);
  }

  if (input instanceof URLSearchParams) {
    return new URLSearchParams(input);
  }

  const params = new URLSearchParams();
  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }
    params.set(key, value);
  });

  return params;
};

const buildHref = (basePath: string, params: URLSearchParams, targetPage: number) => {
  const path = basePath || "";
  const query = new URLSearchParams(params);
  query.set("page", targetPage.toString());
  const queryString = query.toString();
  if (!queryString) {
    return path || ".";
  }
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${queryString}`;
};

export function Pagination({
  page,
  pageSize,
  totalCount,
  basePath = "",
  currentQuery,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / Math.max(1, pageSize)));
  const params = normalizeQuery(currentQuery);
  const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
  const endPage = Math.min(totalPages, startPage + 4);
  const pages = [];
  for (let i = startPage; i <= endPage; i += 1) {
    pages.push(i);
  }

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center gap-2", className)}
    >
      <Link
        href={buildHref(basePath, params, Math.max(1, page - 1))}
        className={cn(
          "rounded-full border border-border px-3 py-1 text-sm",
          page <= 1 ? "pointer-events-none opacity-40" : ""
        )}
      >
        Previous
      </Link>

      {pages.map((pageNumber) => (
        <Link
          key={pageNumber}
          href={buildHref(basePath, params, pageNumber)}
          className={cn(
            "rounded-full border px-3 py-1 text-sm",
            pageNumber === page
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-surface text-text"
          )}
        >
          {pageNumber}
        </Link>
      ))}

      <Link
        href={buildHref(basePath, params, Math.min(totalPages, page + 1))}
        className={cn(
          "rounded-full border border-border px-3 py-1 text-sm",
          page >= totalPages ? "pointer-events-none opacity-40" : ""
        )}
      >
        Next
      </Link>
    </nav>
  );
}