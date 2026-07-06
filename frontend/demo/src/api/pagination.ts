/**
 * Walk a DRF list endpoint to the end and collect every item.
 *
 * hey-api's fetch client does not follow pagination for you — a list call
 * returns exactly one response. This helper drives the hey-api SDK function
 * across all pages and returns a single flat array.
 */

/** DRF's paginated list envelope (PageNumber / LimitOffset / Cursor share it). */
export interface Paginated<T> {
  results: T[]
  next?: string | null
  previous?: string | null
  count?: number
}

/** The item type produced by a hey-api list SDK function (e.g. `suppliersList`). */
export type ListItem<F> = F extends (...args: never[]) => infer R
  ? Awaited<R> extends { data?: infer D }
    ? NonNullable<D> extends readonly (infer I)[]
      ? I
      : NonNullable<D> extends Paginated<infer I>
        ? I
        : never
    : never
  : never

/**
 * Call a hey-api list endpoint and follow pagination until exhausted.
 *
 * Handles both shapes transparently:
 * - **unpaginated** (a bare array — the current demo API): returned as-is.
 * - **paginated** (`{ results, next }`): reads the query string from each
 *   `next` URL and replays it on the following call, so it supports
 *   PageNumber, LimitOffset, and Cursor pagination without knowing which.
 *
 * @example
 * const suppliers = await fetchAll(suppliersList) // Supplier[]
 */
export async function fetchAll<F extends (...args: never[]) => unknown>(
  listFn: F,
): Promise<ListItem<F>[]> {
  const call = listFn as unknown as (options: {
    query?: Record<string, string>
    throwOnError: true
  }) => Promise<{ data: ListItem<F>[] | Paginated<ListItem<F>> }>

  const items: ListItem<F>[] = []
  let query: Record<string, string> | undefined

  for (;;) {
    const { data } = await call({ query, throwOnError: true })

    if (Array.isArray(data)) {
      items.push(...data)
      break
    }

    items.push(...data.results)
    if (!data.next) break
    query = Object.fromEntries(new URL(data.next).searchParams)
  }

  return items
}
