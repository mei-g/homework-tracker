// Returns the Date (midnight) that this child's current week starts on.
// The weekday used as "start of week" comes from child.weekStart (an anchor
// date an admin can pick); defaults to Sunday if never set.
function getWeekStartDate(child, refDate = new Date()) {
  const anchorWeekday = child.weekStart ? new Date(child.weekStart + 'T00:00:00').getDay() : 0;
  const d = new Date(refDate);
  d.setHours(0, 0, 0, 0);
  let diff = d.getDay() - anchorWeekday;
  if (diff < 0) diff += 7;
  d.setDate(d.getDate() - diff);
  return d;
}

// Stable key identifying a child's current week (the date it starts on).
function weekKeyFor(child, refDate = new Date()) {
  return getWeekStartDate(child, refDate).toISOString().slice(0, 10);
}

// ISO-8601 week number, for the "Week N" label.
function isoWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}
