const TOKEN_KEY = "hassazAdminToken";
const EXPIRES_KEY = "hassazAdminTokenExpiresAt";

export function saveSession({ token, expiresAt }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXPIRES_KEY, String(expiresAt));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_KEY);
}

export function getToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiresAt = Number(localStorage.getItem(EXPIRES_KEY) || 0);
  if (!token || !expiresAt || Date.now() > expiresAt) {
    clearSession();
    return null;
  }
  return token;
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export async function adminLogin(username, password) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
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
  if (!token) return;
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // ignore network errors on logout
  }
}
