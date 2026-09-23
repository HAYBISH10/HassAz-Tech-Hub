import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminPath } from "../adminPath";
import Countdown from "../components/ui/Countdown";
import PageLoader from "../components/ui/PageLoader";
import { fetchApplicationWindow, fetchApplications, fetchGraduates } from "../services/api";

export default function AdminDashboard() {
  const [apps, setApps] = useState([]);
  const [graduates, setGraduates] = useState([]);
  const [win, setWin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshWindow = useCallback(() => {
    return fetchApplicationWindow()
      .then(setWin)
      .catch(() => {
        // keep showing the last known window on a transient network error
      });
  }, []);

  useEffect(() => {
    Promise.all([fetchApplications(), fetchGraduates(), fetchApplicationWindow()])
      .then(([appsData, graduatesData, windowData]) => {
        setApps(appsData);
        setGraduates(graduatesData);
        setWin(windowData);
      })
      .catch((err) => setError(err.message || "Could not load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Keep the "Open now" / "Closed now" badge live without a manual refresh.
    const id = setInterval(refreshWindow, 30000);
    return () => clearInterval(id);
  }, [refreshWindow]);

  const openApps = apps.filter((app) => (app.state || "Open") !== "Closed").length;
  const closedApps = apps.length - openApps;
  const pending = apps.filter((app) => (app.status || "Submitted") === "Submitted").length;
  const approved = apps.filter((app) => app.status === "Accepted").length;
  const rejected = apps.filter((app) => app.status === "Rejected").length;

  return (
    <section className="relative">
      {loading ? <PageLoader overlay label="Loading dashboard..." /> : null}
      <p className="text-sm font-semibold text-gold">Overview</p>
      <h1 className="font-heading mt-1 text-3xl font-bold text-navy">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">
        Here&apos;s what&apos;s happening across HassAz Tech Hub right now.
      </p>
      {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total applicants" value={apps.length} accent="bg-navy" />
        <StatCard label="Pending review" value={pending} accent="bg-gold" />
        <StatCard label="Approved" value={approved} accent="bg-green-600" />
        <StatCard label="Rejected" value={rejected} accent="bg-red-600" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open (unreviewed)" value={openApps} accent="bg-navy-mid" />
        <StatCard label="Closed" value={closedApps} accent="bg-navy-dark" />
        <StatCard label="Awarded graduates" value={graduates.length} accent="bg-gold-dark" />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-5">
        <div className="rounded-2xl border border-navy/10 bg-white p-6 lg:col-span-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-heading text-lg font-bold text-navy">Applications window</h2>
            {win ? (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  win.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {win.isOpen ? "Open now" : "Closed now"}
              </span>
            ) : null}
          </div>
          {win?.isOpen && win?.closeAt ? (
            <div className="mt-3">
              <p className="text-xs text-muted">Closes in:</p>
              <Countdown target={win.closeAt} warnAtDays={5} className="mt-1 text-gold-dark" onReached={refreshWindow} />
            </div>
          ) : null}
          {!win?.isOpen && win?.reason === "not-yet-open" && win?.openAt ? (
            <div className="mt-3">
              <p className="text-xs text-muted">Opens in:</p>
              <Countdown target={win.openAt} className="mt-1 text-navy" onReached={refreshWindow} />
            </div>
          ) : null}
          <p className="mt-3 text-sm text-muted">
            Open all courses at once, or open one area (Software Engineering, Data Courses) or a single course
            without opening the rest.
          </p>
          <Link
            to={adminPath("applications")}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-mid"
          >
            Manage application window
          </Link>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-6 lg:col-span-1">
          <h2 className="font-heading text-lg font-bold text-navy">Applicants</h2>
          <p className="mt-3 text-sm text-muted">
            Review every applicant, approve or reject them, and export the full list.
          </p>
          <Link
            to={adminPath("applicants")}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-navy/20 px-5 py-2.5 text-sm font-semibold text-navy transition hover:border-gold hover:text-gold-dark"
          >
            Manage applicants
          </Link>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-6 lg:col-span-1">
          <h2 className="font-heading text-lg font-bold text-navy">Booked calls</h2>
          <p className="mt-3 text-sm text-muted">
            See everyone who booked a call, with the date, time, and their contact details.
          </p>
          <Link
            to={adminPath("calls")}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-navy/20 px-5 py-2.5 text-sm font-semibold text-navy transition hover:border-gold hover:text-gold-dark"
          >
            View booked calls
          </Link>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-6 lg:col-span-1">
          <h2 className="font-heading text-lg font-bold text-navy">Contact messages</h2>
          <p className="mt-3 text-sm text-muted">
            Read new messages from the Contact Us form. Approve, reject, or delete an enquiry.
          </p>
          <Link
            to={adminPath("contacts")}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-navy/20 px-5 py-2.5 text-sm font-semibold text-navy transition hover:border-gold hover:text-gold-dark"
          >
            Open inbox
          </Link>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-6 lg:col-span-1">
          <h2 className="font-heading text-lg font-bold text-navy">Email students</h2>
          <p className="mt-3 text-sm text-muted">
            Write one announcement for a bootcamp or cohort. Each student is addressed by their registered name.
          </p>
          <Link
            to={adminPath("broadcast")}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-navy/20 px-5 py-2.5 text-sm font-semibold text-navy transition hover:border-gold hover:text-gold-dark"
          >
            Compose message
          </Link>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-6 lg:col-span-1">
          <h2 className="font-heading text-lg font-bold text-navy">Website visitors</h2>
          <p className="mt-3 text-sm text-muted">
            Unique people who opened the public site, plus a numbered list of everyone who signed up.
          </p>
          <Link
            to={adminPath("visitors")}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-navy/20 px-5 py-2.5 text-sm font-semibold text-navy transition hover:border-gold hover:text-gold-dark"
          >
            View visitors
          </Link>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-6 lg:col-span-1">
          <h2 className="font-heading text-lg font-bold text-navy">Course intakes</h2>
          <p className="mt-3 text-sm text-muted">
            Set the intake year, start dates, duration, learning mode, tuition, and brochure downloads for every course.
          </p>
          <Link
            to={adminPath("intakes")}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-navy/20 px-5 py-2.5 text-sm font-semibold text-navy transition hover:border-gold hover:text-gold-dark"
          >
            Manage intakes
          </Link>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-6 lg:col-span-1">
          <h2 className="font-heading text-lg font-bold text-navy">Certificate register</h2>
          <p className="mt-3 text-sm text-muted">
            Register awarded graduates so their certificate QR code can be verified.
          </p>
          <Link
            to={adminPath("graduates")}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-navy/20 px-5 py-2.5 text-sm font-semibold text-navy transition hover:border-gold hover:text-gold-dark"
          >
            Manage certificates
          </Link>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-6 lg:col-span-1">
          <h2 className="font-heading text-lg font-bold text-navy">Database</h2>
          <p className="mt-3 text-sm text-muted">
            View stored records in tables: applicants, users, calls, messages, and the rest.
          </p>
          <Link
            to={adminPath("database")}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-navy/20 px-5 py-2.5 text-sm font-semibold text-navy transition hover:border-gold hover:text-gold-dark"
          >
            Open database
          </Link>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-5">
      <span className={`inline-block h-2 w-10 rounded-full ${accent}`} />
      <p className="mt-3 text-3xl font-bold text-navy">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}
