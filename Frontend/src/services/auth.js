const TOKEN_KEY = "hassazAdminToken";
const EXPIRES_KEY = "hassazAdminTokenExpiresAt";

let liveToken = "";
let liveExpiresAt = 0;

function dropSavedLogin() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EXPIRES_KEY);
  } catch {
    // ignore storage access errors
  }
}

dropSavedLogin();

export function saveSession({ token, expiresAt }) {
  dropSavedLogin();
  liveToken = String(token || "");
  liveExpiresAt = Number(expiresAt) || 0;
}

export function clearSession() {
  liveToken = "";
  liveExpiresAt = 0;
  dropSavedLogin();
}

export function getToken() {
  if (!liveToken || !liveExpiresAt || Date.now() > liveExpiresAt) {
    clearSession();
    return null;
  }
  return liveToken;
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export async function adminLogin(username, password) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Incorrect username or password.");
  }
  saveSession(data);
  return data;
}

export async function adminLogout() {
  const token = getToken();
  clearSession();
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    // ignore network errors on logout
  }
}
