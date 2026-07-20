"use client";
import { useEffect, useState } from "react";

function getTimeLeft(target: string) {
  const diff = Math.max(new Date(target).getTime() - Date.now(), 0);
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

export default function Countdown({ targetDate }: { targetDate: string }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    // Defer initial update so React hook lint (set-state-in-effect) is satisfied.
    const initial = window.setTimeout(() => {
      setTime(getTimeLeft(targetDate));
    }, 0);

    const interval = setInterval(() => {
      setTime(getTimeLeft(targetDate));
    }, 1000);

    return () => {
      window.clearTimeout(initial);
      clearInterval(interval);
    };
  }, [targetDate]);

  const cells = [
    { label: "Days", value: time.d },
    { label: "Hrs", value: time.h },
    { label: "Min", value: time.m },
    { label: "Sec", value: time.s },
  ];

  return (
    <div className="flex gap-2">
      {cells.map((c) => (
        <div key={c.label} className="flex-1 bg-[var(--surface2)] rounded-lg text-center py-3">
          <div className="font-mono-sfc font-bold text-xl">{String(c.value).padStart(2, "0")}</div>
          <div className="font-mono-sfc text-[9px] uppercase tracking-wider text-[var(--text-dim)]">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
