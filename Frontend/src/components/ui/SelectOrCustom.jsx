import { useEffect, useState } from "react";

const CUSTOM = "__custom__";

export default function SelectOrCustom({
  label,
  value = "",
  onChange,
  options = [],
  placeholder = "Choose…",
  allowCustom = true,
  customPlaceholder = "Type your own",
}) {
  const normalized = options.map((item) =>
    typeof item === "string" || typeof item === "number"
      ? { value: String(item), label: String(item) }
      : { value: String(item.value), label: item.label }
  );
  const values = normalized.map((item) => item.value);
  const inList = Boolean(value) && values.includes(String(value));
  const [mode, setMode] = useState(!inList && value ? "custom" : "select");

  useEffect(() => {
    if (inList) setMode("select");
    else if (value) setMode("custom");
  }, [inList, value]);

  const selectValue = mode === "custom" ? CUSTOM : String(value || "");

  return (
    <label className="block">
      {label ? (
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">{label}</span>
      ) : null}
      <select
        value={selectValue}
        onChange={(event) => {
          const next = event.target.value;
          if (next === CUSTOM) {
            setMode("custom");
            if (inList) onChange("");
            return;
          }
          setMode("select");
          onChange(next);
        }}
        className="w-full rounded-md border border-navy/15 px-3 py-2 text-sm"
      >
        <option value="">{placeholder}</option>
        {normalized.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
        {allowCustom ? <option value={CUSTOM}>Write my own…</option> : null}
      </select>
      {mode === "custom" ? (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={customPlaceholder}
          className="mt-2 w-full rounded-md border border-navy/15 px-3 py-2 text-sm"
        />
      ) : null}
    </label>
  );
}
