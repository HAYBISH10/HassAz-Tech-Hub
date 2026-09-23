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

const sizes = {
  sm: {
    wrap: "flex-wrap gap-x-2.5 gap-y-1",
    value: "text-base font-bold sm:text-lg",
    label: "font-sans text-[10px] font-semibold tracking-wide opacity-80 sm:text-[11px]",
  },
  md: {
    wrap: "flex-wrap justify-center gap-x-3 gap-y-1",
    value: "text-lg font-bold sm:text-xl",
    label: "font-sans text-[11px] font-semibold tracking-wide opacity-90 sm:text-xs",
  },
};

export default function Countdown({ target, className = "", size = "sm", warnAtDays, onReached }) {
  const [parts, setParts] = useState(() => diffParts(target));
  const scale = sizes[size] || sizes.md;

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

  const urgent = warnAtDays != null && parts.days <= warnAtDays;

  return (
    <span
      className={`inline-flex items-baseline justify-center font-mono tabular-nums ${scale.wrap} ${className} ${
        urgent ? "!text-red-500" : ""
      }`}
    >
      <TimeBox value={parts.days} label="Days" scale={scale} />
      <TimeBox value={parts.hours} label="Hours" scale={scale} />
      <TimeBox value={parts.minutes} label="Minutes" scale={scale} />
      <TimeBox value={parts.seconds} label="Seconds" scale={scale} />
    </span>
  );
}

function TimeBox({ value, label, scale }) {
  return (
    <span className="inline-flex shrink-0 items-baseline gap-1">
      <span className={scale.value}>{String(value).padStart(2, "0")}</span>
      <span className={scale.label}>{label}</span>
    </span>
  );
}
