"use client";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import type { Entity, SearchFilters } from "@/lib/api-types";

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

interface Props {
  entity: Entity;
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

export default function Filters({ entity, filters, onChange }: Props) {
  function set(key: keyof SearchFilters, value: string) {
    onChange({ ...filters, [key]: value });
  }

  const isWorks   = entity === "works";
  const hasOA     = entity === "works" || entity === "sources";

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Filters</p>

      {/* Year range — works only */}
      {isWorks && (
        <fieldset className="space-y-1.5">
          <legend className="text-xs font-medium text-gray-600">Year</legend>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              placeholder="From"
              value={filters.yearFrom}
              onChange={(e) => set("yearFrom", e.target.value)}
              min="1000"
              max={new Date().getFullYear()}
            />
            <span className="text-gray-400">–</span>
            <Input
              type="number"
              placeholder="To"
              value={filters.yearTo}
              onChange={(e) => set("yearTo", e.target.value)}
              min="1000"
              max={new Date().getFullYear()}
            />
          </div>
        </fieldset>
      )}

      {/* Open Access */}
      {hasOA && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Open Access</label>
          <Select value={filters.isOA} onChange={(e) => set("isOA", e.target.value as SearchFilters["isOA"])}>
            <option value="">Any</option>
            <option value="true">OA only</option>
            <option value="false">Closed only</option>
          </Select>
        </div>
      )}

      {/* Min citations — works only */}
      {isWorks && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Min. citations</label>
          <Input
            type="number"
            placeholder="e.g. 100"
            value={filters.minCitations}
            onChange={(e) => set("minCitations", e.target.value)}
            min="0"
          />
        </div>
      )}

      {/* Sort */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600">Sort by</label>
        <Select value={filters.sort} onChange={(e) => set("sort", e.target.value)}>
          {SORT_OPTIONS[entity].map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      </div>

      {/* Per page */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600">Results per page</label>
        <Select value={filters.perPage} onChange={(e) => set("perPage", e.target.value)}>
          {["10", "25", "50", "100"].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </Select>
      </div>
    </div>
  );
}
