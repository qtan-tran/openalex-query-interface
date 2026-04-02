"use client";

import type { EntityType } from "@/lib/types";

const ENTITIES: { value: EntityType; label: string }[] = [
  { value: "works", label: "Works" },
  { value: "authors", label: "Authors" },
  { value: "institutions", label: "Institutions" },
  { value: "sources", label: "Sources" },
  { value: "concepts", label: "Concepts" },
];

interface Props {
  entity: EntityType;
  query: string;
  loading: boolean;
  onEntityChange: (entity: EntityType) => void;
  onQueryChange: (query: string) => void;
  onSubmit: () => void;
}

export default function SearchForm({
  entity,
  query,
  loading,
  onEntityChange,
  onQueryChange,
  onSubmit,
}: Props) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <select
        value={entity}
        onChange={(e) => onEntityChange(e.target.value as EntityType)}
        className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {ENTITIES.map((e) => (
          <option key={e.value} value={e.value}>
            {e.label}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search OpenAlex..."
        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white rounded px-5 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
