import { useEffect, useState } from "react";
import ConfirmDeleteDialog from "../components/ui/ConfirmDeleteDialog";
import PageLoader from "../components/ui/PageLoader";
import { deleteContactMessage, fetchContactMessages, updateContactStatus } from "../services/api";

export default function AdminContacts() {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    fetchContactMessages()
      .then((data) => {
        setMessages(data.messages || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => setError("Could not load contact messages."))
      .finally(() => setLoading(false));
  }, []);

  async function setStatus(id, status) {
    setSaving(id);
    setError("");
    try {
      const updated = await updateContactStatus(id, status);
      setMessages((current) => {
        const next = current.map((item) => (item.id === id ? { ...item, ...updated } : item));
        setUnreadCount(next.filter((item) => item.status === "unread").length);
        return next;
      });
    } catch (err) {
      setError(err.message || "Could not update this message.");
    } finally {
      setSaving("");
    }
  }

  async function remove() {
    if (!pendingDelete) return;
    setSaving(pendingDelete);
    setError("");
    try {
      await deleteContactMessage(pendingDelete);
      setMessages((current) => {
        const next = current.filter((item) => item.id !== pendingDelete);
        setUnreadCount(next.filter((item) => item.status === "unread").length);
        return next;
      });
      setPendingDelete(null);
    } catch (err) {
      setError(err.message || "Could not delete this message.");
    } finally {
      setSaving("");
    }
  }

  return (
    <section className="mx-auto max-w-5xl">
      <p className="text-sm font-semibold text-gold">Staff only</p>
      <h1 className="font-heading mt-1 text-3xl font-bold text-navy">Contact messages</h1>
      <p className="mt-2 text-sm text-muted">
        Messages submitted through Contact Us. Approve, reject, or delete a student enquiry. {unreadCount} unread.
      </p>
      {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}

      <div className="relative mt-8 min-h-16 space-y-3">
        {loading ? <PageLoader overlay label="Loading messages..." /> : null}
        {!loading && !messages.length ? <p className="text-sm text-muted">No contact messages yet.</p> : null}
        {messages.map((item) => (
          <article key={item.id} className="rounded-2xl border border-navy/10 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-heading text-lg font-bold text-navy">{item.fullName}</p>
                <p className="text-sm text-muted">
                  {item.email} {item.phone ? `· ${item.phone}` : ""}
                </p>
                <p className="mt-1 text-sm font-semibold text-navy">{item.subject || "No subject"}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={item.status} />
                <span className="text-xs text-muted">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</span>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-navy/80">{item.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.status !== "approved" ? (
                <button
                  type="button"
                  disabled={saving === item.id}
                  onClick={() => setStatus(item.id, "approved")}
                  className="rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                >
                  Approve
                </button>
              ) : null}
              {item.status !== "rejected" ? (
                <button
                  type="button"
                  disabled={saving === item.id}
                  onClick={() => setStatus(item.id, "rejected")}
                  className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                >
                  Reject
                </button>
              ) : null}
              <button
                type="button"
                disabled={saving === item.id}
                onClick={() => setPendingDelete(item.id)}
                className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-40"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <ConfirmDeleteDialog
        open={Boolean(pendingDelete)}
        message="Delete this contact message? This cannot be undone."
        busy={Boolean(saving) && saving === pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={remove}
      />
    </section>
  );
}

function StatusPill({ status }) {
  const styles = {
    unread: "bg-gold/20 text-gold-dark",
    read: "bg-navy/10 text-navy",
    resolved: "bg-green-100 text-green-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  const label = status === "unread" ? "New" : status;
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status] || styles.read}`}>{label}</span>;
}