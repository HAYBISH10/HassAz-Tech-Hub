import { Link } from "react-router-dom";
import { site } from "../../data/site";

export default function CorporateCtas({ onBook, align = "start", tone = "onLight" }) {
  const onDark = tone === "onDark";
  const primary = onDark
    ? "rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy hover:bg-gold hover:text-navy"
    : "rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy-mid";
  const secondary = onDark
    ? "rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:border-gold hover:text-gold"
    : "rounded-full border border-navy/20 px-6 py-3 text-sm font-semibold text-navy hover:border-gold hover:text-gold-dark";

  return (
    <div className={`mt-8 flex flex-wrap gap-3 ${align === "center" ? "justify-center" : ""}`}>
      {onBook ? (
        <button type="button" onClick={onBook} className={primary}>
          Schedule a consultation
        </button>
      ) : null}
      <a href={`mailto:${site.email}?subject=HassAz Tech Hub corporate partnership`} className={secondary}>
        Write to {site.email}
      </a>
      <Link to="/contact" className={secondary}>
        Contact Us
      </Link>
    </div>
  );
}
