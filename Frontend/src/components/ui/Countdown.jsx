import { useEffect, useState } from "react";

function diffParts(targetIso) {
  if (!targetIso) return null;
  const diff = new Date(targetIso).getTime() - Date.now();
  const abs = Math.max(diff, 0);
  const totalSeconds = Math.floor(abs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, reached: diff <= 0 };
}

export default function Countdown({ target, className = "", onReached }) {
  const [parts, setParts] = useState(() => diffParts(target));

  useEffect(() => {
    if (!target) {
      setParts(null);
      return undefined;
    }
    setParts(diffParts(target));
    const id = setInterval(() => {
      const next = diffParts(target);
      setParts(next);
      if (next?.reached && onReached) onReached();
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  if (!parts) return null;

  return (
    <span className={`inline-flex flex-wrap items-baseline justify-center gap-x-2.5 gap-y-1 font-mono tabular-nums ${className}`}>
      <TimeBox value={parts.days} label="Days" />
      <TimeBox value={parts.hours} label="Hours" />
      <TimeBox value={parts.minutes} label="Minutes" />
      <TimeBox value={parts.seconds} label="Seconds" />
    </span>
  );
}

function TimeBox({ value, label }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="text-base font-bold sm:text-lg">{String(value).padStart(2, "0")}</span>
      <span className="font-sans text-[10px] font-semibold tracking-wide opacity-80 sm:text-[11px]">{label}</span>
    </span>
  );
}
