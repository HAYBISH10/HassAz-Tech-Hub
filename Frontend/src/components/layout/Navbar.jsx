import { useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import { navLinks, site } from "../../data/site";
import AboutMenu from "./AboutMenu";
import CoursesMegaMenu from "./CoursesMegaMenu";

export default function Navbar({ onSearch, onBook }) {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState("");
  const closeTimer = useRef(null);
  const location = useLocation();
  const aboutActive = location.pathname.startsWith("/about");
  const { user, isLoggedIn, logout } = useUserAuth();
  const [accountOpen, setAccountOpen] = useState(false);

  function showMenu(name) {
    clearTimeout(closeTimer.current);
    setMenu(name);
  }

  function hideMenu() {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenu(""), 80);
  }

  function hideMenuNow() {
    clearTimeout(closeTimer.current);
    setMenu("");
  }

  function closeAll() {
    setOpen(false);
    setMenu("");
  }

  return (
    <header className="relative sticky top-0 z-50 w-full border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex h-10 w-[88px] shrink-0 items-center"
          onClick={closeAll}
          onMouseEnter={hideMenuNow}
        >
          <img
            src="/brand/logo-icon.png?v=4"
            alt={site.name}
            width={88}
            height={40}
            className="nav-logo"
          />
        </Link>

        <nav className="desktop-nav hidden items-center gap-5 xl:gap-7 xl:flex">
          {navLinks.map((link) => {
            if (link.to === "/courses") {
              return (
                <div
                  key={link.to}
                  className="relative"
                  onMouseEnter={() => showMenu("courses")}
                  onMouseLeave={hideMenu}
                >
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `whitespace-nowrap text-sm font-semibold ${isActive || menu === "courses" ? "text-gold" : "text-navy hover:text-gold"}`
                    }
                  >
                    {link.label}
                  </NavLink>
                </div>
              );
            }
            if (link.to === "/about") {
              return (
                <div
                  key={link.to}
                  className="relative"
                  onMouseEnter={() => showMenu("about")}
                  onMouseLeave={hideMenu}
                >
                  <NavLink
                    to={link.to}
                    className={`whitespace-nowrap text-sm font-semibold ${aboutActive || menu === "about" ? "text-gold" : "text-navy hover:text-gold"}`}
                  >
                    {link.label}
                  </NavLink>
                  {menu === "about" ? (
                    <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
                      <AboutMenu onNavigate={closeAll} />
                    </div>
                  ) : null}
                </div>
              );
            }
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onMouseEnter={hideMenuNow}
                className={({ isActive }) =>
                  `whitespace-nowrap text-sm font-semibold ${isActive ? "text-gold" : "text-navy hover:text-gold"}`
                }
              >
                {link.label}
              </NavLink>
            );
          })}
          <button
            type="button"
            aria-label="Search"
            onClick={onSearch}
            onMouseEnter={hideMenuNow}
            className="text-navy hover:text-gold"
          >
            <SearchIcon />
          </button>
          <button
            type="button"
            onClick={onBook}
            onMouseEnter={hideMenuNow}
            className="rounded-full bg-gold px-4 py-2 text-sm font-semibold whitespace-nowrap text-white hover:bg-gold-dark"
          >
            Book for Calls
          </button>
          {isLoggedIn ? (
            <div className="relative" onMouseEnter={hideMenuNow}>
              <button
                type="button"
                onClick={() => setAccountOpen((value) => !value)}
                className="rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold text-navy"
              >
                {user.fullName.split(" ")[0]}
              </button>
              {accountOpen ? (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-navy/10 bg-white p-2 shadow-lg">
                  <Link to="/account" onClick={() => setAccountOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold text-navy hover:bg-soft">
                    My dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountOpen(false);
                      logout();
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-soft"
                  >
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center gap-2" onMouseEnter={hideMenuNow}>
              <Link to="/register" className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white">
                Sign Up
              </Link>
            </div>
          )}
        </nav>

        <button
          type="button"
          className="mobile-menu-btn ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-navy/15 text-navy xl:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <MenuIcon open={open} />
        </button>
      </div>

      {menu === "courses" ? (
        <div
          className="courses-mega-panel absolute inset-x-0 top-full z-50 hidden border-t border-black/5 bg-white shadow-xl xl:block"
          onMouseEnter={() => showMenu("courses")}
          onMouseLeave={hideMenu}
        >
          <CoursesMegaMenu onNavigate={closeAll} />
        </div>
      ) : null}

      {open ? (
        <div className="border-t border-black/5 bg-white px-4 py-4 xl:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => {
              if (link.to === "/courses") {
                return <MobileCourses key={link.to} onNavigate={closeAll} />;
              }
              if (link.to === "/about") {
                return <MobileAbout key={link.to} onNavigate={closeAll} />;
              }
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={closeAll}
                  className={({ isActive }) =>
                    `py-1 text-sm font-semibold ${isActive ? "text-gold" : "text-navy"}`
                  }
                >
                  {link.label}
                </NavLink>
              );
            })}
            <button
              type="button"
              className="flex items-center gap-2 py-1 text-sm font-semibold text-navy"
              onClick={() => {
                closeAll();
                onSearch();
              }}
            >
              <SearchIcon /> Search
            </button>
            <button
              type="button"
              className="mt-1 w-full rounded-full bg-gold px-4 py-3 text-sm font-semibold text-white"
              onClick={() => {
                closeAll();
                onBook();
              }}
            >
              Book for Calls
            </button>
            {isLoggedIn ? (
              <>
                <NavLink to="/account" onClick={closeAll} className="py-1 text-sm font-semibold text-navy">
                  My dashboard
                </NavLink>
                <button
                  type="button"
                  className="py-1 text-left text-sm font-semibold text-red-700"
                  onClick={() => {
                    closeAll();
                    logout();
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="mt-2">
                <Link to="/register" onClick={closeAll} className="block rounded-full bg-navy px-4 py-2 text-center text-sm font-semibold text-white">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {menu === "courses" ? (
        <div
          className="absolute inset-x-0 top-full z-40 hidden h-screen bg-navy/30 xl:block"
          onMouseEnter={hideMenuNow}
          onClick={hideMenuNow}
        />
      ) : null}
    </header>
  );
}

function MobileCourses({ onNavigate }) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between py-1 text-sm font-semibold text-navy"
        onClick={() => setShow((value) => !value)}
      >
        Courses
        <span>{show ? "−" : "+"}</span>
      </button>
      {show ? (
        <div className="mt-2 rounded-xl border border-navy/10 bg-soft">
          <CoursesMegaMenu onNavigate={onNavigate} />
        </div>
      ) : null}
    </div>
  );
}

function MobileAbout({ onNavigate }) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between py-1 text-sm font-semibold text-navy"
        onClick={() => setShow((value) => !value)}
      >
        About
        <span>{show ? "−" : "+"}</span>
      </button>
      {show ? (
        <div className="mt-2">
          <AboutMenu onNavigate={onNavigate} />
        </div>
      ) : null}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}

function MenuIcon({ open }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" />
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}
