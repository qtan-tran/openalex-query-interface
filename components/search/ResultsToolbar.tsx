"use client";

import { exportToCSV } from "@/lib/export";
import type { Entity, NormalizedResult, ResponseMeta } from "@/lib/api-types";

interface Props {
  meta: ResponseMeta;
  entity: Entity;
  query: string;
  results: NormalizedResult[];
}

export default function ResultsToolbar({ meta, entity, query, results }: Props) {
  function handleExport() {
    const filename = [
      "openalex",
      entity,
      query ? query.trim().slice(0, 40).replace(/\s+/g, "-") : null,
      new Date().toISOString().slice(0, 10),
    ].filter(Boolean).join("-") + ".csv";

    exportToCSV(entity, results, filename);
  }

  return (
    <div className="flex items-center justify-between py-1">
      <p className="text-sm text-gray-600">
        <span className="font-semibold text-gray-900">{meta.count.toLocaleString()}</span>
        {" "}{entity}
        {query && (
          <>
            {" "}for{" "}
            <span className="italic text-gray-800">&ldquo;{query}&rdquo;</span>
          </>
        )}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={handleExport}
          disabled={results.length === 0}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>
    </div>
  );
}
