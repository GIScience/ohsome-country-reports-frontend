import { parquetReadObjects } from "hyparquet";

/** One decoded parquet row, keyed by column name. INT64 columns (e.g.
 * quality_class, sum_value) are converted from BigInt to plain numbers. */
export type ParquetRow = Record<string, any>;

// Decoded rows per URL, kept for the session (cleared on country change by
// clearParquetCache()). Storing the promise rather than the result means
// concurrent callers for the same file (e.g. the map lookups and the
// indicator cards loading the same layer at once) share one download.
const rowCache = new Map<string, Promise<ParquetRow[]>>();

/**
 * Downloads a parquet file once and decodes it in the browser with hyparquet
 * (pure JS, bundled - no CDN or extension download). Every query in
 * dataService.ts filters these rows in plain JS.
 */
export function loadParquetRows(url: string): Promise<ParquetRow[]> {
  let cached = rowCache.get(url);
  if (!cached) {
    cached = fetchAndDecode(url);
    rowCache.set(url, cached);
    // Don't cache a failure - the next call should retry instead of getting
    // the same rejected promise for the rest of the session.
    cached.catch(() => rowCache.delete(url));
  }
  return cached;
}

async function fetchAndDecode(url: string): Promise<ParquetRow[]> {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to fetch parquet file (${resp.status}): ${url}`);
  }
  const file = await resp.arrayBuffer();
  const rows = await parquetReadObjects({ file });
  for (const row of rows) {
    for (const key in row) {
      if (typeof row[key] === "bigint") row[key] = Number(row[key]);
    }
  }
  return rows;
}

export function clearParquetCache() {
  rowCache.clear();
}
