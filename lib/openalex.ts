import type { EntityType, OpenAlexResponse, EntityResult } from "./types";

const BASE_URL = "https://api.openalex.org";

export interface SearchParams {
  entity: EntityType;
  query: string;
  page?: number;
  perPage?: number;
  filters?: Record<string, string>;
}

export async function searchOpenAlex(
  params: SearchParams,
  email?: string
): Promise<OpenAlexResponse<EntityResult>> {
  const { entity, query, page = 1, perPage = 25, filters = {} } = params;

  const url = new URL(`${BASE_URL}/${entity}`);

  if (query) {
    url.searchParams.set("search", query);
  }

  url.searchParams.set("page", String(page));
  url.searchParams.set("per-page", String(perPage));

  // Build filter string from key:value pairs
  const filterParts = Object.entries(filters)
    .filter(([, v]) => v !== "")
    .map(([k, v]) => `${k}:${v}`);

  if (filterParts.length > 0) {
    url.searchParams.set("filter", filterParts.join(","));
  }

  // Polite pool: include email in mailto param
  if (email) {
    url.searchParams.set("mailto", email);
  }

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "openalex-query-interface/1.0" },
  });

  if (!res.ok) {
    throw new Error(`OpenAlex API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<OpenAlexResponse<EntityResult>>;
}
