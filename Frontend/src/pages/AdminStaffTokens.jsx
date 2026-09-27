import { useEffect, useState } from "react";
import PageLoader from "../components/ui/PageLoader";
import { createUnlockToken, deleteUnlockToken, fetchUnlockTokens } from "../services/api";

const inputClass = "w-full rounded-md border border-navy/15 px-4 py-3 text-ink outline-none focus:border-gold";

export default function AdminStaffTokens() {
  const [tokens, setTokens] = useState([]);
  const [label, setLabel] = useState("");
  const [created, setCreated] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    const data = await fetchUnlockTokens();
    setTokens(data.tokens || []);
  }

  useEffect(() => {
    load()
      .catch(() => setError("Could not load unlock tokens."))
      .finally(() => setLoading(false));
  }, []);

  async function onCreate(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setCreated("");
    try {
      const token = await createUnlockToken(label.trim());
      setCreated(token.code);
      setLabel("");
      await load();
    } catch (err) {
      setError(err.message || "Could not create an unlock token.");
    } finally {
      setBusy(false);
    }
  }

  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      window.prompt("Copy this unlock token", code);
    }
  }

  async function remove(id) {
    setBusy(true);
    setError("");
    try {
      await deleteUnlockToken(id);
      if (created) setCreated("");
      await load();
    } catch (err) {
      setError(err.message || "Could not delete that token.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl">
      <p className="text-sm font-semibold text-gold">Staff only</p>
      <h1 className="font-heading mt-1 text-3xl font-bold text-navy">Staff unlock tokens</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        After 4 wrong passwords, sign-in is rejected. Create a token here, send it to that staff member, and they
        enter it on the login page to remove the restriction.
      </p>

      <form onSubmit={onCreate} className="relative mt-8 space-y-4 rounded-2xl border border-navy/10 bg-white p-5 sm:p-7">
        {busy ? <PageLoader overlay label="Saving..." /> : null}
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-navy">Who is this token for (optional)</span>
          <input
            className={inputClass}
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="e.g. Hafsa — morning shift"
          />
        </label>
        <button type="submit" disabled={busy} className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
          Create unlock token
        </button>
        {created ? (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
            <p className="text-sm font-semibold text-green-800">Give this token to staff</p>
            <p className="mt-2 font-mono text-lg font-bold tracking-wide text-navy">{created}</p>
            <button
              type="button"
              onClick={() => copyCode(created)}
              className="mt-3 rounded-full bg-green-700 px-4 py-2 text-xs font-semibold text-white"
            >
              Copy token
            </button>
          </div>
        ) : null}
        {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
      </form>

      <div className="relative mt-8 overflow-auto rounded-2xl border border-navy/10 bg-white">
        {loading ? <PageLoader overlay label="Loading tokens..." /> : null}
        {!loading && !tokens.length ? (
          <p className="p-5 text-sm text-muted">No unlock tokens yet. Create one to give to staff.</p>
        ) : null}
        {tokens.length ? (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-navy text-white">
              <tr>
                <th className="px-3 py-2 font-semibold">No</th>
                <th className="px-3 py-2 font-semibold">For</th>
                <th className="px-3 py-2 font-semibold">Token</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((item, index) => (
                <tr key={item.id} className="border-t border-navy/10">
                  <td className="px-3 py-2 font-semibold text-navy">{index + 1}</td>
                  <td className="px-3 py-2 text-navy">{item.label}</td>
                  <td className="px-3 py-2 font-mono text-navy">{item.code || "Used"}</td>
                  <td className="px-3 py-2 text-muted">{item.usedAt ? "Used" : "Ready to give"}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      {item.code ? (
                        <button
                          type="button"
                          onClick={() => copyCode(item.code)}
                          className="rounded-full bg-navy px-3 py-1 text-xs font-semibold text-white"
                        >
                          Copy
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </section>
  );
}
