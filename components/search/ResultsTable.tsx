"use client";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type {
  Entity, NormalizedResult, NormalizedWork, NormalizedAuthor,
  NormalizedInstitution, NormalizedSource, NormalizedConcept, ResponseMeta,
} from "@/lib/api-types";

// ---------------------------------------------------------------------------
// Column config per entity
// ---------------------------------------------------------------------------

const COLUMNS: Record<Entity, { label: string; width?: string }[]> = {
  works:        [
    { label: "Title", width: "w-[40%]" },
    { label: "Year",  width: "w-16" },
    { label: "Authors" },
    { label: "Journal" },
    { label: "Citations", width: "w-20" },
    { label: "OA",        width: "w-16" },
  ],
  authors:      [
    { label: "Name" },
    { label: "Institution" },
    { label: "Works",    width: "w-20" },
    { label: "Citations", width: "w-20" },
    { label: "Top concepts" },
  ],
  institutions: [
    { label: "Name" },
    { label: "Country", width: "w-20" },
    { label: "Type",    width: "w-28" },
    { label: "Works",    width: "w-20" },
    { label: "Citations", width: "w-20" },
  ],
  sources:      [
    { label: "Name" },
    { label: "Type",    width: "w-24" },
    { label: "ISSN",    width: "w-24" },
    { label: "OA",      width: "w-16" },
    { label: "Works",    width: "w-20" },
    { label: "Citations", width: "w-20" },
  ],
  concepts:     [
    { label: "Name" },
    { label: "Level", width: "w-16" },
    { label: "Description" },
    { label: "Works",    width: "w-20" },
    { label: "Citations", width: "w-20" },
  ],
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  entity: Entity;
  results: NormalizedResult[];
  meta: ResponseMeta;
  loading: boolean;
  hasPrev: boolean;
  onPrev: () => void;
  onNext: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ResultsTable({ entity, results, meta, loading, hasPrev, onPrev, onNext }: Props) {
  const cols = COLUMNS[entity];

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {cols.map((col) => (
                <th
                  key={col.label}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500",
                    col.width
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading
              ? <SkeletonRows cols={cols.length} count={8} />
              : results.map((item) => (
                  <tr key={item.id} className="group transition-colors hover:bg-blue-50/40">
                    {renderRow(entity, item)}
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Showing {results.length.toLocaleString()} of {meta.count.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onPrev} disabled={!hasPrev} className="h-8 px-3 text-xs">
              ← Previous
            </Button>
            <Button variant="outline" onClick={onNext} disabled={!meta.nextCursor} className="h-8 px-3 text-xs">
              Next →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SkeletonRows({ cols, count }: { cols: number; count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, row) => (
        <tr key={row} className="border-b border-gray-100 last:border-0">
          {Array.from({ length: cols }).map((_, col) => (
            <td key={col} className="px-4 py-3.5">
              <div
                className={cn(
                  "h-3.5 animate-pulse rounded-full bg-gray-100",
                  col === 0 ? "w-3/4" : col === cols - 1 ? "w-10" : "w-1/2"
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Cell helpers
// ---------------------------------------------------------------------------

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn("px-4 py-3.5 align-top text-sm text-gray-600", className)}>
      {children}
    </td>
  );
}

function TitleLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-gray-900 hover:text-blue-700 hover:underline underline-offset-2 leading-snug"
    >
      {children}
    </a>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline underline-offset-2"
    >
      {children}
    </a>
  );
}

// ---------------------------------------------------------------------------
// Row renderers
// ---------------------------------------------------------------------------

function renderRow(entity: Entity, item: NormalizedResult) {
  switch (entity) {
    case "works":        return <WorkRow        work={item as NormalizedWork} />;
    case "authors":      return <AuthorRow      author={item as NormalizedAuthor} />;
    case "institutions": return <InstitutionRow institution={item as NormalizedInstitution} />;
    case "sources":      return <SourceRow      source={item as NormalizedSource} />;
    case "concepts":     return <ConceptRow     concept={item as NormalizedConcept} />;
  }
}

function WorkRow({ work }: { work: NormalizedWork }) {
  const shownAuthors = work.authors.slice(0, 3).map((a) => a.name).join(", ");
  const extra = work.authors.length > 3 ? ` +${work.authors.length - 3}` : "";

  return (
    <>
      <Td className="max-w-xs">
        <TitleLink href={work.doi ?? work.id}>{work.title}</TitleLink>
      </Td>
      <Td className="text-gray-500 tabular-nums">{work.year ?? "—"}</Td>
      <Td>
        {shownAuthors}
        {extra && <span className="text-gray-400">{extra}</span>}
      </Td>
      <Td className="text-gray-500 italic">{work.journal ?? "—"}</Td>
      <Td className="tabular-nums">{work.citedByCount.toLocaleString()}</Td>
      <Td>
        <Badge variant={work.isOA ? "green" : "gray"}>
          {work.isOA ? "Open" : "Closed"}
        </Badge>
      </Td>
    </>
  );
}

function AuthorRow({ author }: { author: NormalizedAuthor }) {
  return (
    <>
      <Td><ExternalLink href={author.id}>{author.name}</ExternalLink></Td>
      <Td className="text-gray-500">{author.institution ?? "—"}</Td>
      <Td className="tabular-nums">{author.worksCount.toLocaleString()}</Td>
      <Td className="tabular-nums">{author.citedByCount.toLocaleString()}</Td>
      <Td className="text-gray-400 text-xs">{author.topConcepts.join(" · ") || "—"}</Td>
    </>
  );
}

function InstitutionRow({ institution }: { institution: NormalizedInstitution }) {
  return (
    <>
      <Td><ExternalLink href={institution.id}>{institution.name}</ExternalLink></Td>
      <Td className="font-mono text-xs text-gray-500">{institution.country ?? "—"}</Td>
      <Td className="text-gray-500 capitalize">{institution.type ?? "—"}</Td>
      <Td className="tabular-nums">{institution.worksCount.toLocaleString()}</Td>
      <Td className="tabular-nums">{institution.citedByCount.toLocaleString()}</Td>
    </>
  );
}

function SourceRow({ source }: { source: NormalizedSource }) {
  return (
    <>
      <Td><ExternalLink href={source.id}>{source.name}</ExternalLink></Td>
      <Td className="text-gray-500 capitalize">{source.type ?? "—"}</Td>
      <Td className="font-mono text-xs text-gray-500">{source.issnL ?? "—"}</Td>
      <Td><Badge variant={source.isOA ? "green" : "gray"}>{source.isOA ? "Open" : "Closed"}</Badge></Td>
      <Td className="tabular-nums">{source.worksCount.toLocaleString()}</Td>
      <Td className="tabular-nums">{source.citedByCount.toLocaleString()}</Td>
    </>
  );
}

function ConceptRow({ concept }: { concept: NormalizedConcept }) {
  return (
    <>
      <Td><ExternalLink href={concept.id}>{concept.name}</ExternalLink></Td>
      <Td className="text-gray-500 tabular-nums">{concept.level}</Td>
      <Td className="text-gray-500 max-w-sm">
        <span className="line-clamp-2 text-xs leading-relaxed">{concept.description ?? "—"}</span>
      </Td>
      <Td className="tabular-nums">{concept.worksCount.toLocaleString()}</Td>
      <Td className="tabular-nums">{concept.citedByCount.toLocaleString()}</Td>
    </>
  );
}
