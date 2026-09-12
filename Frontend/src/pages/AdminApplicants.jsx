import { useEffect, useMemo, useState } from "react";
import ConfirmDeleteDialog from "../components/ui/ConfirmDeleteDialog";
import PageLoader from "../components/ui/PageLoader";
import { useCatalog } from "../hooks/useContent";
import {
  deleteApplication,
  downloadApplicationsFile,
  fetchApplications,
  updateApplicationState,
  updateApplicationStatus,
} from "../services/api";

export default function AdminApplicants() {
  const catalog = useCatalog();
  const [apps, setApps] = useState([]);
  const [tab, setTab] = useState("Open");
  const [areaSlug, setAreaSlug] = useState("");
  const [courseSlug, setCourseSlug] = useState("");
  const [open, setOpen] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState("");
  const [confirmDelete, setConfirmDelete] = useState("");
  const [deleting, setDeleting] = useState("");
  const [view, setView] = useState("table");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchApplications()
      .then(setApps)
      .catch(() => setError("Could not load applicants. Start the backend in WSL, then refresh."))
      .finally(() => setLoading(false));
  }, []);

  const openApps = apps.filter((app) => (app.state || "Open") !== "Closed");
  const closedApps = apps.filter((app) => app.state === "Closed");
  const pendingCount = apps.filter((app) => (app.status || "Submitted") === "Submitted").length;
  const approvedCount = apps.filter((app) => app.status === "Accepted").length;
  const rejectedCount = apps.filter((app) => app.status === "Rejected").length;

  const selectedArea = catalog.find((item) => item.slug === areaSlug) || null;
  const areaPrograms = selectedArea?.programs || [];

  const visible = useMemo(() => {
    const pool = tab === "Closed" ? closedApps : openApps;
    const byArea = areaSlug
      ? pool.filter((app) => applicantAreaSlug(app, catalog) === areaSlug)
      : pool;
    const byCourse = courseSlug
      ? byArea.filter((app) => applicantProgramSlug(app, catalog) === courseSlug)
      : byArea;
    const needle = query.trim().toLowerCase();
    if (!needle) return byCourse;
    return byCourse.filter((app) => {
      const haystack = [
        app.applicationNumber,
        app.status,
        app.personalInformation?.fullName,
        app.contactInformation?.email,
        app.contactInformation?.phone,
        app.program?.category,
        app.program?.program,
        app.program?.mode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [apps, tab, query, openApps, closedApps, areaSlug, courseSlug, catalog]);

  async function setState(applicationNumber, state) {
    setSaving(applicationNumber);
    setError("");
    try {
      const updated = await updateApplicationState(applicationNumber, state);
      setApps((current) =>
        current.map((item) => (item.applicationNumber === applicationNumber ? { ...item, ...updated } : item))
      );
      if (state === "Closed") setOpen("");
    } catch (err) {
      setError(err.message || "Could not update the application.");
    } finally {
      setSaving("");
    }
  }

  async function decide(applicationNumber, status) {
    setSaving(applicationNumber);
    setError("");
    try {
      const updated = await updateApplicationStatus(applicationNumber, status);
      setApps((current) =>
        current.map((item) => (item.applicationNumber === applicationNumber ? { ...item, ...updated } : item))
      );
    } catch (err) {
      setError(err.message || "Could not update this applicant's status.");
    } finally {
      setSaving("");
    }
  }

  async function remove(applicationNumber) {
    setDeleting(applicationNumber);
    setError("");
    try {
      await deleteApplication(applicationNumber);
      setApps((current) => current.filter((item) => item.applicationNumber !== applicationNumber));
      if (open === applicationNumber) setOpen("");
      setConfirmDelete("");
    } catch (err) {
      setError(err.message || "Could not delete this applicant.");
    } finally {
      setDeleting("");
    }
  }

  async function download(kind, applicationNumber, filters, busyKey) {
    setDownloading(applicationNumber ? applicationNumber : busyKey || kind);
    setError("");
    try {
      await downloadApplicationsFile(kind, applicationNumber, filters);
    } catch (err) {
      setError(err.message || "Could not download this file.");
    } finally {
      setDownloading("");
    }
  }

  const listFilters = areaSlug || courseSlug ? { categorySlug: areaSlug, programSlug: courseSlug } : {};
  const selectedCourse = areaPrograms.find((item) => item.slug === courseSlug);
  const excelLabel = courseSlug
    ? `Download ${selectedCourse?.title || "this course"} as Excel`
    : areaSlug
      ? `Download ${selectedArea?.title || "this area"} as Excel`
      : "Download all as Excel (.xlsx)";

  return (
    <section className="mx-auto max-w-7xl">
      <p className="text-sm font-semibold text-gold">Staff only</p>
      <h1 className="font-heading mt-1 text-3xl font-bold text-navy">Applicants</h1>
      <p className="mt-2 text-sm text-muted">
        View applicants by program area — Software Engineering, Data Courses, and the rest each have their own
        list. Choose a course inside an area to see only those students. Download all as Excel with one sheet per
        program area, or download just the list you are viewing.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <MiniStat label="Pending review" value={pendingCount} accent="bg-navy" />
        <MiniStat label="Approved" value={approvedCount} accent="bg-green-600" />
        <MiniStat label="Rejected" value={rejectedCount} accent="bg-red-600" />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={downloading === "excel"}
          onClick={() => download("excel")}
          className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-mid disabled:opacity-50"
        >
          {downloading === "excel" ? "Preparing…" : "Download all as Excel (.xlsx)"}
        </button>
        {areaSlug ? (
          <button
            type="button"
            disabled={downloading === "excel-filtered"}
            onClick={() => download("excel", undefined, listFilters, "excel-filtered")}
            className="inline-flex items-center gap-2 rounded-full border border-navy/20 px-5 py-2.5 text-sm font-semibold text-navy hover:border-gold hover:text-gold-dark disabled:opacity-50"
          >
            {downloading === "excel-filtered" ? "Preparing…" : excelLabel}
          </button>
        ) : null}
        <button
          type="button"
          disabled={downloading === "pdf"}
          onClick={() => download("pdf")}
          className="inline-flex items-center gap-2 rounded-full border border-navy/20 px-5 py-2.5 text-sm font-semibold text-navy hover:border-gold hover:text-gold-dark disabled:opacity-50"
        >
          {downloading === "pdf" ? "Preparing…" : "Download all as PDF"}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted">
        The full Excel file has one sheet per program area (Software Engineering, Data Courses, and so on). Open
        any row to view that applicant inside the site, or download just that one record.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <TabButton
          active={!areaSlug}
          onClick={() => {
            setAreaSlug("");
            setCourseSlug("");
            setOpen("");
          }}
        >
          All areas ({(tab === "Closed" ? closedApps : openApps).length})
        </TabButton>
        {catalog.map((category) => {
          const pool = tab === "Closed" ? closedApps : openApps;
          const count = pool.filter((app) => applicantAreaSlug(app, catalog) === category.slug).length;
          return (
            <TabButton
              key={category.slug}
              active={areaSlug === category.slug}
              onClick={() => {
                setAreaSlug(category.slug);
                setCourseSlug("");
                setOpen("");
              }}
            >
              {category.title} ({count})
            </TabButton>
          );
        })}
      </div>

      {selectedArea ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <TabButton
            active={!courseSlug}
            onClick={() => {
              setCourseSlug("");
              setOpen("");
            }}
          >
            All {selectedArea.title} courses (
            {(tab === "Closed" ? closedApps : openApps).filter(
              (app) => applicantAreaSlug(app, catalog) === selectedArea.slug
            ).length}
            )
          </TabButton>
          {areaPrograms.map((program) => {
            const pool = tab === "Closed" ? closedApps : openApps;
            const count = pool.filter(
              (app) =>
                applicantAreaSlug(app, catalog) === selectedArea.slug &&
                applicantProgramSlug(app, catalog) === program.slug
            ).length;
            return (
              <TabButton
                key={program.slug}
                active={courseSlug === program.slug}
                onClick={() => {
                  setCourseSlug(program.slug);
                  setOpen("");
                }}
              >
                {program.title} ({count})
              </TabButton>
            );
          })}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <TabButton active={tab === "Open"} onClick={() => setTab("Open")}>
            Open ({openApps.length})
          </TabButton>
          <TabButton active={tab === "Closed"} onClick={() => setTab("Closed")}>
            Closed ({closedApps.length})
          </TabButton>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, phone, course…"
            className="w-64 rounded-full border border-navy/15 px-4 py-2 text-sm text-ink outline-none focus:border-gold"
          />
          <div className="inline-flex rounded-full border border-navy/15 p-1">
            <button
              type="button"
              onClick={() => setView("table")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                view === "table" ? "bg-navy text-white" : "text-navy"
              }`}
            >
              Excel table
            </button>
            <button
              type="button"
              onClick={() => setView("cards")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                view === "cards" ? "bg-navy text-white" : "text-navy"
              }`}
            >
              Card view
            </button>
          </div>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-gold-dark">{error}</p> : null}
      {!error && !visible.length ? (
        <p className="mt-6 text-sm text-muted">
          {tab === "Closed"
            ? "No closed applicants in this list."
            : "No open applicants in this list."}
        </p>
      ) : null}

      {view === "table" && visible.length ? (
        <div className="relative mt-8 min-h-16">
          {loading ? <PageLoader overlay label="Loading applicants..." /> : null}
          <ApplicantsTable
            apps={visible}
            selected={open}
            downloading={downloading}
            onView={(applicationNumber) => setOpen(applicationNumber)}
            onDownload={(applicationNumber) => download("excel", applicationNumber)}
            onAskDelete={setConfirmDelete}
          />
        </div>
      ) : null}

      {view === "cards" ? (
      <div className="relative mt-8 min-h-16 space-y-3">
        {loading ? <PageLoader overlay label="Loading applicants..." /> : null}
        {visible.map((app) => {
          const name = app.personalInformation?.fullName || "Unnamed applicant";
          const email = app.contactInformation?.email || "—";
          const phone = app.contactInformation?.phone || "—";
          const program = app.program?.program || "—";
          const mode = app.program?.mode || "—";
          const active = open === app.applicationNumber;
          const isClosed = app.state === "Closed";
          const status = app.status || "Submitted";
          const isBusy = saving === app.applicationNumber;
          return (
            <article key={app.applicationNumber} className="rounded-2xl border border-navy/10 bg-white">
              <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => setOpen(active ? "" : app.applicationNumber)}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading text-lg font-bold text-navy">{name}</p>
                    <StatusBadge status={status} />
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {app.applicationNumber} · {isClosed ? "Closed" : "Open"} · {program}
                  </p>
                  <p className="mt-1 text-sm text-navy/80">
                    {phone} · {email}
                  </p>
                </button>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold text-navy"
                    onClick={() => setOpen(active ? "" : app.applicationNumber)}
                  >
                    {active ? "Hide" : "View"}
                  </button>
                  <button
                    type="button"
                    disabled={downloading === app.applicationNumber}
                    className="rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold text-navy disabled:opacity-50"
                    onClick={() => download("excel", app.applicationNumber)}
                  >
                    {downloading === app.applicationNumber ? "Saving…" : "Excel"}
                  </button>
                  {status !== "Accepted" ? (
                    <button
                      type="button"
                      disabled={isBusy}
                      className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      onClick={() => decide(app.applicationNumber, "Accepted")}
                    >
                      Approve
                    </button>
                  ) : null}
                  {status !== "Rejected" ? (
                    <button
                      type="button"
                      disabled={isBusy}
                      className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      onClick={() => decide(app.applicationNumber, "Rejected")}
                    >
                      Reject
                    </button>
                  ) : null}
                  {isClosed ? (
                    <button
                      type="button"
                      disabled={isBusy}
                      className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      onClick={() => setState(app.applicationNumber, "Open")}
                    >
                      Reopen
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isBusy}
                      className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      onClick={() => setState(app.applicationNumber, "Closed")}
                    >
                      Close
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isBusy || deleting === app.applicationNumber}
                    className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
                    onClick={() => setConfirmDelete(app.applicationNumber)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              {active ? (
                <div className="space-y-4 border-t border-navy/5 px-5 py-5 text-sm">
                  <Block title="Personal" data={app.personalInformation} />
                  <Block title="Contact" data={app.contactInformation} />
                  <Block title="Guardian" data={app.guardianInformation} />
                  <Block title="Education" data={app.education} />
                  <Block title="Program" data={app.program} />
                  <Block title="Technology" data={app.technologyBackground} />
                  <p>
                    <span className="font-semibold text-navy">Skills: </span>
                    {(app.skills || []).join(", ") || "—"}
                  </p>
                  <Block title="Experience" data={app.experience} />
                  <Block title="Goals" data={app.goals} />
                  <Block title="Training preferences" data={app.trainingPreferences} />
                  <Block title="Documents" data={app.documents} />
                  <p>
                    <span className="font-semibold text-navy">Heard about us: </span>
                    {app.source || "—"}
                  </p>
                  <p className="text-muted">Mode applied: {mode}</p>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
      ) : null}

      {view === "table" && open ? (
        <ApplicantRecord
          app={apps.find((item) => item.applicationNumber === open)}
          saving={saving}
          downloading={downloading}
          onClose={() => setOpen("")}
          onApprove={(applicationNumber) => decide(applicationNumber, "Accepted")}
          onReject={(applicationNumber) => decide(applicationNumber, "Rejected")}
          onSetState={setState}
          onAskDelete={setConfirmDelete}
          onDownload={(applicationNumber) => download("excel", applicationNumber)}
        />
      ) : null}

      <ConfirmDeleteDialog
        open={Boolean(confirmDelete)}
        message="Delete this applicant record? This cannot be undone."
        busy={Boolean(deleting)}
        onCancel={() => setConfirmDelete("")}
        onConfirm={() => remove(confirmDelete)}
      />
    </section>
  );
}

function applicantAreaSlug(app, catalog = []) {
  const slug = app.program?.categorySlug;
  if (slug && catalog.some((item) => item.slug === slug)) return slug;
  const title = String(app.program?.category || "").trim().toLowerCase();
  const match = catalog.find((item) => item.title.toLowerCase() === title);
  if (match) return match.slug;
  const programTitle = String(app.program?.program || "").trim().toLowerCase();
  const byProgram = catalog.find((item) =>
    item.programs?.some((program) => String(program.title).toLowerCase() === programTitle)
  );
  return byProgram?.slug || "other";
}

function applicantProgramSlug(app, catalog = []) {
  const slug = app.program?.programSlug;
  if (slug && catalog.some((item) => item.programs?.some((program) => program.slug === slug))) {
    return slug;
  }
  const title = String(app.program?.program || app.program?.title || "")
    .trim()
    .toLowerCase();
  if (!title) return "";
  for (const category of catalog) {
    const exact = category.programs?.find((program) => String(program.title).toLowerCase() === title);
    if (exact) return exact.slug;
  }
  for (const category of catalog) {
    const partial = category.programs?.find((program) => title.includes(String(program.title).toLowerCase()));
    if (partial) return partial.slug;
  }
  return "";
}

function flattenApplicant(app) {
  const row = {
    "Application Number": app.applicationNumber || "",
    Status: app.status || "Submitted",
    State: app.state || "Open",
    "Submitted At": app.submittedAt ? new Date(app.submittedAt).toLocaleString() : "",
  };

  const sections = [
    ["Personal", app.personalInformation],
    ["Contact", app.contactInformation],
    ["Guardian", app.guardianInformation],
    ["Education", app.education],
    ["Program", app.program],
    ["Technology", app.technologyBackground],
    ["Experience", app.experience],
    ["Goals", app.goals],
    ["Training Preferences", app.trainingPreferences],
    ["Documents", app.documents],
  ];

  for (const [label, data] of sections) {
    if (!data || typeof data !== "object") continue;
    for (const [key, value] of Object.entries(data)) {
      row[`${label} - ${key}`] = Array.isArray(value) ? value.join(", ") : value ?? "";
    }
  }

  row.Skills = Array.isArray(app.skills) ? app.skills.join(", ") : "";
  row["Heard About Us"] = app.source || "";

  return row;
}

function ApplicantsTable({ apps, selected, downloading, onView, onDownload, onAskDelete }) {
  const { columns, rows } = useMemo(() => {
    const flatRows = apps.map(flattenApplicant);
    const seen = new Set();
    const cols = [];
    for (const row of flatRows) {
      for (const key of Object.keys(row)) {
        if (!seen.has(key)) {
          seen.add(key);
          cols.push(key);
        }
      }
    }
    return { columns: cols, rows: flatRows };
  }, [apps]);

  return (
    <div className="overflow-auto rounded-2xl border border-navy/15 bg-white" style={{ maxHeight: "70vh" }}>
      <table className="min-w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="sticky top-0 left-0 z-20 whitespace-nowrap border border-navy/10 bg-navy px-3 py-2 text-left font-semibold text-white">
              Actions
            </th>
            {columns.map((col) => (
              <th
                key={col}
                className="sticky top-0 z-10 whitespace-nowrap border border-navy/10 bg-navy px-3 py-2 text-left font-semibold text-white"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const id = row["Application Number"];
            const isSelected = selected === id;
            return (
              <tr
                key={id || index}
                className={isSelected ? "bg-gold/10" : index % 2 ? "bg-soft/40" : "bg-white"}
              >
                <td className="sticky left-0 z-10 whitespace-nowrap border border-navy/10 bg-inherit px-3 py-1.5">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-full bg-navy px-3 py-1 text-xs font-semibold text-white"
                      onClick={() => onView(id)}
                    >
                      {isSelected ? "Viewing" : "View"}
                    </button>
                    <button
                      type="button"
                      disabled={downloading === id}
                      className="rounded-full border border-navy/15 px-3 py-1 text-xs font-semibold text-navy disabled:opacity-50"
                      onClick={() => onDownload(id)}
                    >
                      {downloading === id ? "Saving…" : "Excel"}
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700"
                      onClick={() => onAskDelete(id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
                {columns.map((col) => (
                  <td
                    key={col}
                    className="cursor-pointer whitespace-nowrap border border-navy/10 px-3 py-1.5 text-navy/90"
                    onClick={() => onView(id)}
                  >
                    {row[col] === "" || row[col] === undefined || row[col] === null ? "—" : String(row[col])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ApplicantRecord({
  app,
  saving,
  downloading,
  onClose,
  onApprove,
  onReject,
  onSetState,
  onAskDelete,
  onDownload,
}) {
  if (!app) return null;
  const name = app.personalInformation?.fullName || "Unnamed applicant";
  const status = app.status || "Submitted";
  const isClosed = app.state === "Closed";
  const isBusy = saving === app.applicationNumber;
  return (
    <article className="mt-6 rounded-2xl border border-navy/10 bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">Applicant record</p>
          <h2 className="font-heading mt-1 text-2xl font-bold text-navy">{name}</h2>
          <p className="mt-1 text-sm text-muted">
            {app.applicationNumber} · {app.program?.program || "—"} · {app.program?.mode || "—"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={downloading === app.applicationNumber}
            className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            onClick={() => onDownload(app.applicationNumber)}
          >
            {downloading === app.applicationNumber ? "Preparing…" : "Download this Excel"}
          </button>
          {status !== "Accepted" ? (
            <button
              type="button"
              disabled={isBusy}
              className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              onClick={() => onApprove(app.applicationNumber)}
            >
              Approve
            </button>
          ) : null}
          {status !== "Rejected" ? (
            <button
              type="button"
              disabled={isBusy}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              onClick={() => onReject(app.applicationNumber)}
            >
              Reject
            </button>
          ) : null}
          {isClosed ? (
            <button
              type="button"
              disabled={isBusy}
              className="rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold text-navy disabled:opacity-50"
              onClick={() => onSetState(app.applicationNumber, "Open")}
            >
              Reopen
            </button>
          ) : (
            <button
              type="button"
              disabled={isBusy}
              className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              onClick={() => onSetState(app.applicationNumber, "Closed")}
            >
              Close
            </button>
          )}
          <button
            type="button"
            className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700"
            onClick={() => onAskDelete(app.applicationNumber)}
          >
            Delete
          </button>
          <button
            type="button"
            className="rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold text-navy"
            onClick={onClose}
          >
            Close view
          </button>
        </div>
      </div>
      <div className="mt-6 space-y-4 text-sm">
        <Block title="Personal" data={app.personalInformation} />
        <Block title="Contact" data={app.contactInformation} />
        <Block title="Guardian" data={app.guardianInformation} />
        <Block title="Education" data={app.education} />
        <Block title="Program" data={app.program} />
        <Block title="Technology" data={app.technologyBackground} />
        <p>
          <span className="font-semibold text-navy">Skills: </span>
          {(app.skills || []).join(", ") || "—"}
        </p>
        <Block title="Experience" data={app.experience} />
        <Block title="Goals" data={app.goals} />
        <Block title="Training preferences" data={app.trainingPreferences} />
        <Block title="Documents" data={app.documents} />
        <p>
          <span className="font-semibold text-navy">Heard about us: </span>
          {app.source || "—"}
        </p>
      </div>
    </article>
  );
}

function MiniStat({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-4">
      <span className={`inline-block h-2 w-8 rounded-full ${accent}`} />
      <p className="mt-2 text-2xl font-bold text-navy">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Accepted: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
  };
  const label = status === "Accepted" ? "Approved" : status === "Rejected" ? "Rejected" : "Pending";
  const style = styles[status] || "bg-soft text-navy/70";
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>{label}</span>;
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold ${
        active ? "bg-navy text-white" : "border border-navy/15 text-navy"
      }`}
    >
      {children}
    </button>
  );
}

function Block({ title, data }) {
  const entries = Object.entries(data || {}).filter(([, value]) => {
    if (Array.isArray(value)) return value.length;
    return value !== "" && value !== undefined && value !== null;
  });
  if (!entries.length) return null;
  return (
    <div>
      <h2 className="font-heading font-bold text-navy">{title}</h2>
      <dl className="mt-2 grid gap-1 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <div key={key}>
            <dt className="text-xs uppercase tracking-wide text-muted">{key}</dt>
            <dd className="text-navy">{Array.isArray(value) ? value.join(", ") : String(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
