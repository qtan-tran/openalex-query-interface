import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_URL = "https://api.openalex.org";

const VALID_ENTITIES = ["works", "authors", "institutions", "sources", "concepts"] as const;
type Entity = (typeof VALID_ENTITIES)[number];

const VALID_SORTS: Record<Entity, readonly string[]> = {
  works:        ["relevance_score:desc", "cited_by_count:desc", "cited_by_count:asc", "publication_year:desc", "publication_year:asc"],
  authors:      ["relevance_score:desc", "cited_by_count:desc", "cited_by_count:asc", "works_count:desc"],
  institutions: ["relevance_score:desc", "cited_by_count:desc", "cited_by_count:asc", "works_count:desc"],
  sources:      ["relevance_score:desc", "cited_by_count:desc", "cited_by_count:asc", "works_count:desc"],
  concepts:     ["relevance_score:desc", "cited_by_count:desc", "cited_by_count:asc", "works_count:desc"],
};

// Fields fetched from OpenAlex per entity (reduces payload size)
const SELECT_FIELDS: Record<Entity, string[]> = {
  works:        ["id", "display_name", "publication_year", "doi", "type", "cited_by_count", "open_access", "authorships", "primary_location"],
  authors:      ["id", "display_name", "orcid", "works_count", "cited_by_count", "last_known_institution", "x_concepts"],
  institutions: ["id", "display_name", "ror", "country_code", "type", "works_count", "cited_by_count", "homepage_url"],
  sources:      ["id", "display_name", "issn_l", "type", "is_oa", "host_organization_name", "works_count", "cited_by_count"],
  concepts:     ["id", "display_name", "level", "description", "works_count", "cited_by_count", "wikidata"],
};

const CURRENT_YEAR = new Date().getFullYear();
const FETCH_TIMEOUT_MS = 10_000;
const MAX_AUTHORS = 10;

// ---------------------------------------------------------------------------
// Normalized result types
// ---------------------------------------------------------------------------

interface NormalizedWork {
  id: string; title: string; year: number | null; doi: string | null;
  isOA: boolean; oaUrl: string | null; citedByCount: number;
  authors: { name: string; orcid: string | null }[];
  journal: string | null; type: string | null;
}

interface NormalizedAuthor {
  id: string; name: string; orcid: string | null;
  worksCount: number; citedByCount: number;
  institution: string | null;
  topConcepts: string[];
}

interface NormalizedInstitution {
  id: string; name: string; ror: string | null;
  country: string | null; type: string | null;
  homepage: string | null; worksCount: number; citedByCount: number;
}

interface NormalizedSource {
  id: string; name: string; issnL: string | null;
  type: string | null; isOA: boolean;
  hostOrg: string | null; worksCount: number; citedByCount: number;
}

interface NormalizedConcept {
  id: string; name: string; level: number;
  description: string | null; wikidata: string | null;
  worksCount: number; citedByCount: number;
}

type NormalizedResult =
  | NormalizedWork | NormalizedAuthor | NormalizedInstitution
  | NormalizedSource | NormalizedConcept;

