export const COHORT_OPTIONS = ["Cohort 1", "Cohort 2", "Cohort 3"];

export const INTAKE_OPTIONS = [
  { month: 0, name: "January" },
  { month: 5, name: "June" },
  { month: 11, name: "December" },
];

export function monthForCohort(cohort) {
  if (cohort === "Cohort 1") return 0;
  if (cohort === "Cohort 2") return 5;
  if (cohort === "Cohort 3") return 11;
  return null;
}

export function nameForMonth(month) {
  return INTAKE_OPTIONS.find((item) => item.month === Number(month))?.name || "";
}

export function monthForName(name) {
  const match = INTAKE_OPTIONS.find((item) => item.name.toLowerCase() === String(name || "").trim().toLowerCase());
  return match ? match.month : null;
}

export function cohortForMonth(month) {
  if (Number(month) === 0) return "Cohort 1";
  if (Number(month) === 5) return "Cohort 2";
  if (Number(month) === 11) return "Cohort 3";
  return "Cohort 1";
}

export function yearOptions(selected) {
  const now = new Date().getFullYear();
  const years = [now - 1, now, now + 1, now + 2];
  const extra = Number(selected);
  if (Number.isInteger(extra) && extra >= 2000 && extra <= 2100 && !years.includes(extra)) {
    years.push(extra);
  }
  return years.sort((a, b) => a - b).map(String);
}
