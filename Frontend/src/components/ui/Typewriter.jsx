import { useEffect, useState } from "react";

export default function Typewriter({
  text,
  segments,
  className = "",
  typingSpeed = 85,
  deletingSpeed = 45,
  pauseAfterType = 1500,
  pauseAfterDelete = 500,
}) {
  const fullText = segments ? segments.map((s) => s.text).join("") : text;
  const [display, setDisplay] = useState("");
  const [phase, setPhase] = useState("typing");

  useEffect(() => {
    let timeout;

    if (phase === "typing") {
      if (display.length < fullText.length) {
        timeout = setTimeout(() => setDisplay(fullText.slice(0, display.length + 1)), typingSpeed);
      } else {
        timeout = setTimeout(() => setPhase("deleting"), pauseAfterType);
      }
    } else {
      if (display.length > 0) {
        timeout = setTimeout(() => setDisplay(fullText.slice(0, display.length - 1)), deletingSpeed);
      } else {
        timeout = setTimeout(() => setPhase("typing"), pauseAfterDelete);
      }
    }

    return () => clearTimeout(timeout);
  }, [display, phase, fullText, typingSpeed, deletingSpeed, pauseAfterType, pauseAfterDelete]);

  let content = display;
  if (segments) {
    let remaining = display.length;
    content = segments.map((seg, i) => {
      if (remaining <= 0) return null;
      const part = seg.text.slice(0, remaining);
      remaining -= seg.text.length;
      return part ? (
        <span key={i} className={seg.className}>
          {part}
        </span>
      ) : null;
    });
  }

  return (
    <span className={className}>
      {content}
      <span className="typewriter-cursor" aria-hidden="true" />
    </span>
  );
}
