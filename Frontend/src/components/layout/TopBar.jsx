import { useEffect, useState } from "react";
import Countdown from "../ui/Countdown";
import ApplyCta from "../ui/ApplyCta";
import { useApplicationWindow } from "../../context/ApplicationWindowContext";

const openMessage = "New intake alert! HIACDI Tech Hub bootcamps are now open";
const closedMessage =
  "New intake alert! HIACDI Tech Hub bootcamps are now closed for Application Kindly Keep your eye on our Site";

export default function TopBar() {
  const { isOpen, globalOpen, openAt, closeAt, reason, refresh, openSummary } = useApplicationWindow();
  const [showClose, setShowClose] = useState(false);
  const partial = isOpen && !globalOpen;
  const canRotate = Boolean(isOpen && closeAt);

  useEffect(() => {
    if (!canRotate) {
      setShowClose(false);
      return undefined;
    }
    const id = setInterval(() => setShowClose((current) => !current), 4500);
    return () => clearInterval(id);
  }, [canRotate]);

  const headline = partial
    ? `New intake alert! ${[...(openSummary?.areas || []), ...(openSummary?.courses || [])].join(", ") || "Selected courses"} ${
        (openSummary?.areas || []).length + (openSummary?.courses || []).length === 1 ? "is" : "are"
      } now open`
    : openMessage;

  return (
    <div className="w-full overflow-hidden bg-navy-dark px-3 py-2 text-center text-[11px] leading-5 text-white sm:px-5 sm:text-[13px]">
      {isOpen ? (
        <div className="relative mx-auto min-h-5">
          <p
            className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1 transition-all duration-500 ${
              showClose ? "pointer-events-none -translate-y-5 opacity-0" : "translate-y-0 opacity-100"
            }`}
          >
            <span>{headline}</span>
            <span className="hidden sm:inline">·</span>
            <ApplyCta className="font-semibold text-gold underline">Apply now</ApplyCta>
          </p>
          {closeAt ? (
            <p
              className={`absolute inset-x-0 top-0 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 transition-all duration-500 ${
                showClose ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0"
              }`}
            >
              <span>Applications close in:</span>
              <Countdown target={closeAt} size="sm" warnAtDays={5} className="text-gold" onReached={refresh} />
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span>{closedMessage}</span>
          {reason === "not-yet-open" && openAt ? (
            <span className="flex items-center gap-1.5">
              <span className="text-white/70">· Opens in:</span>
              <Countdown target={openAt} size="sm" className="text-gold" onReached={refresh} />
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
