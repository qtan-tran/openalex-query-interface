"use client";

import type { EntityType } from "@/lib/types";

export interface Filters {
  publication_year: string;
  is_oa: string;
  sort: string;
}

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Relevance" },
  { value: "cited_by_count:desc", label: "Most Cited" },
  { value: "publication_year:desc", label: "Newest" },
  { value: "publication_year:asc", label: "Oldest" },
];

interface Props {
  entity: EntityType;
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function FilterPanel({ entity, filters, onChange }: Props) {
  function update(key: keyof Filters, value: string) {
    onChange({ ...filters, [key]: value });
  }

  const showYearFilter = entity === "works";
  const showOAFilter = entity === "works" || entity === "sources";

  if (!showYearFilter && !showOAFilter) return null;

  return (
    <div className="flex flex-wrap gap-3 text-sm">
      {showYearFilter && (
        <div className="flex items-center gap-2">
          <label className="text-gray-600 whitespace-nowrap">Year</label>
          <input
            type="number"
            value={filters.publication_year}
            onChange={(e) => update("publication_year", e.target.value)}
            placeholder="e.g. 2023"
            min="1900"
            max={new Date().getFullYear()}
            className="border border-gray-300 rounded px-2 py-1 w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {showOAFilter && (
        <div className="flex items-center gap-2">
          <label className="text-gray-600 whitespace-nowrap">Open Access</label>
          <select
            value={filters.is_oa}
            onChange={(e) => update("is_oa", e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <label className="text-gray-600">Sort</label>
        <select
          value={filters.sort}
          onChange={(e) => update("sort", e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
