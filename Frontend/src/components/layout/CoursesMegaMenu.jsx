import { useState } from "react";
import { Link } from "react-router-dom";
import { useCatalog } from "../../hooks/useContent";

export default function CoursesMegaMenu({ onNavigate }) {
  const catalog = useCatalog();
  const [active, setActive] = useState(0);
  const category = catalog[active] || catalog[0];

  if (!category) return null;

  return (
    <div className="courses-mega mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr_1.2fr] lg:gap-8 lg:px-8">
      <ul className="border-navy/10 lg:border-r lg:pr-4">
        {catalog.map((item, index) => (
          <li key={item.slug}>
            <button
              type="button"
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              className={`flex w-full items-center border-l-4 px-3 py-3 text-left text-sm font-semibold ${
                index === active
                  ? "border-gold bg-[#f7f3e8] text-navy"
                  : "border-transparent text-navy hover:bg-soft"
              }`}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ul>

      <div>
        <h3 className="font-heading text-xl font-bold text-navy">{category.title}</h3>
        <p className="mt-3 text-sm leading-6 text-muted">{category.summary}</p>
        <Link
          to={`/courses/${category.slug}`}
          onClick={onNavigate}
          className="mt-4 inline-block text-sm font-semibold text-gold"
        >
          View all {category.title} programs
        </Link>
      </div>

      <div>
        <p className="text-sm font-bold text-gold">Course Offerings</p>
        <ul className="mt-3 space-y-4">
          {category.programs.map((program) => (
            <li key={program.slug}>
              <Link
                to={`/courses/${category.slug}/${program.slug}`}
                onClick={onNavigate}
                className="font-heading text-sm font-bold text-navy underline decoration-navy/30 underline-offset-2 hover:text-gold hover:decoration-gold"
              >
                {program.title}
              </Link>
              <p className="mt-1 text-xs leading-5 text-muted">
                {program.modes.map((mode) => mode.label).join(", ")}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
