"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { cn } from "@/lib/cn";
import type { Entity, SearchFilters } from "@/lib/api-types";
import { DEFAULT_FILTERS } from "@/lib/api-types";

// ---------------------------------------------------------------------------

const ENTITIES: { value: Entity; label: string }[] = [
  { value: "works",        label: "Works" },
  { value: "authors",      label: "Authors" },
  { value: "institutions", label: "Institutions" },
  { value: "sources",      label: "Sources" },
  { value: "concepts",     label: "Concepts" },
];

const SORT_OPTIONS: Record<Entity, { value: string; label: string }[]> = {
  works: [
    { value: "",                      label: "Relevance" },
    { value: "cited_by_count:desc",   label: "Most cited" },
    { value: "cited_by_count:asc",    label: "Least cited" },
    { value: "publication_year:desc", label: "Newest" },
    { value: "publication_year:asc",  label: "Oldest" },
  ],
  authors: [
    { value: "",                    label: "Relevance" },
    { value: "cited_by_count:desc", label: "Most cited" },
    { value: "works_count:desc",    label: "Most works" },
  ],
  institutions: [
    { value: "",                    label: "Relevance" },
    { value: "cited_by_count:desc", label: "Most cited" },
    { value: "works_count:desc",    label: "Most works" },
  ],
  sources: [
    { value: "",                    label: "Relevance" },
    { value: "cited_by_count:desc", label: "Most cited" },
    { value: "works_count:desc",    label: "Most works" },
  ],
  concepts: [
    { value: "",                    label: "Relevance" },
    { value: "cited_by_count:desc", label: "Most cited" },
    { value: "works_count:desc",    label: "Most works" },
  ],
};

// ---------------------------------------------------------------------------

interface Props {
  entity: Entity;
  query: string;
  filters: SearchFilters;
  loading: boolean;
  onEntityChange: (entity: Entity) => void;
  onQueryChange: (query: string) => void;
  onFiltersChange: (filters: SearchFilters) => void;
  onSubmit: () => void;
  onClear: () => void;
}

export default function QueryPanel({
  entity, query, filters, loading,
  onEntityChange, onQueryChange, onFiltersChange, onSubmit, onClear,
}: Props) {
  function setFilter<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    onFiltersChange({ ...filters, [key]: value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  const isWorks = entity === "works";
  const hasOA   = entity === "works" || entity === "sources";

  const hasActiveFilters =
    filters.yearFrom !== DEFAULT_FILTERS.yearFrom ||
    filters.yearTo   !== DEFAULT_FILTERS.yearTo   ||
    filters.isOA     !== DEFAULT_FILTERS.isOA     ||
    filters.minCitations !== DEFAULT_FILTERS.minCitations ||
    filters.sort     !== DEFAULT_FILTERS.sort     ||
    filters.perPage  !== DEFAULT_FILTERS.perPage;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

      {/* Entity tab strip */}
      <div className="flex overflow-x-auto border-b border-gray-200 px-2">
        {ENTITIES.map((e) => (
          <button
            key={e.value}
            type="button"
            onClick={() => onEntityChange(e.value)}
            className={cn(
              "flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px focus:outline-none",
              entity === e.value
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-800"
            )}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* Search row */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2.5 p-4 pb-3">
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={`Search ${entity}…`}
          className="flex-1 h-10 text-sm"
          autoFocus
        />
        <Button
          type="submit"
          disabled={loading}
          className="h-10 px-5 shrink-0"
        >
          {loading ? "Searching…" : "Search"}
        </Button>
      </form>

      {/* Filter row */}
      <div className="flex flex-wrap items-end gap-3 px-4 pb-4">

        {/* Year range — works only */}
        {isWorks && (
          <Field label="Year from">
            <Input
              type="number"
              placeholder="e.g. 2018"
              value={filters.yearFrom}
              onChange={(e) => setFilter("yearFrom", e.target.value)}
              min="1000"
              max={new Date().getFullYear()}
              className="w-28 h-8 text-xs"
            />
          </Field>
        )}
        {isWorks && (
          <Field label="Year to">
            <Input
              type="number"
              placeholder={String(new Date().getFullYear())}
              value={filters.yearTo}
              onChange={(e) => setFilter("yearTo", e.target.value)}
              min="1000"
              max={new Date().getFullYear()}
              className="w-28 h-8 text-xs"
            />
          </Field>
        )}

        {/* Open Access */}
        {hasOA && (
          <Field label="Open Access">
            <Select
              value={filters.isOA}
              onChange={(e) => setFilter("isOA", e.target.value as SearchFilters["isOA"])}
              className="w-32 h-8 text-xs"
            >
              <option value="">Any</option>
              <option value="true">OA only</option>
              <option value="false">Closed only</option>
            </Select>
          </Field>
        )}

        {/* Min citations — works only */}
        {isWorks && (
          <Field label="Min. citations">
            <Input
              type="number"
              placeholder="0"
              value={filters.minCitations}
              onChange={(e) => setFilter("minCitations", e.target.value)}
              min="0"
              className="w-28 h-8 text-xs"
            />
          </Field>
        )}

        {/* Sort */}
        <Field label="Sort by">
          <Select
            value={filters.sort}
            onChange={(e) => setFilter("sort", e.target.value)}
            className="w-36 h-8 text-xs"
          >
            {SORT_OPTIONS[entity].map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </Field>

        {/* Per page */}
        <Field label="Per page">
          <Select
            value={filters.perPage}
            onChange={(e) => setFilter("perPage", e.target.value)}
            className="w-20 h-8 text-xs"
          >
            {["10", "25", "50", "100"].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </Select>
        </Field>

        {/* Clear — only shown when filters are non-default */}
        {hasActiveFilters && (
          <div className="self-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onClear}
              className="h-8 px-2.5 text-xs text-gray-500"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      {children}
    </div>
  );
}
