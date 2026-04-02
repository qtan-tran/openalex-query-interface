"use client";

import { useState } from "react";
import SearchForm from "@/components/SearchForm";
import FilterPanel, { type Filters } from "@/components/FilterPanel";
import ResultsTable from "@/components/ResultsTable";
import type { EntityType, EntityResult, OpenAlexMeta } from "@/lib/types";

const DEFAULT_FILTERS: Filters = {
  publication_year: "",
  is_oa: "",
  sort: "",
};

export default function Home() {
  const [entity, setEntity] = useState<EntityType>("works");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const [results, setResults] = useState<EntityResult[]>([]);
  const [meta, setMeta] = useState<OpenAlexMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(overridePage?: number) {
    setLoading(true);
    setError(null);

    const currentPage = overridePage ?? page;

    const params = new URLSearchParams({
      entity,
      query,
      page: String(currentPage),
    });

    if (filters.publication_year) {
      params.set("filter_publication_year", filters.publication_year);
    }
    if (filters.is_oa) {
      params.set("filter_is_oa", filters.is_oa);
    }
    if (filters.sort) {
      params.set("filter_sort", filters.sort);
    }

    try {
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setResults([]);
        setMeta(null);
      } else {
        setResults(data.results);
        setMeta(data.meta);
      }
    } catch {
      setError("Failed to reach the server.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit() {
    setPage(1);
    search(1);
  }

  function handleEntityChange(newEntity: EntityType) {
    setEntity(newEntity);
    setFilters(DEFAULT_FILTERS);
    setResults([]);
    setMeta(null);
    setError(null);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    search(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OpenAlex Explorer</h1>
          <p className="text-sm text-gray-500 mt-1">
            Search the{" "}
            <a
              href="https://openalex.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              OpenAlex
            </a>{" "}
            open research catalog.
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <SearchForm
            entity={entity}
            query={query}
            loading={loading}
            onEntityChange={handleEntityChange}
            onQueryChange={setQuery}
            onSubmit={handleSubmit}
          />
          <FilterPanel entity={entity} filters={filters} onChange={setFilters} />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && results.length === 0 && meta && (
          <p className="text-center text-gray-500 py-10">No results found.</p>
        )}

        {/* Results */}
        <ResultsTable
          entity={entity}
          results={results}
          meta={meta}
          page={page}
          onPageChange={handlePageChange}
        />
      </div>
    </main>
  );
}
