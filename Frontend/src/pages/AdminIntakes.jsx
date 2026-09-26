import { useEffect, useMemo, useState } from "react";
import ConfirmDeleteDialog from "../components/ui/ConfirmDeleteDialog";
import PageLoader from "../components/ui/PageLoader";
import { useCatalog } from "../hooks/useContent";
import {
  createIntakeOffer,
  deleteIntakeOffer,
  fetchAdminIntakes,
  updateIntakeOffer,
  updateIntakeSettings,
} from "../services/api";

const emptyMode = {
  label: "",
  startDate: "",
  duration: "",
  schedule: "",
  fee: "Ksh 21,000",
  monthlyFee: "Ksh 3,500",
};

function OfferForm({ offer, onSave, onDelete, busy }) {
  const [form, setForm] = useState(offer);

  useEffect(() => {
    setForm(offer);
  }, [offer]);

  function set(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <form
      className="rounded-[22px] border border-gold bg-[#fffaf3] p-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}
    >
      <label className="block text-sm">
        <span className="font-semibold text-navy">Learning mode name</span>
        <input className="mt-1 w-full rounded-md border border-navy/15 px-3 py-2" value={form.label} onChange={(e) => set("label", e.target.value)} />
      </label>
      <label className="mt-3 block text-sm">
        <span className="font-semibold text-navy">Start Date</span>
        <input className="mt-1 w-full rounded-md border border-navy/15 px-3 py-2" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} placeholder="November 2nd, 2026" />
      </label>
      <label className="mt-3 block text-sm">
        <span className="font-semibold text-navy">Course Duration</span>
        <input className="mt-1 w-full rounded-md border border-navy/15 px-3 py-2" value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="27 Weeks" />
      </label>
      <label className="mt-3 block text-sm">
        <span className="font-semibold text-navy">Mode of Learning</span>
        <input
          className="mt-1 w-full rounded-md border border-navy/15 px-3 py-2"
          value={form.schedule}
          onChange={(e) => set("schedule", e.target.value)}
          placeholder="Online & Physical Classes | Mon - Fri | 8 am - 5 pm E.A.T"
        />
      </label>
      <label className="mt-3 block text-sm">
        <span className="font-semibold text-navy">Tuition Fee (total)</span>
        <input className="mt-1 w-full rounded-md border border-navy/15 px-3 py-2" value={form.fee} onChange={(e) => set("fee", e.target.value)} placeholder="Ksh 21,000" />
      </label>
      <label className="mt-3 block text-sm">
        <span className="font-semibold text-navy">Monthly installment</span>
        <input className="mt-1 w-full rounded-md border border-navy/15 px-3 py-2" value={form.monthlyFee || "Ksh 3,500"} onChange={(e) => set("monthlyFee", e.target.value)} placeholder="Ksh 3,500" />
      </label>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          Save this mode
        </button>
        {offer.brochureUrl ? (
          <a href={offer.brochureUrl} target="_blank" rel="noreferrer" className="rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold text-navy">
            Preview brochure
          </a>
        ) : null}
        {offer.installmentsUrl ? (
          <a href={offer.installmentsUrl} target="_blank" rel="noreferrer" className="rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold text-navy">
            Preview payment plan
          </a>
        ) : null}
        <button type="button" onClick={() => onDelete(offer)} className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700">
          Delete
        </button>
      </div>
    </form>
  );
}

