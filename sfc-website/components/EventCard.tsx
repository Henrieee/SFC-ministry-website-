"use client";
import Countdown from "@/components/Countdown";
import { useAttendance } from "@/hooks/useAttendance";

type EventCardProps = {
  ev: {
    id: string;
    category?: string;
    title?: string;
    venue?: string;
    date?: unknown;
  };
};

export default function EventCard({ ev }: EventCardProps) {
  const { count, attending, processing, toggleAttendance } = useAttendance(ev.id, 0);

  const targetDate = (() => {
    const d = ev.date;
    if (!d) return new Date().toISOString();
    if (typeof d === "string") return d;
    if (typeof d === "number") return new Date(d).toISOString();
    if (
      typeof d === "object" &&
      d !== null &&
      "toDate" in d &&
      typeof (d as { toDate: () => Date }).toDate === "function"
    ) {
      return (d as { toDate: () => Date }).toDate().toISOString();
    }
    return new Date().toISOString();
  })();

  return (
    <div className="rounded-2xl overflow-hidden bg-gradient-to-b from-[var(--surface)] to-[var(--surface2)] border border-[var(--border)] shadow-md flex flex-col">
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="px-2 py-1 bg-[var(--sfc-red)] text-white text-[11px] font-semibold rounded-full uppercase tracking-wider">{(ev.category || "Event").slice(0,12)}</div>
        </div>
      </div>
      <div className="p-4 pt-0 flex-1 flex flex-col justify-between">
        <div>
          <div className="font-display text-lg mb-1 truncate">{ev.title}</div>
          <div className="text-xs text-[var(--text-dim)] mb-3">{ev.venue}</div>
          <div className="text-[11px] text-[var(--text-dim)] mb-2 font-mono-sfc">
            📅 {new Date(targetDate).toLocaleString([], { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="mb-3">
            <Countdown targetDate={targetDate} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-[var(--text-dim)]">{count === null ? "…" : count} Attending</div>
          <button
            onClick={toggleAttendance}
            disabled={processing}
            className={`rounded-full px-4 py-2 text-sm font-bold text-white ${attending ? "bg-green-700" : "bg-[var(--sfc-red)]"} ${processing ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`}
          >
            {processing ? "Saving…" : "Attending"}
          </button>
        </div>
      </div>
    </div>
  );
}
