import Countdown from "../ui/Countdown";
import { useApplicationWindow } from "../../context/ApplicationWindowContext";
import { site } from "../../data/site";

const closedMessage = "We're almost ready! Our application will be available soon. Thank you for your patience.";

export default function ApplicationDeadlineBar() {
  const { isOpen, globalOpen, closeAt, loading, refresh } = useApplicationWindow();

  if (loading) return null;

  if (!isOpen) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-40 w-full bg-navy-dark px-3 py-2 text-center text-[11px] leading-5 text-white sm:px-5 sm:text-[13px]">
        {closedMessage}
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="pointer-events-auto w-full max-w-2xl bg-[#5d7086] px-6 py-4 text-center text-[15px] leading-7 text-white shadow-[0_8px_28px_rgba(0,0,0,0.28)] sm:max-w-3xl sm:px-10 sm:py-5 sm:text-base sm:leading-8">
        <div className="flex flex-col items-center justify-center gap-1 sm:gap-1.5">
          {closeAt ? (
            <>
              <p>HassAz Tech Hub Application deadline in:</p>
              <Countdown target={closeAt} size="md" warnAtDays={5} className="text-gold" onReached={refresh} />
            </>
          ) : (
            <p>
              {globalOpen
                ? "Course applications are open. No closing date set."
                : "Selected courses are open for application."}
            </p>
          )}
        </div>
        <p className="mt-2 text-[13px] leading-6 text-white sm:text-sm">
          Copyright © {new Date().getFullYear()} | {site.name} | All Rights Reserved
        </p>
      </div>
    </div>
  );
}
