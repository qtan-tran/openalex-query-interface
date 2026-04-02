// OpenAlex entity types
// Docs: https://docs.openalex.org/

export type EntityType = "works" | "authors" | "institutions" | "sources" | "concepts";

// --- Shared ---

export interface DehydratedInstitution {
  id: string;
  display_name: string;
  ror: string;
  country_code: string;
  type: string;
}

export interface DehydratedAuthor {
  id: string;
  display_name: string;
  orcid: string | null;
}

export interface Authorship {
  author: DehydratedAuthor;
  institutions: DehydratedInstitution[];
  author_position: "first" | "middle" | "last";
}

export interface OpenAccess {
  is_oa: boolean;
  oa_status: "gold" | "green" | "bronze" | "hybrid" | "closed";
  oa_url: string | null;
}

export interface DehydratedConcept {
  id: string;
  display_name: string;
  level: number;
  score: number;
}

// --- Work ---

export interface Work {
  id: string;
  display_name: string;
  title: string;
  publication_year: number | null;
  doi: string | null;
  type: string;
  open_access: OpenAccess;
  authorships: Authorship[];
  cited_by_count: number;
  concepts: DehydratedConcept[];
  primary_location: {
    source: { display_name: string; id: string } | null;
    landing_page_url: string | null;
  } | null;
}

// --- Author ---

export interface Author {
  id: string;
  display_name: string;
  orcid: string | null;
  works_count: number;
  cited_by_count: number;
  last_known_institution: DehydratedInstitution | null;
  x_concepts: DehydratedConcept[];
}

// --- Institution ---

export interface Institution {
  id: string;
  display_name: string;
  ror: string | null;
  country_code: string | null;
  type: string | null;
  homepage_url: string | null;
  works_count: number;
  cited_by_count: number;
}

// --- Source ---

export interface Source {
  id: string;
  display_name: string;
  issn_l: string | null;
  type: string | null;
  is_oa: boolean;
  host_organization_name: string | null;
  works_count: number;
  cited_by_count: number;
}

// --- Concept ---

export interface Concept {
  id: string;
  display_name: string;
  wikidata: string | null;
  level: number;
  description: string | null;
  works_count: number;
  cited_by_count: number;
}

// --- API Response ---

export interface OpenAlexMeta {
  count: number;
  page: number;
  per_page: number;
}

export interface OpenAlexResponse<T> {
  meta: OpenAlexMeta;
  results: T[];
}

export type EntityResult = Work | Author | Institution | Source | Concept;
