import { useEffect, useState } from "react";
import ConfirmDeleteDialog from "../components/ui/ConfirmDeleteDialog";
import PageLoader from "../components/ui/PageLoader";
import { deleteBooking, fetchBookings, updateBookingStatus } from "../services/api";

export default function AdminCalls() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [confirmDelete, setConfirmDelete] = useState("");
  const [deleting, setDeleting] = useState("");

  useEffect(() => {
    fetchBookings()
      .then(setBookings)
      .catch(() => setError("Could not load booked calls. Start the backend in WSL, then refresh."))
      .finally(() => setLoading(false));
  }, []);

  async function decide(id, status) {
    setSaving(id);
    setError("");
    try {
      const updated = await updateBookingStatus(id, status);
      setBookings((current) => current.map((item) => (bookingKey(item) === id ? { ...item, ...updated } : item)));
    } catch (err) {
      setError(err.message || "Could not update this booking.");
    } finally {
      setSaving("");
    }
  }

  async function remove(id) {
    setDeleting(id);
    setError("");
    try {
      await deleteBooking(id);
      setBookings((current) => current.filter((item) => bookingKey(item) !== id));
      setConfirmDelete("");
    } catch (err) {
      setError(err.message || "Could not delete this booking.");
    } finally {
      setDeleting("");
    }
  }

  const now = new Date();
  const upcoming = bookings.filter((booking) => toDateTime(booking) >= now);
  const past = bookings.filter((booking) => toDateTime(booking) < now);
  const pendingCount = bookings.filter((b) => (b.status || "pending") === "pending").length;
  const approvedCount = bookings.filter((b) => b.status === "approved").length;
  const rejectedCount = bookings.filter((b) => b.status === "rejected").length;

  return (
    <section className="mx-auto max-w-7xl">
      <p className="text-sm font-semibold text-gold">Staff only</p>
      <h1 className="font-heading mt-1 text-3xl font-bold text-navy">Booked calls</h1>
      <p className="mt-2 text-sm text-muted">
        Everyone who has booked a call with HIACDI Tech Hub. Approve or reject a booking to notify the student by
        email. Approved bookers get a congratulations message; rejected bookers are asked to book another time.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <MiniStat label="Pending" value={pendingCount} accent="bg-navy" />
        <MiniStat label="Approved" value={approvedCount} accent="bg-green-600" />
        <MiniStat label="Rejected" value={rejectedCount} accent="bg-red-600" />
      </div>

      {error ? <p className="mt-4 text-sm text-gold-dark">{error}</p> : null}
      {!error && !loading && !bookings.length ? (
        <p className="mt-6 text-sm text-muted">No calls have been booked yet.</p>
      ) : null}

      <div className="relative mt-8 min-h-16 space-y-6">
        {loading ? <PageLoader overlay label="Loading booked calls..." /> : null}

        {upcoming.length ? (
          <BookingsTable
            title="Upcoming"
            bookings={upcoming}
            saving={saving}
            onApprove={(id) => decide(id, "approved")}
            onReject={(id) => decide(id, "rejected")}
            onAskDelete={setConfirmDelete}
          />
        ) : null}

        {past.length ? (
          <BookingsTable
            title="Past"
            bookings={past}
            past
            saving={saving}
            onApprove={(id) => decide(id, "approved")}
            onReject={(id) => decide(id, "rejected")}
            onAskDelete={setConfirmDelete}
          />
        ) : null}
      </div>

      <ConfirmDeleteDialog
        open={Boolean(confirmDelete)}
        message="Delete this booked call? This cannot be undone."
        busy={Boolean(deleting)}
        onCancel={() => setConfirmDelete("")}
        onConfirm={() => remove(confirmDelete)}
      />
    </section>
  );
}

function bookingKey(booking) {
  return booking.id || booking._id || `${booking.email}-${booking.date}-${booking.time}`;
}

function toDateTime(booking) {
  try {
    const [year, month, day] = String(booking.date || "").split("-").map(Number);
    const [time, meridiem] = String(booking.time || "").split(/\s+/);
    let [hour, minute] = (time || "0:0").split(":").map(Number);
    if (meridiem) {
      const upper = meridiem.toUpperCase();
      if (upper === "PM" && hour < 12) hour += 12;
      if (upper === "AM" && hour === 12) hour = 0;
    }
    return new Date(year || 1970, (month || 1) - 1, day || 1, hour || 0, minute || 0);
  } catch {
    return new Date(0);
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year) return dateStr;
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function StatusBadge({ status }) {
  const styles = {
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  const label = status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Pending";
  const style = styles[status] || "bg-soft text-navy/70";
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>{label}</span>;
}

function BookingsTable({ title, bookings, past, saving, onApprove, onReject, onAskDelete }) {
  return (
    <div>
      <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-navy/60">{title}</h2>
      <div className={`mt-3 overflow-auto rounded-2xl border border-navy/10 bg-white ${past ? "opacity-80" : ""}`}>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-navy text-white">
            <tr>
              <th className="px-3 py-2 font-semibold">No</th>
              <th className="px-3 py-2 font-semibold">Name</th>
              <th className="px-3 py-2 font-semibold">Email</th>
              <th className="px-3 py-2 font-semibold">Phone</th>
              <th className="px-3 py-2 font-semibold">Date</th>
              <th className="px-3 py-2 font-semibold">Time</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => {
              const id = bookingKey(booking);
              const status = booking.status || "pending";
              const isBusy = saving === id;
              return (
                <tr key={id} className="border-t border-navy/10">
                  <td className="px-3 py-2 font-semibold text-navy">{index + 1}</td>
                  <td className="px-3 py-2 font-semibold text-navy">{booking.name || "Unnamed"}</td>
                  <td className="px-3 py-2 text-muted">{booking.email || "-"}</td>
                  <td className="px-3 py-2 text-muted">{booking.phone || "-"}</td>
                  <td className="px-3 py-2 text-navy">{formatDate(booking.date)}</td>
                  <td className="px-3 py-2 text-navy">
                    {booking.time} ({booking.timezone || "Africa/Nairobi"})
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={status} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      {status !== "approved" ? (
                        <button
                          type="button"
                          disabled={isBusy}
                          className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                          onClick={() => onApprove(id)}
                        >
                          {isBusy ? "Saving…" : "Approve"}
                        </button>
                      ) : null}
                      {status !== "rejected" ? (
                        <button
                          type="button"
                          disabled={isBusy}
                          className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                          onClick={() => onReject(id)}
                        >
                          {isBusy ? "Saving…" : "Reject"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={isBusy}
                        className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 disabled:opacity-50"
                        onClick={() => onAskDelete(id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
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
