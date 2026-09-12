import { Link } from "react-router-dom";
import { aboutLinks } from "../../data/about";
import { navLinks, site } from "../../data/site";

export default function Footer() {
  return (
    <footer className="bg-navy-dark text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
        <div>
          <img
            src="/brand/logo-mark.png?v=2"
            alt={site.name}
            className="h-14 w-auto object-contain sm:h-16"
          />
          <p className="mt-4 font-heading text-lg font-bold">
            HassAz <span className="text-gold">TECH</span> HUB
          </p>
          <div className="mt-6 flex gap-3">
            {["Facebook", "LinkedIn", "X", "YouTube"].map((label) => (
              <span
                key={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-xs text-gold"
                title={label}
              >
                {label[0]}
              </span>
            ))}
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-2 text-sm text-white/80 sm:grid-cols-1">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-gold">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-gold">About</p>
          <ul className="mt-2 space-y-2 text-sm text-white/80">
            {aboutLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-gold">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm leading-7 break-words text-white/85">
          <p className="flex gap-2">
            <span className="text-gold">●</span> {site.location}
          </p>
          <p className="flex gap-2">
            <span className="text-gold">●</span>
            <a href={`mailto:${site.email}`} className="hover:text-gold">
              {site.email}
            </a>
          </p>
          <p className="flex gap-2">
            <span className="text-gold">●</span>
            <a href={`mailto:${site.admissionsEmail}`} className="hover:text-gold">
              {site.admissionsEmail}
            </a>
          </p>
          <p className="mt-4 text-white/70">{site.tagline}</p>
        </div>

        <div className="md:col-span-2 lg:col-span-1">
          <div className="h-48 overflow-hidden rounded-md border border-white/10 bg-navy sm:h-56">
            <iframe
              title="HassAz Tech Hub location"
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://maps.google.com/maps?q=Kenya&t=&z=6&ie=UTF8&iwloc=&output=embed"
            />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </div>
    </footer>
  );
}
