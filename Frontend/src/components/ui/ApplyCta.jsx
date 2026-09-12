import { useState } from "react";
import { Link } from "react-router-dom";
import { useApplicationWindow } from "../../context/ApplicationWindowContext";
import { useUserAuth } from "../../context/UserAuthContext";

/**
 * A "Apply" call-to-action that is aware of the admin-controlled application window
 * and student authentication. Visitors are asked to sign up or log in before they
 * can reach the application or course-registration form.
 */
export default function ApplyCta({ to = "/apply", className = "", children, closedLabel = "Applications Closed" }) {
  const { isOpen, loading } = useApplicationWindow();
  const { isLoggedIn } = useUserAuth();
  const [showGate, setShowGate] = useState(false);

  if (!loading && !isOpen) {
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

  if (isLoggedIn) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }

  if (showGate) {
    return (
      <div className="rounded-2xl border border-navy/10 bg-white p-5 text-left shadow-sm">
        <p className="text-sm font-semibold text-gold">Course Registration</p>
        <h3 className="font-heading mt-1 text-lg font-bold text-navy">Please sign up or log in</h3>
        <p className="mt-2 text-sm leading-6 text-muted">
          Please create an account or log in before registering for a course.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`/register?next=${encodeURIComponent(to)}`} className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white">
            Sign Up
          </Link>
          <Link to={`/login?next=${encodeURIComponent(to)}`} className="rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold text-navy">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <button type="button" onClick={() => setShowGate(true)} className={className}>
      {children}
    </button>
  );
}
