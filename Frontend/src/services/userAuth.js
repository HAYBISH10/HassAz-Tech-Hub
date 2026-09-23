const TOKEN_KEY = "hassazUserToken";
const EXPIRES_KEY = "hassazUserTokenExpiresAt";
const USER_KEY = "hassazUserProfile";

export function saveUserSession({ token, expiresAt, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXPIRES_KEY, String(expiresAt));
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUserSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getUserToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiresAt = Number(localStorage.getItem(EXPIRES_KEY) || 0);
  if (!token || !expiresAt || Date.now() > expiresAt) {
    clearUserSession();
    return null;
  }
  return token;
}

export function getCachedUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function userHeaders() {
  const token = getUserToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function registerUser(payload) {
  const response = await fetch("/api/users/register", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Could not create this account.");
    error.title = data.title || "";
    throw error;
  }
  saveUserSession(data);
  return data;
}

export async function loginUser(payload) {
  const response = await fetch("/api/users/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Incorrect email or password.");
    error.title = data.title || "";
    error.status = response.status;
    throw error;
  }
  saveUserSession(data);
  return data;
}

export async function loginWithGoogle(credential) {
  const response = await fetch("/api/users/google", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Google sign-in failed.");
  }
  saveUserSession(data);
  return data;
}

export async function fetchCurrentUser() {
  const response = await fetch("/api/users/me", { credentials: "include", headers: userHeaders() });
  if (!response.ok) {
    clearUserSession();
    return null;
  }
  const data = await response.json();
  if (data.user) localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export async function logoutUser() {
  const token = getUserToken();
  clearUserSession();
  try {
    await fetch("/api/users/logout", {
      method: "POST",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    // ignore
  }
}

export async function requestPasswordReset(email) {
  const response = await fetch("/api/users/forgot-password", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Could not send a reset email.");
  return data;
}

export async function resetPassword(payload) {
  const response = await fetch("/api/users/reset-password", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Could not reset this password.");
  return data;
}

export async function fetchGoogleConfig() {
  try {
    const response = await fetch("/api/users/google/config", { credentials: "include" });
    if (!response.ok) return { enabled: false, clientId: "" };
    return response.json();
  } catch {
    return { enabled: false, clientId: "" };
  }
}
