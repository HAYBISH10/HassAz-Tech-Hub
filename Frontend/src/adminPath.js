/** Staff panel base path. `#` cannot be part of a URL path (it is the browser fragment). */
export const ADMIN_BASE = "/HassAz-i-HUb@";

export function adminPath(sub = "") {
  const rest = String(sub || "").replace(/^\//, "");
  return rest ? `${ADMIN_BASE}/${rest}` : ADMIN_BASE;
}

export function isAdminLocation(pathname = "") {
  return pathname === ADMIN_BASE || pathname.startsWith(`${ADMIN_BASE}/`);
}
