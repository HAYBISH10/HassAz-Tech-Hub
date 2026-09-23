import { useState } from "react";
import { Link } from "react-router-dom";
import { useApplicationWindow } from "../../context/ApplicationWindowContext";

export default function ApplyCta({
  to = "/apply",
  className = "",
  children,
  closedLabel = "Applications Closed",
  category = "",
  program = "",
}) {
  const { isOpen, loading, isCourseOpen } = useApplicationWindow();
  const open = category || program ? isCourseOpen(category, program) : isOpen;

  if (!loading && !open) {
    return (
      <span
        aria-disabled="true"
        title="HassAz Tech Hub applications are currently closed."
        className={`${className} pointer-events-none cursor-not-allowed opacity-50`}
      >
        {closedLabel}
      </span>
    );
  }

  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}
