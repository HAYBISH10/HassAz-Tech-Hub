import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminPath } from "../adminPath";
import Countdown from "../components/ui/Countdown";
import PageLoader from "../components/ui/PageLoader";
import SelectOrCustom from "../components/ui/SelectOrCustom";
import {
  COHORT_OPTIONS,
  INTAKE_OPTIONS,
  cohortForMonth,
  monthForCohort,
  monthForName,
  nameForMonth,
  yearOptions,
} from "../data/cohorts";
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

function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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
        Use the dropdowns to choose cohort, year, course area, and specific course, or type your own. Save that
        window so December 2026 stays apart from January 2027, and Data Science stays apart from Software Engineering.
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

function ApplicationWindowPanel() {
  const [win, setWin] = useState(null);
  const [allowRejectedReapply, setAllowRejectedReapply] = useState(true);
  const [loading, setLoading] = useState(true);

  const refreshWindow = useCallback(() => {
    return fetchApplicationWindow()
      .then(setWin)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchApplicationWindow()
      .then((data) => {
        setWin(data);
        setAllowRejectedReapply(data.allowRejectedReapply !== false);
      })
      .finally(() => setLoading(false));
    const id = setInterval(refreshWindow, 30000);
    return () => clearInterval(id);
  }, [refreshWindow]);

  return (
    <div className="relative mt-6 rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
      {loading ? <PageLoader overlay label="Loading application window..." /> : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-bold text-navy">Open applications</h2>
        {win ? (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              win.anyOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {win.anyOpen ? "Open now" : "Closed now"}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-muted">
        Applications stay closed until you save dates. Choose <strong className="text-navy">All courses</strong> to
        open everything, or pick one area and one bootcamp. You can type a custom cohort name if you need one.
      </p>

      {win && !win.anyOpen && !win.openAt ? (
        <p className="mt-3 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          No application window is open. Use the form below, then Save.
        </p>
      ) : null}

      {win?.displayDeadline?.closeAt || win?.displayDeadline?.openAt ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {win.displayDeadline.openAt ? (
            <div className="rounded-xl bg-soft p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy/60">Opening date &amp; time</p>
              <p className="mt-1 text-sm font-semibold text-navy">{formatDateTime(win.displayDeadline.openAt)}</p>
              {win.displayDeadline.reason === "not-yet-open" ? (
                <>
                  <p className="mt-2 text-xs text-muted">Opens in:</p>
                  <Countdown target={win.displayDeadline.openAt} className="mt-1 text-navy" onReached={refreshWindow} />
                </>
              ) : null}
            </div>
          ) : null}
          {win.displayDeadline.closeAt ? (
            <div className="rounded-xl bg-soft p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy/60">Closing date &amp; time</p>
              <p className="mt-1 text-sm font-semibold text-navy">{formatDateTime(win.displayDeadline.closeAt)}</p>
              {win.anyOpen ? (
                <>
                  <p className="mt-2 text-xs text-muted">Closes in:</p>
                  <Countdown
                    target={win.displayDeadline.closeAt}
                    warnAtDays={5}
                    className="mt-1 text-gold-dark"
                    onReached={refreshWindow}
                  />
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <WindowForm
        win={win}
        allowRejectedReapply={allowRejectedReapply}
        onAllowRejectedChange={setAllowRejectedReapply}
        onSaved={setWin}
      />
    </div>
  );
}

function WindowForm({ win, allowRejectedReapply, onAllowRejectedChange, onSaved }) {
  const yearNow = String(new Date().getFullYear());
  const areas = win?.catalog || [];
  const [cohort, setCohort] = useState(win?.cohort || win?.intake?.cohort || "Cohort 1");
  const [intakeName, setIntakeName] = useState(win?.intakeName || win?.intake?.name || "December");
  const [year, setYear] = useState(String(win?.intakeYear || win?.intake?.year || yearNow));
  const [areaSlug, setAreaSlug] = useState("");
  const [courseSlug, setCourseSlug] = useState("");
  const [openAt, setOpenAt] = useState("");
  const [closeAt, setCloseAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedArea = areas.find((item) => item.slug === areaSlug);
  const courses = selectedArea?.courses || [];
  const selectedSource = courseSlug
    ? selectedArea?.courses?.find((item) => item.slug === courseSlug)
    : areaSlug
      ? selectedArea
      : win;
  const savedOpen = selectedSource?.openAt || "";
  const savedClose = selectedSource?.closeAt || "";
  const savedStamp = [
    selectedSource?.cohort || "",
    selectedSource?.intakeName || "",
    selectedSource?.intakeYear || "",
    savedOpen,
    savedClose,
  ].join("|");

  useEffect(() => {
    setOpenAt(toLocalInputValue(savedOpen));
    setCloseAt(toLocalInputValue(savedClose));
    if (selectedSource?.cohort) setCohort(selectedSource.cohort);
    if (selectedSource?.intakeName) setIntakeName(selectedSource.intakeName);
    if (selectedSource?.intakeYear) setYear(String(selectedSource.intakeYear));
  }, [areaSlug, courseSlug, savedStamp]);

  const scope = courseSlug ? "course" : areaSlug ? "area" : "all";
  const slug = courseSlug || areaSlug || "";
  const intakeMonth = monthForName(intakeName);

  function payload(dates) {
    return {
      scope,
      slug,
      cohort,
      intakeName,
      intakeMonth,
      intakeYear: Number(year) || null,
      allowRejectedReapply,
      openAt: dates.openAt,
      closeAt: dates.closeAt,
    };
  }

  async function saveDates(next) {
    setSaving(true);
    setError("");
    try {
      const updated = await updateApplicationWindow(payload(next));
      onSaved(updated);
    } catch (err) {
      setError(err.message || "Could not save this window.");
    } finally {
      setSaving(false);
    }
  }

  async function removeWindow(item) {
    setSaving(true);
    setError("");
    try {
      const updated = await updateApplicationWindow({
        scope: item?.scope || scope,
        slug: item?.slug || slug,
        delete: true,
      });
      onSaved(updated);
      if (!item || item.scope === scope) {
        setOpenAt("");
        setCloseAt("");
      }
    } catch (err) {
      setError(err.message || "Could not delete this window.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6">
      <h3 className="font-heading text-base font-bold text-navy">Set cohort and dates</h3>
      <p className="mt-1 text-sm text-muted">
        Example: Cohort 1, December, 2026, Data Courses, Data Science Bootcamp. Use Write my own if you need a
        different name.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <SelectOrCustom
          label="Cohort"
          value={cohort}
          options={COHORT_OPTIONS}
          placeholder="Choose cohort"
          customPlaceholder="e.g. Holiday cohort"
          onChange={(next) => {
            setCohort(next);
            const month = monthForCohort(next);
            if (month != null) setIntakeName(nameForMonth(month));
          }}
        />
        <SelectOrCustom
          label="Intake"
          value={intakeName}
          options={INTAKE_OPTIONS.map((item) => item.name)}
          placeholder="Choose January, June, or December"
          customPlaceholder="e.g. March"
          onChange={(next) => {
            setIntakeName(next);
            const month = monthForName(next);
            if (month != null) setCohort(cohortForMonth(month));
          }}
        />
        <SelectOrCustom
          label="Year"
          value={year}
          options={yearOptions(year)}
          placeholder="Choose year"
          customPlaceholder="e.g. 2028"
          onChange={setYear}
        />
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">Course area</span>
          <select
            value={areaSlug}
            onChange={(event) => {
              setAreaSlug(event.target.value);
              setCourseSlug("");
            }}
            className="w-full rounded-md border border-navy/15 px-3 py-2 text-sm"
          >
            <option value="">All courses</option>
            {areas.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">Specific course</span>
          <select
            value={courseSlug}
            onChange={(event) => setCourseSlug(event.target.value)}
            className="w-full rounded-md border border-navy/15 px-3 py-2 text-sm"
            disabled={!areaSlug}
          >
            <option value="">{areaSlug ? "All in this area" : "Choose a course area first"}</option>
            {courses.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">Opens at</span>
          <input
            type="datetime-local"
            step="1"
            value={openAt}
            onChange={(event) => setOpenAt(event.target.value)}
            className="w-full rounded-md border border-navy/15 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">Closes at</span>
          <input
            type="datetime-local"
            step="1"
            value={closeAt}
            onChange={(event) => setCloseAt(event.target.value)}
            className="w-full rounded-md border border-navy/15 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex items-start gap-3 rounded-xl bg-soft p-4 text-sm text-navy sm:col-span-2">
          <input
            type="checkbox"
            className="mt-1"
            checked={allowRejectedReapply}
            onChange={(event) => onAllowRejectedChange(event.target.checked)}
          />
          <span>
            Allow a rejected applicant to apply again with the same email or phone. Pending and approved applications
            still cannot be duplicated.
          </span>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() =>
            saveDates({
              openAt: openAt ? new Date(openAt).toISOString() : null,
              closeAt: closeAt ? new Date(closeAt).toISOString() : null,
            })
          }
          className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => {
            const nowIso = new Date().toISOString();
            setOpenAt(toLocalInputValue(nowIso));
            saveDates({ openAt: nowIso, closeAt: closeAt ? new Date(closeAt).toISOString() : null });
          }}
          className="rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold text-navy disabled:opacity-50"
        >
          Open now
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => {
            const nowIso = new Date().toISOString();
            setCloseAt(toLocalInputValue(nowIso));
            saveDates({
              openAt: openAt ? new Date(openAt).toISOString() : null,
              closeAt: nowIso,
            });
          }}
          className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
        >
          Close now
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => {
            setOpenAt("");
            setCloseAt("");
            saveDates({ openAt: null, closeAt: null });
          }}
          className="rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold text-navy disabled:opacity-50"
        >
          Clear
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => removeWindow()}
          className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
      {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}

      {(win?.savedWindows || []).length ? (
        <div className="mt-6 overflow-auto rounded-xl border border-navy/10">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-soft text-left text-xs uppercase tracking-wide text-navy/70">
                <th className="px-3 py-2">Saved window</th>
                <th className="px-3 py-2">Cohort</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {win.savedWindows.map((item) => (
                <tr key={`${item.scope}-${item.slug}`} className="border-t border-navy/10">
                  <td className="px-3 py-2 font-semibold text-navy">{item.title}</td>
                  <td className="px-3 py-2">{item.cohortLabel || "-"}</td>
                  <td className="px-3 py-2">{item.isOpen ? "Open" : "Closed"}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => removeWindow(item)}
                      className="text-sm font-semibold text-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">No specific course windows saved yet.</p>
      )}
    </div>
  );
}
