import { useEffect, useMemo, useState } from "react";
import PageLoader from "../components/ui/PageLoader";
import SelectOrCustom from "../components/ui/SelectOrCustom";
import { COHORT_OPTIONS, INTAKE_OPTIONS, yearOptions } from "../data/cohorts";
import { useCatalog } from "../hooks/useContent";
import { fetchBroadcastPreview, sendBroadcast } from "../services/api";

const KIND_TEMPLATES = {
  announcement: {
    label: "Announcement",
    subject: "📢 IMPORTANT SCHEDULE UPDATE",
    message: `New Daily Session Schedule Starting Tomorrow!

Starting tomorrow, we are transitioning to a new 2-session daily format to give you more dedicated time for live learning, Q&A, and completing your LMS assignments!

🕒 New Daily Schedule (Monday – Thursday):
Morning Session: 9:00 AM – 12:00 PM
Afternoon Session: 2:00 PM – 5:00 PM

🕒 Friday Schedule Adjustments:
Morning Session: 9:00 AM – 12:00 PM
Afternoon Session: 2:00 PM – 4:00 PM (Shortened to accommodate Friday schedule & upcoming sessions)

Please be on time and ready for both sessions. Use the break between sessions to complete LMS work or rest.

If you cannot attend a session, message your trainer before class starts.`,
  },
  class: {
    label: "Class",
    subject: "Class update",
    message: `Please note the following class update.

Class will run as scheduled. Bring your laptop and be ready 10 minutes before we start.

If you will miss this session, message your trainer before class.`,
  },
  event: {
    label: "Event",
    subject: "You're invited: HassAz Tech Hub event",
    message: `You are invited to an upcoming HassAz Tech Hub event.

Event: Career and project showcase
Date: Friday
Time: 2:00 PM – 5:00 PM
Venue: HassAz Tech Hub / live online link to follow

Please confirm attendance by replying to this email. We look forward to seeing you there.`,
  },
  reminder: {
    label: "Reminder",
    subject: "Reminder from HassAz Tech Hub",
    message: `This is a reminder about your upcoming session and LMS work.

Please complete pending assignments before the next class and arrive on time.

If you need help, write back to the Academic Team.`,
  },
  general: {
    label: "Other",
    subject: "Message from HassAz Tech Hub",
    message: "",
  },
};

const KIND_ORDER = ["announcement", "class", "event", "reminder", "general"];
const inputClass = "w-full rounded-md border border-navy/15 px-4 py-3 text-ink outline-none focus:border-gold";

