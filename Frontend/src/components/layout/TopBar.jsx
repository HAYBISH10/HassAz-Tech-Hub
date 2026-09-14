import Countdown from "../ui/Countdown";
import ApplyCta from "../ui/ApplyCta";
import { useApplicationWindow } from "../../context/ApplicationWindowContext";

const openMessage = "New intake alert! HassAz Tech Hub bootcamps are now open";
const closedMessage =
  "New intake alert! HassAz Tech Hub bootcamps are now closed for Application Kindly Keep your eye on our Site";

export default function TopBar() {
  const { isOpen, globalOpen, openAt, closeAt, reason, refresh, openSummary } = useApplicationWindow();
  const partial = isOpen && !globalOpen;

  return (
    <div className="w-full bg-navy-dark px-3 py-2 text-center text-[11px] leading-5 text-white sm:px-5 sm:text-[13px]">
      {isOpen ? (
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span>
            {partial
              ? `New intake alert! ${[...(openSummary?.areas || []), ...(openSummary?.courses || [])].join(", ") || "Selected courses"} ${
                  (openSummary?.areas || []).length + (openSummary?.courses || []).length === 1 ? "is" : "are"
                } now open`
              : openMessage}
          </span>
          <span className="hidden sm:inline">—</span>
          <ApplyCta className="font-semibold text-gold underline">Apply now</ApplyCta>
          {closeAt ? (
            <span className="flex items-center gap-1.5">
              <span className="text-white/70">· Applications close in:</span>
              <Countdown target={closeAt} className="text-gold" onReached={refresh} />
            </span>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span>{closedMessage}</span>
          {reason === "not-yet-open" && openAt ? (
            <span className="flex items-center gap-1.5">
              <span className="text-white/70">· Opens in:</span>
              <Countdown target={openAt} className="text-gold" onReached={refresh} />
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
