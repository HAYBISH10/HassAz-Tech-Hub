export function buildSlotsByDate(config) {
  if (!config?.openWeekdays || !config?.times) return {};
  const now = new Date();
  const slotsByDate = {};
  const days = (config.weeksAhead || 8) * 7;

  for (let i = 1; i <= days; i += 1) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(now.getDate() + i);
    if (!config.openWeekdays.includes(date.getDay())) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    slotsByDate[key] = config.times;
  }

  return slotsByDate;
}
