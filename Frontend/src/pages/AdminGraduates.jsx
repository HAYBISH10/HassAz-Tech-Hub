import { useEffect, useMemo, useState } from "react";
import ConfirmDeleteDialog from "../components/ui/ConfirmDeleteDialog";
import PageLoader from "../components/ui/PageLoader";
import { graduateMatchesCourse, certificateWording } from "../data/certificateCopy";
import { useCatalog } from "../hooks/useContent";
import { createGraduate, deleteGraduate, fetchGraduates } from "../services/api";

const inputClass =
  "w-full rounded-md border border-navy/15 px-4 py-3 text-ink outline-none focus:border-gold";

export default function AdminGraduates() {
  const catalog = useCatalog();
  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState("");
  const [deleting, setDeleting] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [programSlug, setProgramSlug] = useState("");
  const [filterAreaSlug, setFilterAreaSlug] = useState("");
  const [filterProgramSlug, setFilterProgramSlug] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    program: "",
    details: "",
  });

  const selectedCategory = catalog.find((item) => item.slug === categorySlug) || catalog[0];
  const categoryPrograms = selectedCategory?.programs || [];
  const selectedProgram = categoryPrograms.find((item) => item.slug === programSlug) || null;
  const filterCategory = catalog.find((item) => item.slug === filterAreaSlug) || null;
  const filterPrograms = filterCategory?.programs || [];
  const filterProgram = filterPrograms.find((item) => item.slug === filterProgramSlug) || null;

  useEffect(() => {
    fetchGraduates()
      .then(setList)
      .catch(() => setError("Could not load graduates. Start the backend in WSL, then refresh."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!categorySlug && catalog[0]) setCategorySlug(catalog[0].slug);
  }, [catalog, categorySlug]);

  useEffect(() => {
    if (!selectedCategory) return;
    const stillThere = selectedCategory.programs.some((item) => item.slug === programSlug);
    if (!stillThere) setProgramSlug("");
  }, [selectedCategory, programSlug]);

  useEffect(() => {
    if (!filterCategory) {
      setFilterProgramSlug("");
      return;
    }
    const stillThere = filterCategory.programs.some((item) => item.slug === filterProgramSlug);
    if (!stillThere) setFilterProgramSlug("");
  }, [filterCategory, filterProgramSlug]);

  useEffect(() => {
    if (!selectedProgram || !selectedCategory) return;
    const wording = certificateWording(selectedProgram, selectedCategory.title);
    setForm((current) => ({
      ...current,
      program: wording.program,
      details: wording.details,
    }));
  }, [selectedProgram, selectedCategory]);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const created = await createGraduate({
        ...form,
        categorySlug: selectedCategory?.slug || "",
        programSlug: selectedProgram?.slug || "",
      });
      setList((current) => [created, ...current]);
      setFilterAreaSlug(selectedCategory?.slug || "");
      setFilterProgramSlug(selectedProgram?.slug || "");
      setForm((current) => ({ ...current, fullName: "", email: "" }));
    } catch (err) {
      setError(err.message || "Could not register this graduate.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(certId) {
    setDeleting(certId);
    setError("");
    try {
      await deleteGraduate(certId);
      setList((current) => current.filter((item) => item.certificateId !== certId));
      setConfirmDelete("");
    } catch (err) {
      setError(err.message || "Could not delete this certificate record.");
    } finally {
      setDeleting("");
    }
  }

  const visibleList = useMemo(
    () =>
      list.filter((item) =>
        graduateMatchesCourse(item, filterAreaSlug, filterProgramSlug, catalog)
      ),
    [list, filterAreaSlug, filterProgramSlug, catalog]
  );

  return (
    <section className="mx-auto max-w-7xl">
      <p className="text-sm font-semibold text-gold">Staff only</p>
      <h1 className="font-heading mt-1 text-3xl font-bold text-navy">Awarded certificates</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Choose a program area to see only those verified students. Then choose a course, for example Data
        Science Bootcamp, to see only that course. The same applies to Software Engineering and every other path.
      </p>

      <form onSubmit={onSubmit} className="relative mt-8 grid gap-4 rounded-2xl border border-navy/10 bg-white p-5 sm:p-7">
        {saving ? <PageLoader overlay label="Saving..." /> : null}
        <h2 className="font-heading text-xl font-bold text-navy">Register an awarded student</h2>
        <label>
          <span className="mb-1 block text-sm font-semibold text-navy">Full name</span>
          <input className={inputClass} value={form.fullName} onChange={(e) => setField("fullName", e.target.value)} required />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold text-navy">Email address</span>
          <input type="email" className={inputClass} value={form.email} onChange={(e) => setField("email", e.target.value)} required />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm font-semibold text-navy">Program area</span>
            <select
              className={inputClass}
              value={selectedCategory?.slug || ""}
              onChange={(e) => {
                setCategorySlug(e.target.value);
                setProgramSlug("");
              }}
              required
            >
              {catalog.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold text-navy">Preferred course</span>
            <select
              className={inputClass}
              value={programSlug}
              onChange={(e) => setProgramSlug(e.target.value)}
              required
            >
              <option value="">Select a course</option>
              {categoryPrograms.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          <span className="mb-1 block text-sm font-semibold text-navy">Program on the certificate</span>
          <input className={inputClass} value={form.program} onChange={(e) => setField("program", e.target.value)} required />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold text-navy">Certificate details</span>
          <textarea
            className={`${inputClass} min-h-28`}
            value={form.details}
            onChange={(e) => setField("details", e.target.value)}
            required
          />
        </label>
        <button
          type="submit"
          disabled={saving || !programSlug}
          className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save awarded student"}
        </button>
        {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
      </form>

      <div className="relative mt-10 min-h-16 space-y-8">
        {loading ? <PageLoader overlay label="Loading graduates..." /> : null}
        <div>
          <h2 className="font-heading text-xl font-bold text-navy">Verified students</h2>
          <p className="mt-1 text-sm text-muted">
            Choose a program area to see only those awarded students. Then choose a course, for example Data
            Science Bootcamp, to narrow the list further.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <TabButton
            active={!filterAreaSlug}
            onClick={() => {
              setFilterAreaSlug("");
              setFilterProgramSlug("");
            }}
          >
            All areas ({list.length})
          </TabButton>
          {catalog.map((category) => {
            const count = list.filter((item) =>
              graduateMatchesCourse(item, category.slug, "", catalog)
            ).length;
            return (
              <TabButton
                key={category.slug}
                active={filterAreaSlug === category.slug}
                onClick={() => {
                  setFilterAreaSlug(category.slug);
                  setFilterProgramSlug("");
                }}
              >
                {category.title} ({count})
              </TabButton>
            );
          })}
        </div>
        {filterCategory ? (
          <div className="flex flex-wrap gap-2">
            <TabButton active={!filterProgramSlug} onClick={() => setFilterProgramSlug("")}>
              All {filterCategory.title} courses (
              {list.filter((item) => graduateMatchesCourse(item, filterCategory.slug, "", catalog)).length})
            </TabButton>
            {filterPrograms.map((program) => {
              const count = list.filter((item) =>
                graduateMatchesCourse(item, filterCategory.slug, program.slug, catalog)
              ).length;
              return (
                <TabButton
                  key={program.slug}
                  active={filterProgramSlug === program.slug}
                  onClick={() => setFilterProgramSlug(program.slug)}
                >
                  {program.title} ({count})
                </TabButton>
              );
            })}
          </div>
        ) : null}
        <h3 className="font-heading text-lg font-bold text-navy">
          {filterProgramSlug
            ? filterProgram?.title
            : filterAreaSlug
              ? filterCategory?.title
              : "All program areas"}{" "}
          verified students
        </h3>
        <p className="text-sm text-muted">
          {visibleList.length} student{visibleList.length === 1 ? "" : "s"} in this list.
        </p>
        {!loading && !visibleList.length ? (
          <p className="text-sm text-muted">
            No verified students for this {filterProgramSlug ? "course" : filterAreaSlug ? "program area" : "register"} yet. Register an awarded
            student above.
          </p>
        ) : null}
        {visibleList.length ? (
          <div className="overflow-auto rounded-2xl border border-navy/10 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="px-3 py-2 font-semibold">No</th>
                  <th className="px-3 py-2 font-semibold">Name</th>
                  <th className="px-3 py-2 font-semibold">Email</th>
                  <th className="px-3 py-2 font-semibold">Program</th>
                  <th className="px-3 py-2 font-semibold">Certificate ID</th>
                  <th className="px-3 py-2 font-semibold">QR</th>
                  <th className="px-3 py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleList.map((item, index) => (
                  <GraduateRow
                    key={item.certificateId}
                    item={item}
                    index={index}
                    onAskDelete={() => setConfirmDelete(item.certificateId)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <ConfirmDeleteDialog
        open={Boolean(confirmDelete)}
        message="Delete this certificate record? This student will no longer be able to verify that certificate."
        busy={Boolean(deleting)}
        onCancel={() => setConfirmDelete("")}
        onConfirm={() => remove(confirmDelete)}
      />
    </section>
  );
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

function GraduateRow({ item, index, onAskDelete }) {
  const verifyUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/verify/${encodeURIComponent(item.certificateId)}`;
  }, [item.certificateId]);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verifyUrl)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(verifyUrl);
    } catch {
      window.prompt("Copy this certificate link", verifyUrl);
    }
  }

  return (
    <tr className="border-t border-navy/10 align-top">
      <td className="px-3 py-2 font-semibold text-navy">{index + 1}</td>
      <td className="px-3 py-2 font-semibold text-navy">{item.fullName}</td>
      <td className="px-3 py-2 text-muted">{item.email || "-"}</td>
      <td className="px-3 py-2 text-navy">{item.program || "-"}</td>
      <td className="px-3 py-2 text-xs font-semibold text-gold">{item.certificateId}</td>
      <td className="px-3 py-2">
        <img src={qrSrc} alt="" className="h-16 w-16 rounded-md border border-navy/10 bg-white p-1" />
      </td>
      <td className="px-3 py-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyLink}
            className="rounded-full bg-navy px-3 py-1 text-xs font-semibold text-white"
          >
            Copy link
          </button>
          <a
            href={verifyUrl}
            className="rounded-full border border-navy/15 px-3 py-1 text-xs font-semibold text-navy"
          >
            Open
          </a>
          <button
            type="button"
            className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700"
            onClick={onAskDelete}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
