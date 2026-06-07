export type PaginationPageItem = number | 'ellipsis';

export interface PaginatedResult<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  /** 1-based index of first item on this page */
  startIndex: number;
  /** 1-based index of last item on this page */
  endIndex: number;
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems === 0) {
    return {
      items: [],
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      startIndex: 0,
      endIndex: 0,
    };
  }

  const currentPage = Math.min(Math.max(1, page), totalPages);
  const offset = (currentPage - 1) * pageSize;

  return {
    items: items.slice(offset, offset + pageSize),
    currentPage,
    totalPages,
    totalItems,
    startIndex: offset + 1,
    endIndex: Math.min(offset + pageSize, totalItems),
  };
}

export function getPaginationPages(
  currentPage: number,
  totalPages: number,
): PaginationPageItem[] {
  if (totalPages <= 0) return [];
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: PaginationPageItem[] = [1];

  if (currentPage > 3) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (currentPage < totalPages - 2) {
    pages.push('ellipsis');
  }

  pages.push(totalPages);
  return pages;
}
