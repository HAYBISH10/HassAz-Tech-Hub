import { Link } from "react-router-dom";
import { useSite } from "../../hooks/useContent";
import Typewriter from "../ui/Typewriter";

const modeIcons = {
  "full-time": (
    <svg viewBox="0 0 24 24" className="h-7 w-7 sm:h-8 sm:w-8" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </svg>
  ),
  "part-time": (
    <svg viewBox="0 0 24 24" className="h-7 w-7 sm:h-8 sm:w-8" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" strokeDasharray="4 3" />
      <path d="M12 8v4" />
    </svg>
  ),
  remote: (
    <svg viewBox="0 0 24 24" className="h-7 w-7 sm:h-8 sm:w-8" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19h16M6 19V7l6-3 6 3v12" />
      <path d="M9 11h6M9 14h6" />
    </svg>
  ),
  "in-person": (
    <svg viewBox="0 0 24 24" className="h-7 w-7 sm:h-8 sm:w-8" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path d="M8 21h8" />
    </svg>
  ),
};

export default function Hero({ onBook }) {
  const site = useSite();
  const hero = site.hero || {};
  const modes = site.learningModes || [];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#f6edd2] via-white to-white">
      <img
        src={hero.logoSrc}
        alt=""
        className="pointer-events-none absolute inset-0 m-auto h-[70%] w-[70%] max-w-lg object-contain opacity-[0.10] sm:w-[60%] sm:max-w-3xl"
      />
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 pt-12 pb-20 text-center sm:px-6 sm:pt-20 sm:pb-16">
        <p className="min-h-[1.6em] font-heading text-lg font-bold text-gold sm:text-2xl">
          <Typewriter text="Welcome to HassAz Tech Hub" />
        </p>
        <h1 className="mt-2 font-heading text-[1.7rem] leading-tight font-bold text-navy sm:text-4xl md:text-5xl">
          {hero.title}
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-navy/80 sm:mt-6 sm:text-base sm:leading-8 md:text-lg">
          {hero.text}
        </p>
        <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-4">
          <Link
            to="/courses"
            className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-white hover:bg-gold-dark sm:px-8 sm:text-base"
          >
            Explore Our Courses
          </Link>
          <button
            type="button"
            onClick={onBook}
            className="rounded-full border-2 border-navy px-6 py-3 text-sm font-semibold text-navy hover:bg-navy hover:text-white sm:px-8 sm:text-base"
          >
            Book for Calls
          </button>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 text-gold sm:mt-12 sm:grid-cols-4 sm:gap-6">
          {modes.map((mode) => (
            <div key={mode.id} className="flex flex-col items-center gap-2">
              {modeIcons[mode.id]}
              <p className="text-[11px] font-semibold sm:text-sm">{mode.label}</p>
            </div>
          ))}
        </div>
      </div>
      <svg viewBox="0 0 1440 80" className="relative z-10 -mb-px block w-full text-white" aria-hidden="true">
        <path fill="currentColor" d="M0,40 C360,90 1080,-10 1440,40 L1440,80 L0,80 Z" />
      </svg>
    </section>
  );
}
