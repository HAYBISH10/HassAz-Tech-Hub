const DRAFT_KEY = "hiacdi_apply_draft";
const DRAFT_VERSION = 3;
const MAX_AGE_MS = 45 * 24 * 60 * 60 * 1000;

export function loadApplyDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.version !== DRAFT_VERSION || data.submitted) return null;
    if (Date.now() - Number(data.updatedAt || 0) > MAX_AGE_MS) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function saveApplyDraft(payload) {
  try {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        version: DRAFT_VERSION,
        submitted: false,
        updatedAt: Date.now(),
        step: payload.step,
        form: payload.form,
        quiz: payload.quiz,
      })
    );
  } catch {
    // Quota or private mode — keep the in-memory form only.
  }
}

export function clearApplyDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
