import type {
  Entity, NormalizedResult, NormalizedWork, NormalizedAuthor,
  NormalizedInstitution, NormalizedSource, NormalizedConcept,
} from "@/lib/api-types";

// ---------------------------------------------------------------------------
// CSV cell serialization
// ---------------------------------------------------------------------------

/** Wraps value in quotes and escapes internal quotes if necessary. */
function cell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Quote if the value contains a comma, double-quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Joins an array into a single cell value, separated by " | ". */
function cells(values: (string | null | undefined)[]): string {
  return cell(values.filter(Boolean).join(" | "));
}

function row(values: (string | number | boolean | null | undefined)[]): string {
  return values.map(cell).join(",");
}

// ---------------------------------------------------------------------------
// Per-entity serializers
// ---------------------------------------------------------------------------

const HEADERS: Record<Entity, string[]> = {
  works:        ["ID", "Title", "Year", "DOI", "Type", "Open Access", "OA URL", "Authors", "Journal", "Citations"],
  authors:      ["ID", "Name", "ORCID", "Institution", "Works", "Citations", "Top Concepts"],
  institutions: ["ID", "Name", "ROR", "Country", "Type", "Homepage", "Works", "Citations"],
  sources:      ["ID", "Name", "ISSN-L", "Type", "Open Access", "Host Organisation", "Works", "Citations"],
  concepts:     ["ID", "Name", "Level", "Description", "Wikidata", "Works", "Citations"],
};

function serializeRows(entity: Entity, results: NormalizedResult[]): string[] {
  switch (entity) {
    case "works":
      return (results as NormalizedWork[]).map((w) =>
        row([
          w.id, w.title, w.year, w.doi, w.type,
          w.isOA, w.oaUrl,
          cells(w.authors.map((a) => a.name)),
          w.journal, w.citedByCount,
        ])
      );

    case "authors":
      return (results as NormalizedAuthor[]).map((a) =>
        row([
          a.id, a.name, a.orcid, a.institution,
          a.worksCount, a.citedByCount,
          cells(a.topConcepts),
        ])
      );

    case "institutions":
      return (results as NormalizedInstitution[]).map((i) =>
        row([
          i.id, i.name, i.ror, i.country, i.type,
          i.homepage, i.worksCount, i.citedByCount,
        ])
      );

    case "sources":
      return (results as NormalizedSource[]).map((s) =>
        row([
          s.id, s.name, s.issnL, s.type,
          s.isOA, s.hostOrg, s.worksCount, s.citedByCount,
        ])
      );

    case "concepts":
      return (results as NormalizedConcept[]).map((c) =>
        row([
          c.id, c.name, c.level, c.description,
          c.wikidata, c.worksCount, c.citedByCount,
        ])
      );
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function exportToCSV(entity: Entity, results: NormalizedResult[], filename?: string): void {
  const header = HEADERS[entity].join(",");
  const rows   = serializeRows(entity, results);
  const csv    = [header, ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");

  a.href     = url;
  a.download = filename ?? `openalex-${entity}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}
