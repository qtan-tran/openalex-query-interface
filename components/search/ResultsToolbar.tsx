import type { Entity, ResponseMeta } from "@/lib/api-types";

interface Props {
  meta: ResponseMeta;
  entity: Entity;
  query: string;
}

export default function ResultsToolbar({ meta, entity, query }: Props) {
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

      {/* Slot for future actions: export, visualize, save search */}
      <div className="flex items-center gap-2" />
    </div>
  );
}
