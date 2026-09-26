import { useEffect, useState } from "react";
import PageLoader from "../components/ui/PageLoader";
import { fetchDatabase } from "../services/api";

export default function AdminDatabase() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatabase()
      .then((payload) => {
        setData(payload);
        setTab(payload.tables?.[0]?.id || "");
      })
      .catch((err) => setError(err.message || "Could not load the database tables."))
      .finally(() => setLoading(false));
  }, []);

  const current = data?.tables?.find((item) => item.id === tab) || data?.tables?.[0];

  return (
    <section className="mx-auto max-w-7xl">
      <p className="text-sm font-semibold text-gold">Staff only</p>
      <h1 className="font-heading mt-1 text-3xl font-bold text-navy">Database</h1>
      <p className="mt-2 text-sm text-muted">
        Records stored for HIACDI Tech Hub, shown as tables. Source: {data?.source || "loading…"}.
      </p>
      {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}

      <div className="relative mt-6 min-h-40">
        {loading ? <PageLoader overlay label="Loading database..." /> : null}
        <div className="flex flex-wrap gap-2">
          {(data?.tables || []).map((table) => (
            <button
              key={table.id}
              type="button"
              onClick={() => setTab(table.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                current?.id === table.id ? "bg-navy text-white" : "border border-navy/15 text-navy"
              }`}
            >
              {table.label} ({table.count})
            </button>
          ))}
        </div>

        {current ? (
          current.rows.length ? (
            <div className="mt-5 overflow-auto rounded-2xl border border-navy/15 bg-white" style={{ maxHeight: "70vh" }}>
              <table className="min-w-full border-collapse text-xs">
                <thead>
                  <tr>
                    {current.columns.map((col) => (
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
                  {current.rows.map((row, index) => (
                    <tr key={row.id || index} className={index % 2 ? "bg-soft/40" : "bg-white"}>
                      {current.columns.map((col) => (
                        <td key={col} className="max-w-xs truncate whitespace-nowrap border border-navy/10 px-3 py-1.5 text-navy/90">
                          {row[col] === "" || row[col] == null ? "-" : String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted">No rows in this table yet.</p>
          )
        ) : null}
      </div>
    </section>
  );
}
