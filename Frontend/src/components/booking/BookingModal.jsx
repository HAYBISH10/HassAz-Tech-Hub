import { useEffect, useMemo, useState } from "react";
import PageLoader from "../ui/PageLoader";
import { site } from "../../data/site";
import { createBooking, fetchBookingConfig } from "../../services/api";
import { buildSlotsByDate } from "../../utils/booking";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function BookingModal({ open, onClose }) {
  const [config, setConfig] = useState(null);
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState("");
  const [booking, setBooking] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  useEffect(() => {
    if (!open) return;
    setConfirmed(null);
    setStatus("");
    fetchBookingConfig().then((data) => {
      const slotsByDate =
        data.slotsByDate && Object.keys(data.slotsByDate).length
          ? data.slotsByDate
          : buildSlotsByDate(data);
      setConfig({ ...data, slotsByDate });
    });
  }, [open]);

  function formatFullDate(dateKey) {
    if (!dateKey) return "";
    const [year, month, day] = dateKey.split("-").map(Number);
    if (!year) return dateKey;
    return new Date(year, month - 1, day).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const availableDates = config?.slotsByDate || {};

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startPad = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const items = Array.from({ length: startPad }, () => null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      items.push({ day, key, open: Boolean(availableDates[key]) });
    }
    return items;
  }, [cursor, availableDates]);

  if (!open || !config) return null;

  const times = selectedDate ? availableDates[selectedDate] || [] : [];

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");
    setBooking(true);
    try {
      const result = await createBooking({ ...form, date: selectedDate, time: selectedTime });
      setConfirmed({
        name: form.name,
        email: form.email,
        date: selectedDate,
        time: selectedTime,
        emailed: result?.emailed,
        nextWeekDate: result?.nextWeekDate || "",
      });
      setForm({ name: "", email: "", phone: "" });
      setSelectedDate("");
      setSelectedTime("");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBooking(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-navy-dark/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="relative grid max-h-[94vh] w-full max-w-5xl overflow-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl md:grid-cols-2"
        onClick={(event) => event.stopPropagation()}
      >
        {booking ? <PageLoader overlay label="Booking your call..." /> : null}
        <aside className="border-b border-black/5 p-5 sm:p-8 md:border-r md:border-b-0">
          <img src={config.logoSrc} alt={config.name || site.name} className="h-10 w-auto object-contain sm:h-12" />
          <p className="mt-6 text-sm text-muted">{config.host}</p>
          <h2 className="font-heading mt-1 text-2xl font-bold text-navy">{config.title}</h2>
          <p className="mt-4 text-sm text-navy/80">⏱ {config.durationMinutes} min</p>
          <p className="mt-2 text-sm text-navy/80">🎥 {config.location}</p>
          <p className="mt-6 font-medium text-navy">{config.greeting}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{config.intro}</p>
          <p className="mt-4 text-sm font-semibold text-navy">What to expect:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
            {(config.expect || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm font-semibold text-navy">What you will need to prepare:</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
            {(config.prepare || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-navy">{config.closing}</p>
        </aside>

        <section className="p-5 sm:p-8">
          {confirmed ? (
            <div className="flex h-full flex-col items-start justify-center py-6 text-left">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
                ✓
              </span>
              <h3 className="font-heading mt-4 text-xl font-bold text-navy sm:text-2xl">Your call is booked!</h3>
              <p className="mt-3 text-sm leading-6 text-navy/80">
                Thanks{confirmed.name ? `, ${confirmed.name.split(" ")[0]}` : ""}! Your call with HIACDI Tech Hub is
                confirmed for{" "}
                <span className="font-semibold text-navy">
                  {formatFullDate(confirmed.date)} at {confirmed.time}
                </span>
                .
              </p>
              <p className="mt-3 rounded-xl bg-gold-soft px-4 py-3 text-sm leading-6 text-navy">
                Please make sure you are available at this exact day and time. This is a recurring weekly slot, so
                kindly also keep{" "}
                <span className="font-semibold">
                  {confirmed.nextWeekDate || `the same day next week`} at {confirmed.time}
                </span>{" "}
                free for the following session.
              </p>
              <p className="mt-3 text-sm text-muted">
                {confirmed.emailed
                  ? `We've also emailed these details to ${confirmed.email}.`
                  : "We could not confirm email delivery, but your booking is saved. Please keep this day and time free."}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-mid"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <h3 className="font-heading text-lg font-bold text-navy sm:text-xl">Select a Date & Time</h3>
              <div className="mt-4 flex items-center justify-between">
            <button type="button" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
              ‹
            </button>
            <p className="font-semibold text-navy">
              {monthNames[cursor.getMonth()]} {cursor.getFullYear()}
            </p>
            <button type="button" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
              ›
            </button>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-muted">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <span key={day}>{day}</span>
            ))}
            {cells.map((cell, index) =>
              cell ? (
                <button
                  key={cell.key}
                  type="button"
                  disabled={!cell.open}
                  onClick={() => {
                    setSelectedDate(cell.key);
                    setSelectedTime("");
                  }}
                  className={`h-9 rounded-full text-sm ${
                    selectedDate === cell.key
                      ? "bg-navy text-white"
                      : cell.open
                        ? "text-navy hover:bg-gold-soft"
                        : "text-black/20"
                  }`}
                >
                  {cell.day}
                </button>
              ) : (
                <span key={`empty-${index}`} />
              )
            )}
          </div>
          <p className="mt-4 text-sm text-muted">
            🌐 Time zone: {config.timezoneLabel}
          </p>
          {selectedDate ? (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {times.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`rounded-md border px-2 py-2 text-sm ${
                    selectedTime === time ? "border-gold bg-gold text-navy" : "border-navy/15 text-navy"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          ) : null}
          {selectedDate && selectedTime ? (
            <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
              <input
                required
                placeholder="Full name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="rounded-md border border-navy/15 px-3 py-2"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="rounded-md border border-navy/15 px-3 py-2"
              />
              <input
                placeholder="Phone"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                className="rounded-md border border-navy/15 px-3 py-2"
              />
              <button
                type="submit"
                disabled={booking}
                className="rounded-md bg-gold px-4 py-2 font-semibold text-navy-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {booking ? "Booking…" : "Confirm booking"}
              </button>
            </form>
          ) : null}
              {status ? <p className="mt-3 text-sm text-gold">{status}</p> : null}
            </>
          )}
        </section>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-4 text-2xl text-muted"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
