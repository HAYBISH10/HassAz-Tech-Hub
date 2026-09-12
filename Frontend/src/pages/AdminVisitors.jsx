import { useEffect, useState } from "react";
import ConfirmDeleteDialog from "../components/ui/ConfirmDeleteDialog";
import PageLoader from "../components/ui/PageLoader";
import { deleteVisitor, fetchSignups, fetchVisitors } from "../services/api";

function formatWhen(value) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function AdminVisitors() {
  const [visitors, setVisitors] = useState([]);
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([fetchVisitors(), fetchSignups()])
      .then(([visitData, signupData]) => {
        setVisitors(visitData.visitors || []);
        setSignups(signupData.users || []);
      })
      .catch(() => setError("Could not load visitors and sign-ups."))
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
      {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}

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
                  <td className="px-4 py-3 font-semibold text-navy">{item.visitorNo || "—"}</td>
                  <td className="px-4 py-3 text-navy">{formatWhen(item.lastSeen)}</td>
                  <td className="px-4 py-3 text-navy">{item.pageViews || 1}</td>
                  <td className="px-4 py-3 text-muted">{item.lastPath || "/"}</td>
                  <td className="px-4 py-3 text-muted">{item.ip || "—"}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-xs text-muted" title={item.userAgent}>
                    {item.userAgent || "—"}
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

      <div>
        <h2 className="font-heading text-2xl font-bold text-navy">Signed-up users</h2>
        <p className="mt-2 text-sm text-muted">
          First person to create an account is No 1, the next is No 2, and so on. {signups.length} sign-up
          {signups.length === 1 ? "" : "s"}.
        </p>
        <div className="relative mt-4 overflow-auto rounded-2xl border border-navy/10 bg-white">
          {!loading && !signups.length ? (
            <p className="p-5 text-sm text-muted">No learner accounts yet.</p>
          ) : null}
          {signups.length ? (
            <table className="min-w-full text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">No</th>
                  <th className="px-4 py-3 text-left font-semibold">Full name</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold">Signed up</th>
                </tr>
              </thead>
              <tbody>
                {signups.map((user) => (
                  <tr key={user.id || user.no} className="border-t border-navy/10">
                    <td className="px-4 py-3 font-semibold text-navy">{user.no}</td>
                    <td className="px-4 py-3 text-navy">{user.fullName || "—"}</td>
                    <td className="px-4 py-3 text-muted">{user.email || "—"}</td>
                    <td className="px-4 py-3 text-muted">{user.phone || "—"}</td>
                    <td className="px-4 py-3 text-navy">{formatWhen(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
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
