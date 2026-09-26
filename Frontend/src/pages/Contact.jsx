import { useState } from "react";
import PageHero from "../components/layout/PageHero";
import WhatsAppButton from "../components/layout/WhatsAppButton";
import PageLoader from "../components/ui/PageLoader";
import { site } from "../data/site";
import { submitContact } from "../services/api";

const inputClass =
  "w-full rounded-md border border-navy/15 px-4 py-3 text-ink outline-none focus:border-gold";

const emptyForm = { fullName: "", email: "", phone: "", subject: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(emptyForm);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function set(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const subject = form.subject.trim();
    const message = form.message.trim();
    if (!fullName || !email || !phone || !subject || !message) {
      setError("Please complete all fields before submitting the form.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await submitContact({ fullName, email, phone, subject, message });
      setSent(true);
      setForm(emptyForm);
    } catch (err) {
      setError(err.message || "Could not send your message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const formReady =
    form.fullName.trim() && form.email.trim() && form.phone.trim() && form.subject.trim() && form.message.trim();

  return (
    <div>
      <PageHero
        eyebrow="Get in touch"
        title="Contact HIACDI Tech Hub"
        text="Questions about a course, a partnership, or anything else? Send us a message and the team will get back to you."
      />

      <section className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative rounded-2xl border border-navy/10 bg-white p-5 shadow-sm sm:p-8">
          {sending ? <PageLoader overlay label="Sending your message..." /> : null}

          {sent ? (
            <div className="py-6 text-center">
              <p className="text-sm font-semibold text-gold">Message sent</p>
              <h2 className="font-heading mt-2 text-2xl font-bold text-navy">Thank you for reaching out.</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                We received your message and will reply by email as soon as possible.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-6 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-4">
              <h2 className="font-heading text-xl font-bold text-navy">Send us a message</h2>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-navy">Full name</span>
                <input
                  className={inputClass}
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  autoComplete="name"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-navy">Email address</span>
                <input
                  type="email"
                  className={inputClass}
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  autoComplete="email"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-navy">Phone number</span>
                <input
                  className={inputClass}
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  autoComplete="tel"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-navy">Subject</span>
                <select
                  className={inputClass}
                  value={form.subject}
                  onChange={(e) => set("subject", e.target.value)}
                  required
                >
                  <option value="">Select a subject</option>
                  <option>Admissions / application</option>
                  <option>Courses and fees</option>
                  <option>Certificate verification</option>
                  <option>Partnership / corporate</option>
                  <option>Careers</option>
                  <option>Technical support</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-navy">Message</span>
                <textarea
                  className={`${inputClass} min-h-32`}
                  placeholder="Enter your message"
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  required
                />
              </label>
              <button
                type="submit"
                disabled={sending || !formReady}
                className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-white hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? "Sending…" : "Send message"}
              </button>
              {error ? (
                <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
              ) : null}
            </form>
          )}
        </div>

        <div className="text-sm leading-7 text-navy/80">
          <h2 className="font-heading text-xl font-bold text-navy">Other ways to reach us</h2>
          <p className="mt-4 flex gap-2">
            <span className="text-gold">●</span> {site.location}
          </p>
          <p className="mt-2 flex gap-2">
            <span className="text-gold">●</span>
            <a href={`mailto:${site.email}`} className="font-semibold text-gold hover:underline">
              {site.email}
            </a>
          </p>
          <p className="mt-6">
            <WhatsAppButton variant="inline" />
          </p>
          <p className="mt-6 text-navy/70">{site.tagline}</p>
        </div>
      </section>
      <WhatsAppButton />
    </div>
  );
}
