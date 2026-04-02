"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QueryPanel from "@/components/search/QueryPanel";
import ResultsArea from "@/components/search/ResultsArea";
import type { Entity, NormalizedResult, ResponseMeta, SearchFilters, ApiResponse } from "@/lib/api-types";
import { DEFAULT_FILTERS } from "@/lib/api-types";

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

const VALID_ENTITIES: readonly Entity[] = ["works", "authors", "institutions", "sources", "concepts"];

function readEntityFromURL(sp: URLSearchParams): Entity {
  const v = sp.get("entity") ?? "";
  return (VALID_ENTITIES as string[]).includes(v) ? (v as Entity) : "works";
}

function readFiltersFromURL(sp: URLSearchParams): SearchFilters {
  const isOARaw = sp.get("isOA") ?? "";
  return {
    yearFrom:     sp.get("yearFrom")     ?? DEFAULT_FILTERS.yearFrom,
    yearTo:       sp.get("yearTo")       ?? DEFAULT_FILTERS.yearTo,
    isOA:         (["true", "false"].includes(isOARaw) ? isOARaw : "") as SearchFilters["isOA"],
    minCitations: sp.get("minCitations") ?? DEFAULT_FILTERS.minCitations,
    sort:         sp.get("sort")         ?? DEFAULT_FILTERS.sort,
    perPage:      sp.get("perPage")      ?? DEFAULT_FILTERS.perPage,
  };
}

function buildSearchURL(entity: Entity, query: string, filters: SearchFilters): string {
  const p = new URLSearchParams();
  if (entity !== "works")           p.set("entity",       entity);
  if (query.trim())                 p.set("query",        query.trim());
  if (filters.yearFrom)             p.set("yearFrom",     filters.yearFrom);
  if (filters.yearTo)               p.set("yearTo",       filters.yearTo);
  if (filters.isOA)                 p.set("isOA",         filters.isOA);
  if (filters.minCitations)         p.set("minCitations", filters.minCitations);
  if (filters.sort)                 p.set("sort",         filters.sort);
  if (filters.perPage !== DEFAULT_FILTERS.perPage) p.set("perPage", filters.perPage);
  const qs = p.toString();
  return qs ? `?${qs}` : "?";
}

function hasAnyURLParams(sp: URLSearchParams): boolean {
  return !!(
    sp.get("query") || sp.get("yearFrom") || sp.get("yearTo") ||
    sp.get("isOA")  || sp.get("minCitations")
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialise all inputs from URL on first render
  const [entity,  setEntity]  = useState<Entity>(() => readEntityFromURL(new URLSearchParams(searchParams.toString())));
  const [query,   setQuery]   = useState(() => searchParams.get("query") ?? "");
  const [filters, setFilters] = useState<SearchFilters>(() => readFiltersFromURL(new URLSearchParams(searchParams.toString())));

  // Cursor stack: ["*", cursor1, cursor2, …]
  const [cursorStack, setCursorStack] = useState<string[]>(["*"]);

  // Response state
  const [results, setResults] = useState<NormalizedResult[]>([]);
  const [meta,    setMeta]    = useState<ResponseMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // ── Auto-search if URL already has params (e.g. after refresh / shared link) ──
  useEffect(() => {
    if (hasAnyURLParams(new URLSearchParams(searchParams.toString()))) {
      const sp = new URLSearchParams(searchParams.toString());
      fetchResults("*", readFiltersFromURL(sp), readEntityFromURL(sp), sp.get("query") ?? "");
    }
    // Intentionally only runs on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Core fetch — all values passed explicitly to avoid stale-closure bugs ──
  async function fetchResults(
    cursor: string,
    f: SearchFilters = filters,
    e: Entity        = entity,
    q: string        = query,
  ) {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ entity: e, cursor });
    if (q.trim())          params.set("search",       q.trim());
    if (f.yearFrom)        params.set("yearFrom",     f.yearFrom);
    if (f.yearTo)          params.set("yearTo",       f.yearTo);
    if (f.isOA)            params.set("isOA",         f.isOA);
    if (f.minCitations)    params.set("minCitations", f.minCitations);
    if (f.sort)            params.set("sort",         f.sort);
    if (f.perPage)         params.set("perPage",      f.perPage);

    try {
      const res  = await fetch(`/api/openalex?${params}`);
      const data: ApiResponse & { error?: string } = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setResults([]);
        setMeta(null);
      } else {
        setResults(data.results);
        setMeta(data.meta);
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleSubmit() {
    setCursorStack(["*"]);
    router.replace(buildSearchURL(entity, query, filters), { scroll: false });
    fetchResults("*");
  }

  function handleEntityChange(next: Entity) {
    setEntity(next);
    setFilters(DEFAULT_FILTERS);
    setResults([]);
    setMeta(null);
    setError(null);
    setCursorStack(["*"]);
    router.replace(buildSearchURL(next, query, DEFAULT_FILTERS), { scroll: false });
  }

  function handleClear() {
    setFilters(DEFAULT_FILTERS);
    setResults([]);
    setMeta(null);
    setError(null);
    setCursorStack(["*"]);
    router.replace(buildSearchURL(entity, query, DEFAULT_FILTERS), { scroll: false });
  }

  function handleRetry() {
    fetchResults("*");
  }

  function handleNext() {
    if (!meta?.nextCursor) return;
    const next = [...cursorStack, meta.nextCursor];
    setCursorStack(next);
    fetchResults(meta.nextCursor);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handlePrev() {
    if (cursorStack.length <= 1) return;
    const prev = cursorStack.slice(0, -1);
    setCursorStack(prev);
    fetchResults(prev[prev.length - 1]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const hasActiveFilters =
    filters.yearFrom     !== DEFAULT_FILTERS.yearFrom     ||
    filters.yearTo       !== DEFAULT_FILTERS.yearTo       ||
    filters.isOA         !== DEFAULT_FILTERS.isOA         ||
    filters.minCitations !== DEFAULT_FILTERS.minCitations ||
    filters.sort         !== DEFAULT_FILTERS.sort         ||
    filters.perPage      !== DEFAULT_FILTERS.perPage;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-4">
      <QueryPanel
        entity={entity}
        query={query}
        filters={filters}
        loading={loading}
        onEntityChange={handleEntityChange}
        onQueryChange={setQuery}
        onFiltersChange={setFilters}
        onSubmit={handleSubmit}
        onClear={handleClear}
      />

      <ResultsArea
        entity={entity}
        query={query}
        results={results}
        meta={meta}
        loading={loading}
        error={error}
        hasPrev={cursorStack.length > 1}
        hasActiveFilters={hasActiveFilters}
        onPrev={handlePrev}
        onNext={handleNext}
        onRetry={handleRetry}
        onClearFilters={handleClear}
      />
    </div>
  );
}
