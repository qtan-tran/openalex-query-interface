// Types that mirror the normalized shape returned by /api/openalex.
// Keep these in sync with app/api/openalex/route.ts.

export type Entity = "works" | "authors" | "institutions" | "sources" | "concepts";

export interface NormalizedWork {
  id: string; title: string; year: number | null; doi: string | null;
  isOA: boolean; oaUrl: string | null; citedByCount: number;
  authors: { name: string; orcid: string | null }[];
  journal: string | null; type: string | null;
}

export interface NormalizedAuthor {
  id: string; name: string; orcid: string | null;
  worksCount: number; citedByCount: number;
  institution: string | null; topConcepts: string[];
}

export interface NormalizedInstitution {
  id: string; name: string; ror: string | null;
  country: string | null; type: string | null;
  homepage: string | null; worksCount: number; citedByCount: number;
}

export interface NormalizedSource {
  id: string; name: string; issnL: string | null;
  type: string | null; isOA: boolean;
  hostOrg: string | null; worksCount: number; citedByCount: number;
}

export interface NormalizedConcept {
  id: string; name: string; level: number;
  description: string | null; wikidata: string | null;
  worksCount: number; citedByCount: number;
}

export type NormalizedResult =
  | NormalizedWork | NormalizedAuthor | NormalizedInstitution
  | NormalizedSource | NormalizedConcept;

export interface ResponseMeta {
  count: number;
  perPage: number;
  nextCursor: string | null;
}

export interface ApiResponse {
  entity: Entity;
  results: NormalizedResult[];
  meta: ResponseMeta;
}

// Search state passed between page and components
export interface SearchFilters {
  yearFrom: string;
  yearTo: string;
  isOA: "" | "true" | "false";
  minCitations: string;
  sort: string;
  perPage: string;
}

export const DEFAULT_FILTERS: SearchFilters = {
  yearFrom: "",
  yearTo: "",
  isOA: "",
  minCitations: "",
  sort: "",
  perPage: "25",
};
