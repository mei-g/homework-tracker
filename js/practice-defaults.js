// Date (YYYY-MM-DD) for the Nth of `total` goal sessions in the week that
// starts on weekKey, spread evenly so they fall on different days
// (e.g. 3 sessions -> day 1, 3 and 5 of the week). More than 7 sessions
// necessarily share days.
function sessionDate(weekKey, index, total) {
  const offset = Math.min(6, Math.floor(index * 7 / Math.max(1, total)));
  const d = new Date(weekKey + 'T00:00:00');
  d.setDate(d.getDate() + offset);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// Builds goal session number `index` (0-based) of the week starting weekKey.
function makeWeeklyEntry(child, weekKey, index) {
  return {
    id: uid(),
    instrument: 'Practice',
    minutes: child.practiceGoal.minutes,
    actualMinutes: null,
    date: sessionDate(weekKey, index, child.practiceGoal.timesPerWeek),
    done: false,
    auto: true,
    weekKey
  };
}

// Makes sure this child has enough auto-generated practice items for the
// current week, based on their practice goal. Returns true if it added any
// (so the caller knows whether to persist the change).
function ensureWeeklyDefaults(child) {
  if (!child.practiceGoal) child.practiceGoal = { minutes: 30, timesPerWeek: 1 };
  if (!child.practiceLog) child.practiceLog = [];
  const wk = weekKeyFor(child);
  const existing = child.practiceLog.filter(e => e.auto && e.weekKey === wk).length;
  const need = child.practiceGoal.timesPerWeek - existing;
  let changed = false;
  for (let i = 0; i < need; i++) {
    child.practiceLog.push(makeWeeklyEntry(child, wk, existing + i));
    changed = true;
  }
  return changed;
}

// Called right after an admin edits the goal (or moves the week-start
// anchor): drops this week's not-yet-done auto items and rebuilds them to
// match, leaving already-completed sessions untouched.
function regenerateWeeklyDefaults(child) {
  const wk = weekKeyFor(child);
  child.practiceLog = child.practiceLog.filter(e => !(e.auto && e.weekKey === wk && !e.done));
  const doneCount = child.practiceLog.filter(e => e.auto && e.weekKey === wk && e.done).length;
  const need = Math.max(0, child.practiceGoal.timesPerWeek - doneCount);
  for (let i = 0; i < need; i++) {
    child.practiceLog.push(makeWeeklyEntry(child, wk, doneCount + i));
  }
}
