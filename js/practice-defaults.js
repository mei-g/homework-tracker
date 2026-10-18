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
    child.practiceLog.push({
      id: uid(),
      instrument: 'Practice',
      minutes: child.practiceGoal.minutes,
      actualMinutes: null,
      date: wk,
      done: false,
      auto: true,
      weekKey: wk
    });
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
    child.practiceLog.push({
      id: uid(),
      instrument: 'Practice',
      minutes: child.practiceGoal.minutes,
      actualMinutes: null,
      date: wk,
      done: false,
      auto: true,
      weekKey: wk
    });
  }
}