export default function AdminBroadcast() {
  const catalog = useCatalog();
  const [intakeId, setIntakeId] = useState("");
  const [audience, setAudience] = useState("");
  const [cohort, setCohort] = useState("Cohort 3");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [intakeName, setIntakeName] = useState("December");
  const [areaSlug, setAreaSlug] = useState("");
  const [courseSlug, setCourseSlug] = useState("");
  const [kind, setKind] = useState("announcement");
  const [preview, setPreview] = useState({ year: new Date().getFullYear(), intakes: [], students: [], count: 0 });
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState(KIND_TEMPLATES.announcement.subject);
  const [message, setMessage] = useState(KIND_TEMPLATES.announcement.message);
  const [flyerName, setFlyerName] = useState("");
  const [flyer, setFlyer] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const filters = useMemo(() => {
    if (cohort || year || intakeName || areaSlug || courseSlug) {
      return {
        audience: "cohort",
        cohort,
        intakeCohort: cohort,
        intakeYear: year,
        year,
        intakeName,
        categorySlug: areaSlug,
        programSlug: courseSlug,
      };
    }
    if (intakeId) return { intakeId, audience: "intake" };
    if (audience === "all") return { audience: "all" };
    return {};
  }, [intakeId, audience, cohort, year, intakeName, areaSlug, courseSlug]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchBroadcastPreview(filters)
      .then((data) => {
        if (!cancelled) {
          setPreview(data);
          setError("");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Could not load intakes and students.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  const groups = useMemo(() => groupIntakes(preview.intakes || []), [preview.intakes]);
  const selected = preview.selectedIntake || null;
  const students = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = preview.students || [];
    if (!needle) return rows;
    return rows.filter((item) =>
      [item.fullName, item.email, item.programTitle, item.cohort, item.modeLabel]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [preview.students, query]);
  const count = preview.count || 0;
  const hasSelection = Boolean(cohort || year || intakeName || areaSlug || courseSlug || intakeId || audience === "all");
  const canSend = subject.trim() && message.trim() && count > 0 && hasSelection && !sending;
  const previewName = students[0]?.fullName || preview.sampleNames?.[0] || "Hassan Issack Mohamed";
  const groupLabel = [cohort, intakeName, year].filter(Boolean).join(" · ")
    || (selected ? `${selected.programTitle} · ${selected.cohort} · ${selected.label}` : "")
    || (audience === "all" ? "all students and contacts" : "this group");
  const selectedArea = catalog.find((item) => item.slug === areaSlug);
  const areaPrograms = selectedArea?.programs || [];
  const cohortOptions = preview.options?.cohorts?.length ? preview.options.cohorts : COHORT_OPTIONS;
  const yearList = preview.options?.years?.length ? preview.options.years : yearOptions(year);
  const intakeOptions = preview.options?.intakeNames?.length ? preview.options.intakeNames : INTAKE_OPTIONS.map((item) => item.name);

  function chooseIntake(id) {
    setIntakeId(id);
    setAudience("intake");
    setCohort("");
    setYear("");
    setIntakeName("");
    setAreaSlug("");
    setCourseSlug("");
    setQuery("");
    setNotice("");
  }

  function chooseAll() {
    setIntakeId("");
    setAudience("all");
    setCohort("");
    setYear("");
    setIntakeName("");
    setAreaSlug("");
    setCourseSlug("");
    setQuery("");
    setNotice("");
  }

  function applyKind(next) {
    setKind(next);
    const template = KIND_TEMPLATES[next];
    if (template) {
      setSubject(template.subject);
      setMessage(template.message);
    }
  }

  async function onFlyer(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    try {
      const dataUrl = await compressFlyer(file);
      setFlyer(dataUrl);
      setFlyerName(file.name);
    } catch (err) {
      setFlyer("");
      setFlyerName("");
      setError(err.message || "Could not read that image.");
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!canSend) return;
    if (
      !window.confirm(
        `Send this ${KIND_TEMPLATES[kind]?.label || "message"} to ${count} student${count === 1 ? "" : "s"} (${groupLabel})? Each person will be addressed by their registered name.`
      )
    ) {
      return;
    }
    setSending(true);
    setError("");
    setNotice("");
    try {
      const result = await sendBroadcast({
        subject: subject.trim(),
        message: message.trim(),
        flyer,
        kind,
        ...filters,
      });
      setNotice(result.message || "The message has been sent.");
    } catch (err) {
      setError(err.message || "Could not send this message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl">
      <p className="text-sm font-semibold text-gold">Staff only</p>
      <h1 className="font-heading mt-1 text-3xl font-bold text-navy">Email students</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
        Choose <span className="font-semibold text-navy">Cohort 1</span>, <span className="font-semibold text-navy">December</span>,
        and <span className="font-semibold text-navy">2026</span>, then send. Every student in that cohort gets the
        same message at once, each as <span className="font-semibold text-navy">Dear {previewName},</span>
      </p>
      {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
      {notice ? <p className="mt-4 rounded-md bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{notice}</p> : null}

      <div className="mt-6 grid gap-3 rounded-2xl border border-navy/10 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        <SelectOrCustom
          label="Cohort"
          value={cohort}
          options={cohortOptions}
          placeholder="All cohorts"
          customPlaceholder="e.g. Cohort 1"
          onChange={(next) => {
            setCohort(next);
            setIntakeId("");
            setAudience("cohort");
          }}
        />
        <SelectOrCustom
          label="Intake"
          value={intakeName}
          options={intakeOptions}
          placeholder="All intakes"
          customPlaceholder="e.g. December"
          onChange={(next) => {
            setIntakeName(next);
            setIntakeId("");
            setAudience("cohort");
          }}
        />
        <SelectOrCustom
          label="Year"
          value={year}
          options={yearList}
          placeholder="All years"
          customPlaceholder="e.g. 2026"
          onChange={(next) => {
            setYear(next);
            setIntakeId("");
            setAudience("cohort");
          }}
        />
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">Course area</span>
          <select
            value={areaSlug}
            onChange={(event) => {
              setAreaSlug(event.target.value);
              setCourseSlug("");
              setIntakeId("");
            }}
            className="w-full rounded-md border border-navy/15 px-3 py-2 text-sm"
          >
            <option value="">All areas</option>
            {catalog.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">Specific course</span>
          <select
            value={courseSlug}
            onChange={(event) => {
              setCourseSlug(event.target.value);
              setIntakeId("");
            }}
            className="w-full rounded-md border border-navy/15 px-3 py-2 text-sm"
            disabled={!areaSlug}
          >
            <option value="">{areaSlug ? "All in this area" : "All courses"}</option>
            {areaPrograms.map((program) => (
              <option key={program.slug} value={program.slug}>
                {program.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
      {notice ? <p className="mt-4 rounded-md bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{notice}</p> : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
          <div className="bg-navy px-4 py-3 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-gold">HassAz intakes</p>
            <p className="font-heading mt-1 text-lg font-bold">{preview.year || new Date().getFullYear()} intake register</p>
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-3">
            {loading && !(preview.intakes || []).length ? (
              <p className="px-2 py-6 text-sm text-muted">Loading intakes…</p>
            ) : null}
            {groups.map((category) => (
              <div key={category.slug || category.title} className="mb-4">
                <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wide text-gold-dark">{category.title}</p>
                {category.programs.map((program) => (
                  <div key={program.slug} className="mb-2">
                    <p className="px-2 py-1 text-sm font-semibold text-navy">{program.title}</p>
                    <div className="space-y-1">
                      {program.intakes.map((item) => {
                        const active = intakeId === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => chooseIntake(item.id)}
                            className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
                              active ? "bg-navy text-white" : "text-navy hover:bg-soft"
                            }`}
                          >
                            <span className="block text-sm font-semibold">
                              {item.cohort}
                              {item.label ? ` · ${item.label}` : ""}
                            </span>
                            <span className={`mt-0.5 block text-xs ${active ? "text-white/70" : "text-muted"}`}>
                              {item.startDate || "Start date to be confirmed"} · {item.count} student
                              {item.count === 1 ? "" : "s"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <button
              type="button"
              onClick={chooseAll}
              className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${
                audience === "all" && !intakeId ? "bg-navy text-white" : "border border-navy/10 text-navy hover:bg-soft"
              }`}
            >
              All students &amp; contacts
            </button>
          </div>
        </aside>

        <div className="relative min-w-0 space-y-6">
          {sending ? <PageLoader overlay label="Sending emails..." /> : null}

          <section className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gold-dark">Class list</p>
                <h2 className="font-heading mt-1 text-xl font-bold text-navy">
                  {hasSelection ? groupLabel : "Choose cohort and year"}
                </h2>
              </div>
              {hasSelection ? (
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search this list…"
                  className="w-56 rounded-full border border-navy/15 px-4 py-2 text-sm outline-none focus:border-gold"
                />
              ) : null}
            </div>

            {!hasSelection ? (
              <p className="mt-6 text-sm leading-6 text-muted">
                Choose cohort, year, and optionally a course above. Every student in that group appears here, then you
                can send them one message.
              </p>
            ) : loading ? (
              <p className="mt-6 text-sm text-muted">Loading students…</p>
            ) : !students.length ? (
              <p className="mt-6 text-sm text-muted">No students on this intake yet.</p>
            ) : (
              <div className="mt-5 overflow-auto rounded-xl border border-navy/10">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-navy text-white">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Name</th>
                      <th className="px-3 py-2 font-semibold">Email</th>
                      <th className="px-3 py-2 font-semibold">Course</th>
                      <th className="px-3 py-2 font-semibold">Intake</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((item) => (
                      <tr key={`${item.email}-${item.fullName}`} className="border-t border-navy/10">
                        <td className="px-3 py-2 font-semibold text-navy">{item.fullName}</td>
                        <td className="px-3 py-2 text-muted">{item.email}</td>
                        <td className="px-3 py-2 text-navy">{item.programTitle || "-"}</td>
                        <td className="px-3 py-2 text-muted">
                          {[item.cohort, item.modeLabel].filter(Boolean).join(" · ") || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {hasSelection ? (
              <p className="mt-3 text-xs text-muted">
                {count} student{count === 1 ? "" : "s"} will receive this email, each with their own registered name.
              </p>
            ) : null}
          </section>

          <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
            <div>
              <p className="text-sm font-semibold text-navy">Message type</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {KIND_ORDER.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => applyKind(id)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      kind === id ? "bg-navy text-white" : "border border-navy/15 text-navy"
                    }`}
                  >
                    {KIND_TEMPLATES[id].label}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-navy">Subject</span>
              <input className={inputClass} value={subject} onChange={(event) => setSubject(event.target.value)} required />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-navy">Message</span>
              <textarea
                className={`${inputClass} min-h-52 whitespace-pre-wrap`}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
              />
              <span className="mt-1 block text-xs text-muted">
                Do not type “Dear …”. Each email starts with that student’s registered name.
              </span>
            </label>

            <div>
              <span className="mb-1 block text-sm font-semibold text-navy">Flyer or image (optional)</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={onFlyer}
                className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-navy file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
              {flyer ? (
                <div className="mt-3 flex items-start gap-3">
                  <img src={flyer} alt="" className="h-24 w-auto rounded-lg border border-navy/10 object-cover" />
                  <button
                    type="button"
                    className="text-xs font-semibold text-red-700"
                    onClick={() => {
                      setFlyer("");
                      setFlyerName("");
                    }}
                  >
                    Remove {flyerName || "image"}
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-xs text-muted">Optional poster, timetable, or event flyer.</p>
              )}
            </div>

            <div className="rounded-2xl border border-navy/10 bg-[#fffaf3] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-dark">Preview</p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-navy">{KIND_TEMPLATES[kind].label}</p>
              <p className="mt-1 font-heading text-lg font-bold text-navy">{subject || "Subject"}</p>
              <p className="mt-3 text-sm text-navy">
                Dear <strong>{previewName}</strong>,
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink">{message || "Your message will appear here."}</p>
              {flyer ? <img src={flyer} alt="" className="mt-4 max-h-40 rounded-lg border border-navy/10" /> : null}
            </div>

            <button
              type="submit"
              disabled={!canSend}
              className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {sending ? "Sending…" : hasSelection ? `Send to ${count} student${count === 1 ? "" : "s"} at once` : "Choose a cohort to send"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function groupIntakes(intakes) {
  const categories = [];
  const catMap = new Map();
  for (const item of intakes) {
    const catKey = item.categorySlug || item.categoryTitle || "other";
    if (!catMap.has(catKey)) {
      const category = { slug: catKey, title: item.categoryTitle || "Programmes", programs: [] };
      catMap.set(catKey, category);
      categories.push(category);
    }
    const category = catMap.get(catKey);
    let program = category.programs.find((entry) => entry.slug === item.programSlug);
    if (!program) {
      program = { slug: item.programSlug, title: item.programTitle, intakes: [] };
      category.programs.push(program);
    }
    program.intakes.push(item);
  }
  return categories;
}

function compressFlyer(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose a PNG, JPG, or similar image."));
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      reject(new Error("Please use an image smaller than 6 MB."));
      return;
    }
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const max = 900;
      const scale = Math.min(1, max / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    image.src = url;
  });
}
