import { useEffect, useRef } from "react";

export function useLiveRefresh(load, { interval = 8000, enabled = true, paused = false } = {}) {
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;

    async function tick() {
      if (paused || cancelled) return;
      try {
        await loadRef.current();
      } catch {
        // keep the last good list
      }
    }

    const id = setInterval(tick, interval);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [enabled, interval, paused]);
}