interface ApiResponse {
  entity: Entity;
  results: NormalizedResult[];
  meta: { count: number; perPage: number; nextCursor: string | null };
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function parsePositiveInt(value: string | null): number | null {
  if (!value) return null;
  const n = parseInt(value, 10);
  return isNaN(n) || n < 0 ? null : n;
}

function parseYear(value: string | null): number | "invalid" | null {
  if (!value) return null;
  const n = parseInt(value, 10);
  if (isNaN(n) || n < 1000 || n > CURRENT_YEAR + 1) return "invalid";
  return n;
}

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeResults(entity: Entity, raw: any[]): NormalizedResult[] {
  switch (entity) {
    case "works":
      return raw.map((w): NormalizedWork => ({
        id:           w.id,
        title:        w.display_name ?? "",
        year:         w.publication_year ?? null,
        doi:          w.doi ?? null,
        isOA:         w.open_access?.is_oa ?? false,
        oaUrl:        w.open_access?.oa_url ?? null,
        citedByCount: w.cited_by_count ?? 0,
        authors:      (w.authorships ?? []).slice(0, MAX_AUTHORS).map((a: any) => ({
          name:  a.author?.display_name ?? "",
          orcid: a.author?.orcid ?? null,
        })),
        journal:      w.primary_location?.source?.display_name ?? null,
        type:         w.type ?? null,
      }));

    case "authors":
      return raw.map((a): NormalizedAuthor => ({
        id:           a.id,
        name:         a.display_name ?? "",
        orcid:        a.orcid ?? null,
        worksCount:   a.works_count ?? 0,
        citedByCount: a.cited_by_count ?? 0,
        institution:  a.last_known_institution?.display_name ?? null,
        topConcepts:  (a.x_concepts ?? []).slice(0, 3).map((c: any) => c.display_name),
      }));

    case "institutions":
      return raw.map((i): NormalizedInstitution => ({
        id:           i.id,
        name:         i.display_name ?? "",
        ror:          i.ror ?? null,
        country:      i.country_code ?? null,
        type:         i.type ?? null,
        homepage:     i.homepage_url ?? null,
        worksCount:   i.works_count ?? 0,
        citedByCount: i.cited_by_count ?? 0,
      }));

    case "sources":
      return raw.map((s): NormalizedSource => ({
        id:           s.id,
        name:         s.display_name ?? "",
        issnL:        s.issn_l ?? null,
        type:         s.type ?? null,
        isOA:         s.is_oa ?? false,
        hostOrg:      s.host_organization_name ?? null,
        worksCount:   s.works_count ?? 0,
        citedByCount: s.cited_by_count ?? 0,
      }));

    case "concepts":
      return raw.map((c): NormalizedConcept => ({
        id:           c.id,
        name:         c.display_name ?? "",
        level:        c.level ?? 0,
        description:  c.description ?? null,
        wikidata:     c.wikidata ?? null,
        worksCount:   c.works_count ?? 0,
        citedByCount: c.cited_by_count ?? 0,
      }));
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  // -- entity --
  const entityParam = sp.get("entity") ?? "works";
  if (!(VALID_ENTITIES as readonly string[]).includes(entityParam)) {
    return err(`Invalid entity. Must be one of: ${VALID_ENTITIES.join(", ")}`);
  }
  const entity = entityParam as Entity;

  // -- search --
  const search = sp.get("search")?.trim() ?? "";

  // -- year range (works only) --
  const yearFromRaw = parseYear(sp.get("yearFrom"));
  const yearToRaw   = parseYear(sp.get("yearTo"));
  if (yearFromRaw === "invalid") return err("yearFrom must be a valid year (1000–present)");
  if (yearToRaw   === "invalid") return err("yearTo must be a valid year (1000–present)");
  if (yearFromRaw !== null && yearToRaw !== null && yearFromRaw > yearToRaw) {
    return err("yearFrom must be less than or equal to yearTo");
  }
  const yearFrom = yearFromRaw as number | null;
  const yearTo   = yearToRaw   as number | null;

  // -- isOA (works and sources only) --
  const isOAParam = sp.get("isOA");
  if (isOAParam !== null && isOAParam !== "true" && isOAParam !== "false") {
    return err('isOA must be "true" or "false"');
  }
  const isOA = isOAParam as "true" | "false" | null;

  // -- minCitations (works only) --
  const minCitationsParam = sp.get("minCitations");
  const minCitations = parsePositiveInt(minCitationsParam);
  if (minCitationsParam !== null && minCitations === null) {
    return err("minCitations must be a non-negative integer");
  }

  // -- perPage --
  const perPageParam = sp.get("perPage");
  const perPageRaw = perPageParam !== null ? Number(perPageParam) : 25;
  if (isNaN(perPageRaw)) return err("perPage must be a number");
  const perPage = clamp(Math.floor(perPageRaw), 1, 100);

  // -- cursor --
  const cursor = sp.get("cursor") ?? "*";

  // -- sort --
  // relevance_score requires a search query; fall back to cited_by_count:desc when search is empty
  const defaultSort = search ? "relevance_score:desc" : "cited_by_count:desc";
  const sort = sp.get("sort") ?? defaultSort;
  if (!VALID_SORTS[entity].includes(sort)) {
    return err(`Invalid sort for entity "${entity}". Allowed: ${VALID_SORTS[entity].join(", ")}`);
  }
  if (sort === "relevance_score:desc" && !search) {
    return err('sort "relevance_score:desc" requires a non-empty search query');
  }

  // ---------------------------------------------------------------------------
  // Build OpenAlex filter string
  // ---------------------------------------------------------------------------

  const filters: string[] = [];

  if (entity === "works" || entity === "sources") {
    if (isOA) filters.push(`is_oa:${isOA}`);
  }

  if (entity === "works") {
    if (yearFrom !== null && yearTo !== null) {
      filters.push(`publication_year:${yearFrom}-${yearTo}`);
    } else if (yearFrom !== null) {
      filters.push(`publication_year:>${yearFrom - 1}`);
    } else if (yearTo !== null) {
      filters.push(`publication_year:<${yearTo + 1}`);
    }

    if (minCitations !== null && minCitations > 0) {
      filters.push(`cited_by_count:>${minCitations - 1}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Build upstream URL
  // ---------------------------------------------------------------------------

  const url = new URL(`${BASE_URL}/${entity}`);

  if (search)           url.searchParams.set("search", search);
  if (filters.length)   url.searchParams.set("filter", filters.join(","));
  url.searchParams.set("sort",     sort);
  url.searchParams.set("per-page", String(perPage));
  url.searchParams.set("cursor",   cursor);
  url.searchParams.set("select",   SELECT_FIELDS[entity].join(","));

  const apiKey = process.env.OPENALEX_API_KEY;
  if (apiKey) url.searchParams.set("api_key", apiKey);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  let rawBody: { meta: { count: number; per_page: number; next_cursor: string | null }; results: unknown[] };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        headers: { "User-Agent": "openalex-query-interface/1.0" },
        signal: controller.signal,
        next: { revalidate: 60 },
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      const text = await res.text();
      return err(`OpenAlex returned ${res.status}: ${text.slice(0, 300)}`, 502);
    }

    rawBody = await res.json();
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      return err("OpenAlex request timed out", 504);
    }
    const message = e instanceof Error ? e.message : "Unknown network error";
    return err(`Failed to reach OpenAlex: ${message}`, 502);
  }

  // ---------------------------------------------------------------------------
  // Normalize & respond
  // ---------------------------------------------------------------------------

  if (!rawBody?.meta || !Array.isArray(rawBody?.results)) {
    return err("Unexpected response shape from OpenAlex", 502);
  }

  const response: ApiResponse = {
    entity,
    results: normalizeResults(entity, rawBody.results as any[]),
    meta: {
      count:      rawBody.meta.count,
      perPage:    rawBody.meta.per_page,
      nextCursor: rawBody.meta.next_cursor ?? null,
    },
  };

  return NextResponse.json(response);
}
