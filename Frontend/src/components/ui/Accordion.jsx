import { useState } from "react";

export default function Accordion({ items }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const active = open === index;
        return (
          <div
            key={item.title}
            className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              onClick={() => setOpen(active ? -1 : index)}
              aria-expanded={active}
            >
              <span className={`font-heading text-base font-bold sm:text-lg ${active ? "text-gold" : "text-navy"}`}>
                {item.title}
              </span>
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-lg leading-none text-white">
                {active ? "−" : "+"}
              </span>
            </button>
            {active ? (
              <div className="border-t border-navy/5 px-5 pt-3 pb-5 text-sm leading-7 text-muted">
                {item.body ? <p>{item.body}</p> : null}
                {item.items?.length ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {item.items.map((entry) => (
                      <li key={entry}>{entry}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
