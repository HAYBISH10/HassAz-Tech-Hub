import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import PageLoader from "../components/ui/PageLoader";
import { useUserAuth } from "../context/UserAuthContext";
import { useCatalog } from "../hooks/useContent";
import { enrollInCourse, fetchMyApplications, fetchMyEnrollments } from "../services/api";

export default function AccountDashboard() {
  const { user, ready, isLoggedIn } = useUserAuth();
  const catalog = useCatalog();
  const [enrollments, setEnrollments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [programSlug, setProgramSlug] = useState("");

  useEffect(() => {
    if (!isLoggedIn) return;
    Promise.all([fetchMyEnrollments(), fetchMyApplications()])
      .then(([courses, apps]) => {
        setEnrollments(courses);
        setApplications(apps);
      })
      .catch((err) => setError(err.message || "Could not load your dashboard."));
  }, [isLoggedIn]);

  if (!ready) return <PageLoader overlay label="Loading your account..." />;
  if (!isLoggedIn) return <Navigate to="/login?next=/account" replace />;

  const enrolledSlugs = new Set(enrollments.map((item) => item.programSlug));
  const selectedCategory = catalog.find((item) => item.slug === categorySlug) || catalog[0];
  const categoryPrograms = (selectedCategory?.programs || []).map((program) => ({
    ...program,
    categoryTitle: selectedCategory.title,
    categorySlug: selectedCategory.slug,
  }));
  const selectedProgram = categoryPrograms.find((item) => item.slug === programSlug) || null;

  async function enroll(program) {
    setBusy(program.slug);
    setError("");
    setNotice("");
    try {
      const created = await enrollInCourse({
        categorySlug: program.categorySlug,
        programSlug: program.slug,
      });
      setEnrollments((current) => [created, ...current]);
      setNotice(created.message || "You have successfully registered for this course. A confirmation has been sent to your email.");
    } catch (err) {
      setError(err.message || "Could not register for this course.");
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm font-semibold text-gold">Student dashboard</p>
      <h1 className="font-heading mt-1 text-3xl font-bold text-navy">Welcome, {user.fullName.split(" ")[0]}.</h1>
      <p className="mt-2 text-sm text-muted">
        Signed in as {user.email}. Use this page to follow your courses and continue an application when intakes are open.
      </p>
      {notice ? <p className="mt-4 rounded-md bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{notice}</p> : null}
      {error ? <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-navy/10 bg-white p-5">
          <h2 className="font-heading text-xl font-bold text-navy">My Courses</h2>
          {!enrollments.length && !applications.length ? (
            <p className="mt-3 text-sm text-muted">You have not registered for a course yet.</p>
          ) : null}
          <div className="mt-4 space-y-3">
            {enrollments.map((item) => (
              <div key={item.id} className="rounded-xl bg-soft px-4 py-3">
                <p className="font-semibold text-navy">{item.programTitle}</p>
                <p className="text-xs text-muted">{item.categoryTitle} · Registered</p>
              </div>
            ))}
            {applications.map((app) => (
              <div key={app.applicationNumber} className="rounded-xl bg-soft px-4 py-3">
                <p className="font-semibold text-navy">{app.program?.program || "Application"}</p>
                <p className="text-xs text-muted">
                  {app.applicationNumber} · {statusLabel(app.status)}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-navy/10 bg-white p-5">
          <h2 className="font-heading text-xl font-bold text-navy">Available Courses</h2>
          <p className="mt-2 text-sm text-muted">
            Choose a program area first, then a course in that area — the same flow as the application form.
          </p>
          <label className="mt-4 block text-sm">
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
          <label className="mt-3 block text-sm">
            <span className="font-semibold text-navy">Preferred course</span>
            <select
              className="mt-1 w-full rounded-md border border-navy/15 px-3 py-2"
              value={selectedProgram?.slug || ""}
              onChange={(e) => setProgramSlug(e.target.value)}
            >
              <option value="">Select</option>
              {categoryPrograms.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          {selectedProgram ? (
            <div className="mt-4 rounded-xl border border-navy/10 px-4 py-3">
              <p className="font-semibold text-navy">{selectedProgram.title}</p>
              <p className="text-xs text-muted">{selectedProgram.categoryTitle}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {enrolledSlugs.has(selectedProgram.slug) ? (
                  <span className="text-xs font-semibold text-green-700">You are already registered for this course.</span>
                ) : (
                  <button
                    type="button"
                    disabled={busy === selectedProgram.slug}
                    onClick={() => enroll(selectedProgram)}
                    className="rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {busy === selectedProgram.slug ? "Registering…" : "Register for this Course"}
                  </button>
                )}
                <Link
                  to={`/courses/${selectedProgram.categorySlug}/${selectedProgram.slug}`}
                  className="rounded-full border border-navy/15 px-3 py-1.5 text-xs font-semibold text-navy"
                >
                  View course
                </Link>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">Select a course in this program area to continue.</p>
          )}
        </article>
      </div>
    </section>
  );
}

function statusLabel(status) {
  if (status === "Accepted") return "Approved";
  if (status === "Rejected") return "Rejected";
  if (status === "Submitted") return "Pending";
  return status || "Pending";
}
