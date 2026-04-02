import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.openalex.org/works";

// --- Normalized shape returned to the client ---

interface NormalizedWork {
  id: string;
  title: string;
  year: number | null;
  doi: string | null;
  isOA: boolean;
  oaUrl: string | null;
  citedByCount: number;
  authors: { name: string; orcid: string | null }[];
  journal: string | null;
  type: string | null;
}

interface ApiResponse {
  results: NormalizedWork[];
  meta: {
    count: number;
    perPage: number;
    nextCursor: string | null;
  };
}

// --- Raw OpenAlex types (minimal, only fields we use) ---

interface RawWork {
  id: string;
  display_name: string;
  publication_year: number | null;
  doi: string | null;
  type: string | null;
  cited_by_count: number;
  open_access: { is_oa: boolean; oa_url: string | null };
  authorships: { author: { display_name: string; orcid: string | null } }[];
  primary_location: { source: { display_name: string } | null } | null;
}

interface RawResponse {
  meta: { count: number; per_page: number; next_cursor: string | null };
  results: RawWork[];
}

// --- Validation helpers ---

const SORT_ALLOWLIST = new Set([
  "relevance_score:desc",
  "cited_by_count:desc",
  "cited_by_count:asc",
  "publication_year:desc",
  "publication_year:asc",
]);

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// --- Route handler ---

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const search = sp.get("search") ?? "";
  const yearFrom = sp.get("yearFrom");
  const yearTo = sp.get("yearTo");
  const isOA = sp.get("isOA");
  const minCitations = sp.get("minCitations");
  const perPage = clamp(Number(sp.get("perPage") ?? "25"), 1, 100);
  const cursor = sp.get("cursor") ?? "*";
  const sort = sp.get("sort") ?? "relevance_score:desc";

  if (!SORT_ALLOWLIST.has(sort)) {
    return NextResponse.json(
      { error: `Invalid sort. Allowed: ${[...SORT_ALLOWLIST].join(", ")}` },
      { status: 400 }
    );
  }

  // Build filter string
  const filters: string[] = [];

  if (yearFrom && yearTo) {
    filters.push(`publication_year:${yearFrom}-${yearTo}`);
  } else if (yearFrom) {
    filters.push(`publication_year:>${Number(yearFrom) - 1}`);
  } else if (yearTo) {
    filters.push(`publication_year:<${Number(yearTo) + 1}`);
  }

  if (isOA === "true" || isOA === "false") {
    filters.push(`is_oa:${isOA}`);
  }

  if (minCitations) {
    const n = parseInt(minCitations, 10);
    if (!isNaN(n) && n >= 0) {
      filters.push(`cited_by_count:>${n - 1}`);
    }
  }

  // Build request URL
  const url = new URL(BASE_URL);

  if (search) url.searchParams.set("search", search);
  if (filters.length) url.searchParams.set("filter", filters.join(","));

  url.searchParams.set("sort", sort);
  url.searchParams.set("per-page", String(perPage));
  url.searchParams.set("cursor", cursor);
  url.searchParams.set("select", [
    "id",
    "display_name",
    "publication_year",
    "doi",
    "type",
    "cited_by_count",
    "open_access",
    "authorships",
    "primary_location",
  ].join(","));

  // Polite pool / premium key
  const apiKey = process.env.OPENALEX_API_KEY;
  if (apiKey) url.searchParams.set("api_key", apiKey);

  // Fetch
  let raw: RawResponse;
  try {
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "openalex-query-interface/1.0" },
      next: { revalidate: 60 }, // cache for 60s
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `OpenAlex error ${res.status}: ${text.slice(0, 200)}` },
        { status: 502 }
      );
    }

    raw = await res.json();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Fetch failed: ${message}` }, { status: 502 });
  }

  // Normalize
  const results: NormalizedWork[] = raw.results.map((w) => ({
    id: w.id,
    title: w.display_name,
    year: w.publication_year,
    doi: w.doi ?? null,
    isOA: w.open_access?.is_oa ?? false,
    oaUrl: w.open_access?.oa_url ?? null,
    citedByCount: w.cited_by_count,
    authors: (w.authorships ?? []).map((a) => ({
      name: a.author.display_name,
      orcid: a.author.orcid ?? null,
    })),
    journal: w.primary_location?.source?.display_name ?? null,
    type: w.type ?? null,
  }));

  const response: ApiResponse = {
    results,
    meta: {
      count: raw.meta.count,
      perPage: raw.meta.per_page,
      nextCursor: raw.meta.next_cursor ?? null,
    },
  };

  return NextResponse.json(response);
}
