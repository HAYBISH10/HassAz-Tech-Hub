import { useEffect, useState } from "react";
import ConfirmDeleteDialog from "../components/ui/ConfirmDeleteDialog";
import PageLoader from "../components/ui/PageLoader";
import { deleteVisitor, fetchVisitors } from "../services/api";

function formatWhen(value) {
  return value ? new Date(value).toLocaleString() : "-";
}

export default function AdminVisitors() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchVisitors()
      .then((visitData) => {
        setVisitors(visitData.visitors || []);
      })
      .catch(() => setError("Could not load visitors."))
      .finally(() => setLoading(false));
  }, []);

  async function confirmRemove() {
    if (!pending) return;
    setBusy(true);
    setError("");
    try {
      await deleteVisitor(pending.id);
      setVisitors((current) => current.filter((item) => item.id !== pending.id));
      setPending(null);
    } catch (err) {
      setError(err.message || "Could not delete this visitor.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl space-y-10">
      <div>
        <p className="text-sm font-semibold text-gold">Staff only</p>
        <h1 className="font-heading mt-1 text-3xl font-bold text-navy">Website visitors</h1>
        <p className="mt-2 text-sm text-muted">
          Each person appears once. Repeat visits from the same person keep the same number. {visitors.length} unique
          visitor{visitors.length === 1 ? "" : "s"}.
        </p>
      </div>
      {error ? <p className="mt-0 text-sm font-semibold text-red-700">{error}</p> : null}

      <div className="relative overflow-auto rounded-2xl border border-navy/10 bg-white">
        {loading ? <PageLoader overlay label="Loading visitors..." /> : null}
        {!loading && !visitors.length ? <p className="p-5 text-sm text-muted">No visits recorded yet.</p> : null}
        {visitors.length ? (
          <table className="min-w-full text-sm">
            <thead className="bg-navy text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">No</th>
                <th className="px-4 py-3 text-left font-semibold">Last visit</th>
                <th className="px-4 py-3 text-left font-semibold">Pages</th>
                <th className="px-4 py-3 text-left font-semibold">Last page</th>
                <th className="px-4 py-3 text-left font-semibold">IP address</th>
                <th className="px-4 py-3 text-left font-semibold">Browser</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((item) => (
                <tr key={item.id} className="border-t border-navy/10">
                  <td className="px-4 py-3 font-semibold text-navy">{item.visitorNo || "-"}</td>
                  <td className="px-4 py-3 text-navy">{formatWhen(item.lastSeen)}</td>
                  <td className="px-4 py-3 text-navy">{item.pageViews || 1}</td>
                  <td className="px-4 py-3 text-muted">{item.lastPath || "/"}</td>
                  <td className="px-4 py-3 text-muted">{item.ip || "-"}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-xs text-muted" title={item.userAgent}>
                    {item.userAgent || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setPending(item)}
                      className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>

      <ConfirmDeleteDialog
        open={Boolean(pending)}
        message="Delete this visitor record from the admin list? This cannot be undone."
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={confirmRemove}
      />
    </section>
  );
}
