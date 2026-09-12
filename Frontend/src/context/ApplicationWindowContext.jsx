import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { fetchApplicationWindow } from "../services/api";

const ApplicationWindowContext = createContext({
  isOpen: true,
  openAt: null,
  closeAt: null,
  reason: "",
  loading: true,
  refresh: () => {},
});

// Poll fairly often so an admin-set window opens or closes itself for every
// visitor automatically, without anyone needing to refresh the page. Any
// Countdown reaching zero also calls refresh() directly for an instant flip.
const POLL_MS = 5000;

export function ApplicationWindowProvider({ children }) {
  const [state, setState] = useState({
    isOpen: true,
    openAt: null,
    closeAt: null,
    reason: "",
    loading: true,
  });
  const activeRef = useRef(true);

  const load = useCallback(() => {
    fetchApplicationWindow()
      .then((data) => {
        if (!activeRef.current) return;
        setState({
          isOpen: data.isOpen !== false,
          openAt: data.openAt || null,
          closeAt: data.closeAt || null,
          reason: data.reason || "",
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

  return (
    <ApplicationWindowContext.Provider value={{ ...state, refresh: load }}>
      {children}
    </ApplicationWindowContext.Provider>
  );
}

export function useApplicationWindow() {
  return useContext(ApplicationWindowContext);
}
