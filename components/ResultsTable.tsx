"use client";

import type {
  EntityType,
  EntityResult,
  Work,
  Author,
  Institution,
  Source,
  Concept,
  OpenAlexMeta,
} from "@/lib/types";

interface Props {
  entity: EntityType;
  results: EntityResult[];
  meta: OpenAlexMeta | null;
  page: number;
  onPageChange: (page: number) => void;
}

export default function ResultsTable({
  entity,
  results,
  meta,
  page,
  onPageChange,
}: Props) {
  if (results.length === 0) return null;

  const totalPages = meta ? Math.ceil(meta.count / meta.per_page) : 1;

  return (
    <div className="space-y-3">
      {meta && (
        <p className="text-sm text-gray-500">
          {meta.count.toLocaleString()} results
        </p>
      )}

      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>{renderHeaders(entity)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {renderRow(entity, item)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {page} of {totalPages.toLocaleString()}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// --- Header renderers ---

function renderHeaders(entity: EntityType) {
  const headers: Record<EntityType, string[]> = {
    works: ["Title", "Year", "Authors", "Journal", "Cited by", "OA"],
    authors: ["Name", "ORCID", "Institution", "Works", "Cited by"],
    institutions: ["Name", "Country", "Type", "Works", "Cited by"],
    sources: ["Name", "Type", "ISSN", "OA", "Works", "Cited by"],
    concepts: ["Name", "Level", "Description", "Works", "Cited by"],
  };

  return headers[entity].map((h) => (
    <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">
      {h}
    </th>
  ));
}

// --- Row renderers ---

function renderRow(entity: EntityType, item: EntityResult) {
  switch (entity) {
    case "works":
      return <WorkRow work={item as Work} />;
    case "authors":
      return <AuthorRow author={item as Author} />;
    case "institutions":
      return <InstitutionRow institution={item as Institution} />;
    case "sources":
      return <SourceRow source={item as Source} />;
    case "concepts":
      return <ConceptRow concept={item as Concept} />;
  }
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 align-top">{children}</td>;
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      {children}
    </a>
  );
}

function WorkRow({ work }: { work: Work }) {
  const authors = work.authorships
    .slice(0, 3)
    .map((a) => a.author.display_name)
    .join(", ");
  const moreAuthors = work.authorships.length > 3 ? ` +${work.authorships.length - 3}` : "";

  return (
    <>
      <Td>
        {work.doi ? (
          <ExternalLink href={work.doi}>{work.display_name}</ExternalLink>
        ) : (
          work.display_name
        )}
      </Td>
      <Td>{work.publication_year ?? "—"}</Td>
      <Td>
        <span className="text-gray-700">
          {authors}
          {moreAuthors && <span className="text-gray-400">{moreAuthors}</span>}
        </span>
      </Td>
      <Td>{work.primary_location?.source?.display_name ?? "—"}</Td>
      <Td>{work.cited_by_count.toLocaleString()}</Td>
      <Td>
        <span
          className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
            work.open_access.is_oa
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {work.open_access.is_oa ? "OA" : "Closed"}
        </span>
      </Td>
    </>
  );
}

function AuthorRow({ author }: { author: Author }) {
  return (
    <>
      <Td>
        <ExternalLink href={author.id}>{author.display_name}</ExternalLink>
      </Td>
      <Td>{author.orcid ?? "—"}</Td>
      <Td>{author.last_known_institution?.display_name ?? "—"}</Td>
      <Td>{author.works_count.toLocaleString()}</Td>
      <Td>{author.cited_by_count.toLocaleString()}</Td>
    </>
  );
}

function InstitutionRow({ institution }: { institution: Institution }) {
  return (
    <>
      <Td>
        <ExternalLink href={institution.id}>{institution.display_name}</ExternalLink>
      </Td>
      <Td>{institution.country_code ?? "—"}</Td>
      <Td>{institution.type ?? "—"}</Td>
      <Td>{institution.works_count.toLocaleString()}</Td>
      <Td>{institution.cited_by_count.toLocaleString()}</Td>
    </>
  );
}

function SourceRow({ source }: { source: Source }) {
  return (
    <>
      <Td>
        <ExternalLink href={source.id}>{source.display_name}</ExternalLink>
      </Td>
      <Td>{source.type ?? "—"}</Td>
      <Td>{source.issn_l ?? "—"}</Td>
      <Td>
        <span
          className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
            source.is_oa
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {source.is_oa ? "OA" : "Closed"}
        </span>
      </Td>
      <Td>{source.works_count.toLocaleString()}</Td>
      <Td>{source.cited_by_count.toLocaleString()}</Td>
    </>
  );
}

function ConceptRow({ concept }: { concept: Concept }) {
  return (
    <>
      <Td>
        <ExternalLink href={concept.id}>{concept.display_name}</ExternalLink>
      </Td>
      <Td>{concept.level}</Td>
      <Td>
        <span className="text-gray-600 line-clamp-2">{concept.description ?? "—"}</span>
      </Td>
      <Td>{concept.works_count.toLocaleString()}</Td>
      <Td>{concept.cited_by_count.toLocaleString()}</Td>
    </>
  );
}
