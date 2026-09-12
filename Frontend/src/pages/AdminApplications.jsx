import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminPath } from "../adminPath";
import Countdown from "../components/ui/Countdown";
import PageLoader from "../components/ui/PageLoader";
import { fetchApplicationWindow, fetchApplications, updateApplicationWindow } from "../services/api";

function formatDateTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AdminApplications() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    fetchApplications()
      .then((apps) => setCount(apps.length))
      .catch(() => setCount(null));
  }, []);

  return (
    <section className="mx-auto max-w-5xl">
      <p className="text-sm font-semibold text-gold">Staff only · Strictly admin controlled</p>
      <h1 className="font-heading mt-1 text-3xl font-bold text-navy">Course applications</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        No one can submit a course application anywhere on the HassAz Tech Hub website — including the "Apply"
        buttons on the Courses, About, and Community pages — unless applications are open here. Opening and
        closing the intake is entirely controlled from this page.
      </p>

      <ApplicationWindowPanel />

      <div className="mt-6 rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-navy">Applicants</h2>
            <p className="mt-1 text-sm text-muted">
              {count === null ? "View, approve, or reject every applicant." : `${count} applicant${count === 1 ? "" : "s"} so far.`}
            </p>
          </div>
          <Link
            to={adminPath("applicants")}
            className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-mid"
          >
            Go to Applicants
          </Link>
        </div>
      </div>
    </section>
  );
}

function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function ApplicationWindowPanel() {
  const [win, setWin] = useState(null);
  const [openAt, setOpenAt] = useState("");
  const [closeAt, setCloseAt] = useState("");
  const [allowRejectedReapply, setAllowRejectedReapply] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Refreshes the display-only status (badge, "opens/closes in" countdowns).
  // Deliberately does NOT touch the editable openAt/closeAt input fields, so
  // it never stomps on dates the admin is actively typing but hasn't saved.
  const refreshWindow = useCallback(() => {
    return fetchApplicationWindow()
      .then(setWin)
      .catch(() => {
        // keep showing the last known window on a transient network error
      });
  }, []);

  useEffect(() => {
    // Load once and populate the editable fields with the saved values.
    fetchApplicationWindow()
      .then((data) => {
        setWin(data);
        setOpenAt(toLocalInputValue(data.openAt));
        setCloseAt(toLocalInputValue(data.closeAt));
        setAllowRejectedReapply(data.allowRejectedReapply !== false);
      })
      .finally(() => setLoading(false));

    // Then poll only the display status so the "Open now" / "Closed now"
    // badge flips on its own the moment a date is reached — no manual
    // refresh needed, and no interference with in-progress edits.
    const id = setInterval(refreshWindow, 5000);
    return () => clearInterval(id);
  }, [refreshWindow]);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await updateApplicationWindow({
        openAt: openAt ? new Date(openAt).toISOString() : null,
        closeAt: closeAt ? new Date(closeAt).toISOString() : null,
        allowRejectedReapply,
      });
      setWin(updated);
    } catch (err) {
      setError(err.message || "Could not update the application window.");
    } finally {
      setSaving(false);
    }
  }

  async function clearWindow() {
    setOpenAt("");
    setCloseAt("");
    setSaving(true);
    setError("");
    try {
      const updated = await updateApplicationWindow({ openAt: null, closeAt: null });
      setWin(updated);
    } catch (err) {
      setError(err.message || "Could not update the application window.");
    } finally {
      setSaving(false);
    }
  }

  async function closeNow() {
    setSaving(true);
    setError("");
    try {
      const nowIso = new Date().toISOString();
      const updated = await updateApplicationWindow({
        openAt: openAt ? new Date(openAt).toISOString() : null,
        closeAt: nowIso,
      });
      setWin(updated);
      setCloseAt(toLocalInputValue(nowIso));
    } catch (err) {
      setError(err.message || "Could not update the application window.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative mt-6 rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
      {loading ? <PageLoader overlay label="Loading application window..." /> : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-bold text-navy">Course application window</h2>
        {win ? (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              win.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {win.isOpen ? "Open now" : "Closed now"}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-muted">
        Applications are <strong className="text-navy">closed by default</strong>. Set an "Opens at" date to open
        the intake — students can only apply once that date/time has been reached. Add a "Closes at" date to
        automatically close it again afterwards, or leave "Closes at" blank to keep it open until you close it
        yourself. While closed (including when no window has ever been set), the application form is hidden
        everywhere on the site and the backend rejects any submission attempt.
      </p>

      {win && !win.isOpen && !win.openAt ? (
        <p className="mt-3 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          No application window has been set — students cannot apply anywhere on the site until you set an
          "Opens at" date below.
        </p>
      ) : null}

      {win && (win.openAt || win.closeAt) ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {win.openAt ? (
            <div className="rounded-xl bg-soft p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy/60">Opening date &amp; time</p>
              <p className="mt-1 text-sm font-semibold text-navy">{formatDateTime(win.openAt)}</p>
              {win.reason === "not-yet-open" ? (
                <>
                  <p className="mt-2 text-xs text-muted">Opens in:</p>
                  <Countdown target={win.openAt} className="mt-1 text-navy" onReached={refreshWindow} />
                </>
              ) : null}
            </div>
          ) : null}
          {win.closeAt ? (
            <div className="rounded-xl bg-soft p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy/60">Closing date &amp; time</p>
              <p className="mt-1 text-sm font-semibold text-navy">{formatDateTime(win.closeAt)}</p>
              {win.isOpen ? (
                <>
                  <p className="mt-2 text-xs text-muted">Closes in:</p>
                  <Countdown target={win.closeAt} className="mt-1 text-gold-dark" onReached={refreshWindow} />
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={save} className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-navy">Opens at</span>
          <input
            type="datetime-local"
            value={openAt}
            onChange={(e) => setOpenAt(e.target.value)}
            className="w-full rounded-md border border-navy/15 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-navy">Closes at</span>
          <input
            type="datetime-local"
            value={closeAt}
            onChange={(e) => setCloseAt(e.target.value)}
            className="w-full rounded-md border border-navy/15 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex items-start gap-3 rounded-xl bg-soft p-4 text-sm text-navy sm:col-span-2">
          <input
            type="checkbox"
            className="mt-1"
            checked={allowRejectedReapply}
            onChange={(event) => setAllowRejectedReapply(event.target.checked)}
          />
          <span>
            Allow a rejected applicant to apply again with the same email or phone. Pending and approved applications
            still cannot be duplicated.
          </span>
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save window"}
          </button>
          <button
            type="button"
            onClick={closeNow}
            disabled={saving}
            className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-50"
          >
            Close applications now
          </button>
          <button
            type="button"
            onClick={clearWindow}
            disabled={saving}
            className="rounded-full border border-navy/15 px-5 py-2.5 text-sm font-semibold text-navy disabled:opacity-50"
          >
            Clear dates (stays closed)
          </button>
        </div>
        {error ? <p className="text-sm font-semibold text-red-700 sm:col-span-2">{error}</p> : null}
      </form>
    </div>
  );
}
