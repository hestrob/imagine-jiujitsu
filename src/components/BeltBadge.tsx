import { BELT_COLORS, BELT_LABELS } from "@/lib/belts";

export function BeltBadge({ belt, stripes }: { belt: string; stripes: number }) {
  const color = BELT_COLORS[belt] ?? "#FAFAF7";
  const light = belt === "WHITE";
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className="relative inline-block h-3 w-16 border border-ink/30"
        style={{ backgroundColor: color }}
      >
        <span className="absolute right-1.5 top-0 bottom-0 flex items-center gap-[3px]">
          {Array.from({ length: stripes }).map((_, i) => (
            <span key={i} className={`h-full w-[3px] ${light ? "bg-ink" : "bg-mat"}`} />
          ))}
        </span>
      </span>
      <span className="text-sm">{BELT_LABELS[belt] ?? belt} {stripes > 0 ? `· ${stripes} stripe${stripes > 1 ? "s" : ""}` : ""}</span>
    </span>
  );
}
