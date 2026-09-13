import { HttpParams } from '@angular/common/http';
import { SfTableSort } from './table.models';

/**
 * Rows per page across every list screen. One constant rather than a literal in
 * each page, so the number is changed in one place.
 */
export const DEFAULT_PAGE_SIZE = 10;

/** The envelope every paged API endpoint returns. */
export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PageRequest {
  /** 1-based, matching the API. The table component counts from 0. */
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
}

/**
 * Empty values are dropped rather than sent blank: a `search=` with nothing
 * after it would otherwise become a filter for the empty string.
 */
export function toPageParams(request: PageRequest = {}): HttpParams {
  let params = new HttpParams()
    .set('page', (request.page ?? 1).toString())
    .set('pageSize', (request.pageSize ?? DEFAULT_PAGE_SIZE).toString());

  if (request.search?.trim()) {
    params = params.set('search', request.search.trim());
  }

  if (request.sort?.trim()) {
    params = params.set('sort', request.sort.trim());
  }

  return params;
}

/** Turns the table's sort state into the API's `field:direction` term. */
export function toSortTerm(sort: SfTableSort | null | undefined): string | undefined {
  if (!sort?.field) return undefined;
  return `${sort.field}:${sort.direction}`;
}

/** A safe stand-in when a request fails, so the table renders empty instead of stale. */
export function emptyPage<T>(pageSize = DEFAULT_PAGE_SIZE): PagedResult<T> {
  return { items: [], total: 0, page: 1, pageSize };
}
