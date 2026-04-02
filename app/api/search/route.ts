import { NextRequest, NextResponse } from "next/server";
import { searchOpenAlex } from "@/lib/openalex";
import type { EntityType } from "@/lib/types";

const VALID_ENTITIES: EntityType[] = [
  "works",
  "authors",
  "institutions",
  "sources",
  "concepts",
];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const entity = searchParams.get("entity") as EntityType;
  const query = searchParams.get("query") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const perPage = Number(searchParams.get("per_page") ?? "25");

  // Basic validation
  if (!entity || !VALID_ENTITIES.includes(entity)) {
    return NextResponse.json(
      { error: `Invalid entity. Must be one of: ${VALID_ENTITIES.join(", ")}` },
      { status: 400 }
    );
  }

  // Parse optional filters (e.g. ?filter_publication_year=2023&filter_is_oa=true)
  const filters: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith("filter_")) {
      filters[key.replace("filter_", "")] = value;
    }
  }

  try {
    const data = await searchOpenAlex(
      { entity, query, page, perPage, filters },
      process.env.OPENALEX_EMAIL
    );
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
