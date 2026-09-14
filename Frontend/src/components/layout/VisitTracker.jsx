import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { recordVisit } from "../../services/api";
import { isAdminLocation } from "../../adminPath";

function visitorId() {
  const key = "hassazVisitorId";
  let id = localStorage.getItem(key);
  if (!id) {
    id =
      globalThis.crypto?.randomUUID?.() ||
      `v-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export default function VisitTracker() {
  const location = useLocation();

  useEffect(() => {
    if (isAdminLocation(location.pathname)) return;
    recordVisit({
      sessionId: visitorId(),
      path: location.pathname + location.search,
    }).catch(() => {});
  }, [location.pathname, location.search]);

  return null;
}
