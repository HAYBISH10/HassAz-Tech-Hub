import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { fetchApplicationWindow } from "../services/api";

const empty = {
  isOpen: false,
  anyOpen: false,
  globalOpen: false,
  openAt: null,
  closeAt: null,
  reason: "",
  catalog: [],
  openSummary: { global: false, areas: [], courses: [] },
  intake: null,
  loading: true,
};

const ApplicationWindowContext = createContext({
  ...empty,
  refresh: () => {},
    isCourseOpen: () => false,
});

const POLL_MS = 5000;

export function isCourseOpenIn(data, categorySlug, programSlug) {
  if (!data) return false;
  if (data.globalOpen) return true;
  const area = (data.catalog || []).find((item) => item.slug === categorySlug);
  if (area?.isOpen) return true;
  const course = area?.courses?.find((item) => item.slug === programSlug);
  if (course?.isOpen) return true;
  return false;
}

export function ApplicationWindowProvider({ children }) {
  const [state, setState] = useState(empty);
  const activeRef = useRef(true);

  const load = useCallback(() => {
    fetchApplicationWindow()
      .then((data) => {
        if (!activeRef.current) return;
        setState({
          isOpen: Boolean(data.displayDeadline?.isOpen ?? (data.anyOpen !== false && data.isOpen !== false)),
          anyOpen: data.anyOpen !== false,
          globalOpen: Boolean(data.globalOpen),
          openAt: data.displayDeadline?.openAt || data.openAt || null,
          closeAt: data.displayDeadline?.closeAt || data.closeAt || null,
          reason: data.displayDeadline?.reason || data.reason || "",
          catalog: data.catalog || [],
          openSummary: data.openSummary || { global: false, areas: [], courses: [] },
          intake: data.intake || null,
          loading: false,
        });
      })
      .catch(() => {
        // keep the last known state on transient network errors
      });
  }, []);

  useEffect(() => {
    activeRef.current = true;
    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      activeRef.current = false;
      clearInterval(id);
    };
  }, [load]);

  const isCourseOpen = useCallback(
    (categorySlug, programSlug) => isCourseOpenIn(state, categorySlug, programSlug),
    [state]
  );

  return (
    <ApplicationWindowContext.Provider value={{ ...state, refresh: load, isCourseOpen }}>
      {children}
    </ApplicationWindowContext.Provider>
  );
}

export function useApplicationWindow() {
  return useContext(ApplicationWindowContext);
}
