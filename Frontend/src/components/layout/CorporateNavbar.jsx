import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { corporateNavLinks } from "../../data/corporate";
import { site } from "../../data/site";

export default function CorporateNavbar({ onSearch }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex h-10 w-[88px] shrink-0 items-center" onClick={() => setOpen(false)}>
          <img
            src="/brand/logo-icon.png?v=4"
            alt={site.name}
            width={88}
            height={40}
            className="nav-logo"
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {corporateNavLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `whitespace-nowrap text-sm font-semibold ${isActive ? "text-gold" : "text-navy hover:text-gold"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <button type="button" aria-label="Search" onClick={onSearch} className="text-navy hover:text-gold">
            <SearchIcon />
          </button>
        </nav>

        <button
          type="button"
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-md border border-navy/15 text-navy lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <MenuIcon open={open} />
        </button>
      </div>

      {open ? (
        <div className="border-t border-black/5 bg-white px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {corporateNavLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `py-1 text-sm font-semibold ${isActive ? "text-gold" : "text-navy"}`}
              >
                {link.label}
              </NavLink>
            ))}
            <button
              type="button"
              className="flex items-center gap-2 py-1 text-sm font-semibold text-navy"
              onClick={() => {
                setOpen(false);
                onSearch();
              }}
            >
              <SearchIcon /> Search
            </button>
          </div>
        </div>
      ) : null}
    </header>
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
