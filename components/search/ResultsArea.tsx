"use client";

import ResultsTable from "./ResultsTable";
import ResultsToolbar from "./ResultsToolbar";
import type { Entity, NormalizedResult, ResponseMeta } from "@/lib/api-types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  entity: Entity;
  query: string;
  results: NormalizedResult[];
  meta: ResponseMeta | null;
  loading: boolean;
  error: string | null;
  hasPrev: boolean;
  hasActiveFilters: boolean;
  onPrev: () => void;
  onNext: () => void;
  onRetry: () => void;
  onClearFilters: () => void;
}

// ---------------------------------------------------------------------------
// Main component — routes to the appropriate state view
// ---------------------------------------------------------------------------

export default function ResultsArea({
  entity, query, results, meta, loading, error,
  hasPrev, hasActiveFilters,
  onPrev, onNext, onRetry, onClearFilters,
}: Props) {

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (!meta && !loading) {
    return <IdleState entity={entity} />;
  }

  if (meta && results.length === 0 && !loading) {
    return (
      <EmptyState
        query={query}
        entity={entity}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
      />
    );
  }

  // First load — no existing data yet
  if (loading && !meta) {
    return (
      <div className="space-y-3">
        <div className="h-5 w-44 animate-pulse rounded-full bg-gray-100" />
        <ResultsTable
          entity={entity}
          results={[]}
          meta={{ count: 0, perPage: 25, nextCursor: null }}
          loading={true}
          hasPrev={false}
          onPrev={() => {}}
          onNext={() => {}}
        />
      </div>
    );
  }

  // Results — dim existing rows while paginating
  return (
    <div className="space-y-3">
      {meta && <ResultsToolbar meta={meta} entity={entity} query={query} />}
      <div className={loading ? "pointer-events-none opacity-50 transition-opacity duration-150" : ""}>
        <ResultsTable
          entity={entity}
          results={results}
          meta={meta ?? { count: 0, perPage: 25, nextCursor: null }}
          loading={loading}
          hasPrev={hasPrev}
          onPrev={onPrev}
          onNext={onNext}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// State views
// ---------------------------------------------------------------------------

const ENTITY_HINTS: Record<string, string> = {
  works:        "Search by title, abstract, keyword, or DOI",
  authors:      "Search by author name or ORCID",
  institutions: "Search by institution name, ROR ID, or country",
  sources:      "Search by journal or repository name, or ISSN",
  concepts:     "Search by research topic or concept name",
};

function IdleState({ entity }: { entity: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-24 text-center shadow-sm">
      <div className="mb-4 text-4xl font-extralight text-gray-200 select-none">◎</div>
      <p className="text-sm font-semibold text-gray-600">Search the OpenAlex catalog</p>
      <p className="mt-1.5 text-xs text-gray-400">
        {ENTITY_HINTS[entity] ?? "Enter a search query above"}
      </p>
    </div>
  );
}

function EmptyState({
  query, entity, hasActiveFilters, onClearFilters,
}: {
  query: string;
  entity: string;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-24 text-center shadow-sm px-6">
      <div className="mb-4 text-4xl font-extralight text-gray-200 select-none">∅</div>
      <p className="text-sm font-semibold text-gray-600">No {entity} found</p>
      {query && (
        <p className="mt-1 text-xs text-gray-400">
          No results for <span className="italic text-gray-500">&ldquo;{query}&rdquo;</span>
        </p>
      )}
      <div className="mt-4 space-y-1.5 text-xs text-gray-400">
        {hasActiveFilters && (
          <p>
            Active filters may be narrowing results.{" "}
            <button
              onClick={onClearFilters}
              className="font-medium text-blue-600 hover:underline underline-offset-2"
            >
              Clear filters
            </button>
          </p>
        )}
        <p>Try broader search terms or check your spelling.</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const advice = classifyError(message);

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-red-700">Search failed</p>
          <p className="text-xs text-red-600 leading-relaxed">{message}</p>
          {advice && (
            <p className="text-xs text-red-400 leading-relaxed">{advice}</p>
          )}
        </div>
        <button
          onClick={onRetry}
          className="shrink-0 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 shadow-sm hover:bg-red-50 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function classifyError(message: string): string {
  if (message.includes("timed out"))
    return "OpenAlex is responding slowly. Wait a moment and try again.";
  if (message.includes("reach") || message.includes("connect") || message.includes("network"))
    return "Check your internet connection and try again.";
  if (message.includes("Invalid") || message.includes("must be") || message.includes("required"))
    return "Adjust your search parameters — one of the filter values may be out of range.";
  if (message.includes("502") || message.includes("OpenAlex returned"))
    return "OpenAlex returned an upstream error. This is usually temporary.";
  return "";
}
