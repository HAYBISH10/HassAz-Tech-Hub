import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCourses } from "../../hooks/useContent";
import { aboutLinks } from "../../data/about";
import { navLinks } from "../../data/site";

export default function SearchModal({ open, onClose }) {
  const courses = useCourses();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const pages = [...navLinks, ...aboutLinks].filter((link) =>
      link.label.toLowerCase().includes(q)
    );
    const courseHits = courses.filter(
      (course) =>
        course.title.toLowerCase().includes(q) ||
        course.summary.toLowerCase().includes(q) ||
        (course.category || "").toLowerCase().includes(q)
    );
    return { pages, courseHits };
  }, [query, courses]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-navy-dark/50 p-3 sm:p-4" onClick={onClose}>
      <div
        className="mx-auto mt-16 w-full max-w-xl rounded-xl bg-white p-4 shadow-2xl sm:mt-24 sm:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search courses, pages, and programs"
          className="w-full rounded-md border border-navy/15 px-4 py-3 outline-none focus:border-gold"
        />
        <div className="mt-4 max-h-72 space-y-2 overflow-auto text-sm">
          {!query.trim() ? (
            <p className="text-muted">Type to search HIACDI Tech Hub.</p>
          ) : (
            <>
              {results.pages.map((page) => (
                <Link
                  key={`${page.to}-${page.label}`}
                  to={page.to}
                  onClick={onClose}
                  className="block rounded-md px-3 py-2 hover:bg-soft"
                >
                  {page.label}
                </Link>
              ))}
              {results.courseHits.map((course) => (
                <Link
                  key={course.href || course.slug}
                  to={course.href || `/courses/${course.slug}`}
                  onClick={onClose}
                  className="block rounded-md px-3 py-2 hover:bg-soft"
                >
                  {course.title}
                </Link>
              ))}
              {!results.pages.length && !results.courseHits.length ? (
                <p className="text-muted">No matches found.</p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
