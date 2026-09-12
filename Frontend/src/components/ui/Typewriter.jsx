import { useEffect, useState } from "react";

export default function Typewriter({
  text,
  className = "",
  typingSpeed = 85,
  deletingSpeed = 45,
  pauseAfterType = 1500,
  pauseAfterDelete = 500,
}) {
  const [display, setDisplay] = useState("");
  const [phase, setPhase] = useState("typing");

  useEffect(() => {
    let timeout;

    if (phase === "typing") {
      if (display.length < text.length) {
        timeout = setTimeout(() => setDisplay(text.slice(0, display.length + 1)), typingSpeed);
      } else {
        timeout = setTimeout(() => setPhase("deleting"), pauseAfterType);
      }
    } else {
      if (display.length > 0) {
        timeout = setTimeout(() => setDisplay(text.slice(0, display.length - 1)), deletingSpeed);
      } else {
        timeout = setTimeout(() => setPhase("typing"), pauseAfterDelete);
      }
    }

    return () => clearTimeout(timeout);
  }, [display, phase, text, typingSpeed, deletingSpeed, pauseAfterType, pauseAfterDelete]);

  return (
    <span className={className}>
      {display}
      <span className="typewriter-cursor" aria-hidden="true" />
    </span>
  );
}