export default function AdminIntakes() {
  const catalog = useCatalog();
  const [year, setYear] = useState(2026);
  const [heading, setHeading] = useState("Intakes in progress");
  const [offers, setOffers] = useState([]);
  const [categorySlug, setCategorySlug] = useState("");
  const [programSlug, setProgramSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [pending, setPending] = useState(null);
  const [creating, setCreating] = useState(emptyMode);

  const selectedCategory = useMemo(
    () => catalog.find((item) => item.slug === categorySlug) || catalog[0],
    [catalog, categorySlug]
  );
  const categoryPrograms = selectedCategory?.programs || [];
  const selectedProgram = categoryPrograms.find((item) => item.slug === programSlug) || categoryPrograms[0];
  const visibleOffers = offers.filter(
    (item) =>
      item.programSlug === selectedProgram?.slug &&
      (!item.categorySlug || !selectedCategory || item.categorySlug === selectedCategory.slug)
  );

  useEffect(() => {
    fetchAdminIntakes()
      .then((data) => {
        setYear(data.year || 2026);
        setHeading(data.heading || "Intakes in progress");
        setOffers(data.offers || []);
        const first = data.offers?.[0];
        if (first?.categorySlug) setCategorySlug(first.categorySlug);
        if (first?.programSlug) setProgramSlug(first.programSlug);
      })
      .catch(() => setError("Could not load intake offers."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!categorySlug && catalog[0]) setCategorySlug(catalog[0].slug);
  }, [catalog, categorySlug]);

  useEffect(() => {
    if (!selectedCategory) return;
    const stillInCategory = selectedCategory.programs.some((item) => item.slug === programSlug);
    if (!stillInCategory) setProgramSlug(selectedCategory.programs[0]?.slug || "");
  }, [selectedCategory, programSlug]);

  async function saveYear(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved("");
    try {
      const data = await updateIntakeSettings({ year: Number(year), heading });
      setYear(data.year);
      setHeading(data.heading);
      setSaved("Intake year saved. Course pages now show this year.");
    } catch (err) {
      setError(err.message || "Could not save the intake year.");
    } finally {
      setBusy(false);
    }
  }

  async function saveOffer(form) {
    setBusy(true);
    setError("");
    setSaved("");
    try {
      const updated = await updateIntakeOffer(form.id, form);
      setOffers((current) => current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      setSaved(`Saved ${updated.label}.`);
    } catch (err) {
      setError(err.message || "Could not save this learning mode.");
    } finally {
      setBusy(false);
    }
  }

  async function addMode(event) {
    event.preventDefault();
    if (!selectedProgram || !selectedCategory) return;
    setBusy(true);
    setError("");
    setSaved("");
    try {
      const created = await createIntakeOffer({
        ...creating,
        categorySlug: selectedCategory.slug,
        programSlug: selectedProgram.slug,
        modeId: `custom-${Date.now()}`,
      });
      setOffers((current) => [...current, created]);
      setCreating(emptyMode);
      setSaved("Learning mode added. It now appears on the course page.");
    } catch (err) {
      setError(err.message || "Could not add this learning mode.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!pending) return;
    setBusy(true);
    setError("");
    try {
      await deleteIntakeOffer(pending.id);
      setOffers((current) => current.filter((item) => item.id !== pending.id));
      setPending(null);
    } catch (err) {
      setError(err.message || "Could not delete this learning mode.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="relative mx-auto max-w-6xl">
      {loading ? <PageLoader overlay label="Loading intakes..." /> : null}
      <p className="text-sm font-semibold text-gold">Staff only</p>
      <h1 className="font-heading mt-1 text-3xl font-bold text-navy">Course intakes</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
        Choose a program area first, then a course in that area, the same flow as the application form. Update start
        dates, duration, learning mode, and tuition. Download Here / installment PDFs use the HIACDI logo with that
        course&apos;s own content.
      </p>
      {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
      {saved ? <p className="mt-4 text-sm font-semibold text-green-700">{saved}</p> : null}

      <form onSubmit={saveYear} className="mt-8 grid gap-4 rounded-2xl border border-navy/10 bg-white p-5 sm:grid-cols-[160px_1fr_auto] sm:items-end">
        <label className="text-sm">
          <span className="font-semibold text-navy">Intake year</span>
          <input
            type="number"
            min="2024"
            max="2100"
            className="mt-1 w-full rounded-md border border-navy/15 px-3 py-2"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="font-semibold text-navy">Heading on course pages</span>
          <input className="mt-1 w-full rounded-md border border-navy/15 px-3 py-2" value={heading} onChange={(e) => setHeading(e.target.value)} />
        </label>
        <button type="submit" disabled={busy} className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          Save year
        </button>
      </form>
      <p className="mt-2 text-sm text-muted">
        Public heading: <span className="font-semibold text-gold">{year} {heading}</span>
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-semibold text-navy">Program area</span>
          <select
            className="mt-1 w-full rounded-md border border-navy/15 px-3 py-2"
            value={selectedCategory?.slug || ""}
            onChange={(e) => {
              setCategorySlug(e.target.value);
              setProgramSlug("");
            }}
          >
            {catalog.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-navy">Preferred course</span>
          <select
            className="mt-1 w-full rounded-md border border-navy/15 px-3 py-2"
            value={selectedProgram?.slug || ""}
            onChange={(e) => setProgramSlug(e.target.value)}
          >
            {categoryPrograms.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {visibleOffers.map((offer) => (
          <OfferForm key={offer.id} offer={offer} onSave={saveOffer} onDelete={setPending} busy={busy} />
        ))}
      </div>

      <form onSubmit={addMode} className="mt-8 rounded-2xl border border-dashed border-navy/20 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-navy">Add a learning mode</h2>
        <p className="mt-1 text-sm text-muted">
          Creates another intake card on {selectedProgram?.title || "this course"}, for example a new part-time option.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input className="rounded-md border border-navy/15 px-3 py-2 text-sm" placeholder="Full-time Hybrid" value={creating.label} onChange={(e) => setCreating((c) => ({ ...c, label: e.target.value }))} required />
          <input className="rounded-md border border-navy/15 px-3 py-2 text-sm" placeholder="Start date" value={creating.startDate} onChange={(e) => setCreating((c) => ({ ...c, startDate: e.target.value }))} />
          <input className="rounded-md border border-navy/15 px-3 py-2 text-sm" placeholder="Course duration" value={creating.duration} onChange={(e) => setCreating((c) => ({ ...c, duration: e.target.value }))} />
          <input className="rounded-md border border-navy/15 px-3 py-2 text-sm" placeholder="Mode of learning" value={creating.schedule} onChange={(e) => setCreating((c) => ({ ...c, schedule: e.target.value }))} />
          <input className="rounded-md border border-navy/15 px-3 py-2 text-sm" placeholder="Tuition fee (total)" value={creating.fee} onChange={(e) => setCreating((c) => ({ ...c, fee: e.target.value }))} />
          <input className="rounded-md border border-navy/15 px-3 py-2 text-sm" placeholder="Monthly installment" value={creating.monthlyFee} onChange={(e) => setCreating((c) => ({ ...c, monthlyFee: e.target.value }))} />
        </div>
        <button type="submit" disabled={busy} className="mt-4 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          Add mode
        </button>
      </form>

      <ConfirmDeleteDialog
        open={Boolean(pending)}
        message="Remove this learning mode from the course page? This cannot be undone."
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
