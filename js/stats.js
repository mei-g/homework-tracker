function subjectProgress(subject) {
  const total = subject.assignments.length;
  const done = subject.assignments.filter(a => a.done).length;
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}

function childProgress(child) {
  let total = 0, done = 0;
  child.subjects.forEach(s => {
    total += s.assignments.length;
    done += s.assignments.filter(a => a.done).length;
  });
  (child.practiceLog || []).forEach(e => {
    total += 1;
    if (e.done) done += 1;
  });
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}

function weekPracticeMinutes(child) {
  const log = child.practiceLog || [];
  const startOfWeek = getWeekStartDate(child);
  return log.reduce((sum, e) => {
    if (!e.date || !e.done) return sum;
    const d = new Date(e.date + 'T00:00:00');
    if (d < startOfWeek) return sum;
    const amount = (e.actualMinutes !== null && e.actualMinutes !== undefined && e.actualMinutes !== '') ? Number(e.actualMinutes) : e.minutes;
    return sum + amount;
  }, 0);
}
function totalPracticeMinutes(child) {
  return (child.practiceLog || []).reduce((sum, e) => {
    if (!e.done) return sum;
    const amount = (e.actualMinutes !== null && e.actualMinutes !== undefined && e.actualMinutes !== '') ? Number(e.actualMinutes) : e.minutes;
    return sum + amount;
  }, 0);
}

function fmtDuration(totalMins) {
  const hrs = Math.floor(totalMins / 60), mins = totalMins % 60;
  return hrs ? `${hrs}h ${mins}m` : `${mins}m`;
}
