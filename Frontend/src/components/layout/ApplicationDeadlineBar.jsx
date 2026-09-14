import Countdown from "../ui/Countdown";
import { useApplicationWindow } from "../../context/ApplicationWindowContext";

export default function ApplicationDeadlineBar() {
  const { isOpen, globalOpen, openAt, closeAt, reason, loading, refresh } = useApplicationWindow();

  if (loading) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-navy px-4 py-2 text-center text-[11px] leading-5 text-white shadow-[0_-4px_16px_rgba(0,0,0,0.15)] sm:py-2.5 sm:text-xs">
      {isOpen && closeAt ? (
        <p className="flex flex-wrap items-center justify-center gap-2 text-white/90">
          <span className="font-semibold">HassAz Tech Hub Application deadline in:</span>
          <Countdown target={closeAt} className="text-red-400" onReached={refresh} />
        </p>
      ) : !isOpen && reason === "not-yet-open" && openAt ? (
        <p className="flex flex-wrap items-center justify-center gap-2 text-white/90">
          <span className="font-semibold">HassAz Tech Hub Applications open in:</span>
          <Countdown target={openAt} className="text-gold" onReached={refresh} />
        </p>
      ) : !isOpen ? (
        <p className="text-white/90">
          <span className="font-semibold">No application windows that are open,</span> Kindly Contact Academic
          Director For HassAz Tech Hub
        </p>
      ) : (
        <p className="text-white/70">
          {globalOpen ? "Course applications are open — no closing date set." : "Selected courses are open for application."}
        </p>
      )}
    </div>
  );
}
