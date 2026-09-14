import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { adminPath } from "../../adminPath";
import { adminLogout, isAuthenticated } from "../../services/auth";
import { fetchContactMessages } from "../../services/api";

const navItems = [
  { to: adminPath(), label: "Dashboard", end: true },
  { to: adminPath("applications"), label: "Applications" },
  { to: adminPath("applicants"), label: "Applicants" },
  { to: adminPath("calls"), label: "Booked Calls" },
  { to: adminPath("graduates"), label: "Certificates" },
  { to: adminPath("contacts"), label: "Contact Messages" },
  { to: adminPath("broadcast"), label: "Email Students" },
  { to: adminPath("visitors"), label: "Website Visitors" },
  { to: adminPath("intakes"), label: "Course Intakes" },
  { to: adminPath("database"), label: "Database" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadContacts, setUnreadContacts] = useState(0);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate(adminPath("login"), { replace: true });
      return;
    }
    setChecked(true);
  }, [navigate]);

  useEffect(() => {
    if (!checked) return;
    fetchContactMessages()
      .then((data) => setUnreadContacts(data.unreadCount || 0))
      .catch(() => {});
  }, [checked, location.pathname]);

  async function handleLogout() {
    await adminLogout();
    navigate(adminPath("login"), { replace: true });
  }

  if (!checked) return null;

  return (
    <div className="flex min-h-screen bg-soft">
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 shrink-0 transform flex-col bg-navy-dark text-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col px-5 py-6">
          <div className="flex items-center gap-3">
            <img src="/brand/logo-mark.png?v=2" alt="HassAz Tech Hub" className="h-10 w-auto object-contain" />
            <div>
              <p className="font-heading text-sm font-bold leading-tight">
                HassAz <span className="text-gold">TECH</span> HUB
              </p>
              <p className="text-xs text-white/60">Admin Panel</p>
            </div>
          </div>

          <nav className="mt-8 flex-1 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    isActive ? "bg-gold text-navy-dark" : "text-white/80 hover:bg-white/10"
                  }`
                }
              >
                <span className="flex items-center justify-between gap-2">
                  {item.label}
                  {item.to === adminPath("contacts") && unreadContacts > 0 ? (
                    <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-navy-dark">
                      {unreadContacts}
                    </span>
                  ) : null}
                </span>
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:border-gold hover:text-gold"
          >
            Log out
          </button>
        </div>
      </aside>

      {menuOpen ? (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-navy/10 bg-white px-5 py-4 lg:px-8">
          <button
            type="button"
            className="rounded-md border border-navy/15 px-3 py-2 text-sm font-semibold text-navy lg:hidden"
            onClick={() => setMenuOpen(true)}
          >
            Menu
          </button>
          <p className="font-heading hidden text-lg font-bold text-navy lg:block">Admin Dashboard</p>
          <p className="truncate text-sm text-muted">
            Signed in as <span className="font-semibold text-navy">HassAz Tech Hub</span>
          </p>
        </header>
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
