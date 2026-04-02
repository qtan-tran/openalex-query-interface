"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import type { Entity } from "@/lib/api-types";

const ENTITIES: { value: Entity; label: string }[] = [
  { value: "works",        label: "Works" },
  { value: "authors",      label: "Authors" },
  { value: "institutions", label: "Institutions" },
  { value: "sources",      label: "Sources" },
  { value: "concepts",     label: "Concepts" },
];

interface Props {
  entity: Entity;
  query: string;
  loading: boolean;
  onEntityChange: (entity: Entity) => void;
  onQueryChange: (query: string) => void;
  onSubmit: () => void;
}

export default function SearchBar({ entity, query, loading, onEntityChange, onQueryChange, onSubmit }: Props) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Select
        value={entity}
        onChange={(e) => onEntityChange(e.target.value as Entity)}
        className="w-36 shrink-0"
      >
        {ENTITIES.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </Select>

      <Input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={`Search ${entity}…`}
        className="flex-1"
      />

      <Button type="submit" disabled={loading} className="shrink-0 px-6">
        {loading ? "Searching…" : "Search"}
      </Button>
    </form>
  );
}
