function addPracticeEntry(instInput, minsInput, dateInput) {
  const instrument = instInput.value.trim();
  const minutes = parseInt(minsInput.value, 10);
  if (!instrument || !minutes || minutes <= 0) return;
  const child = activeChild();
  if (!child.practiceLog) child.practiceLog = [];
  child.practiceLog.push({ id: uid(), instrument, minutes, actualMinutes: minutes, date: dateInput.value || new Date().toISOString().slice(0,10), done: false });
  instInput.value = ''; minsInput.value = ''; dateInput.value = '';
  persistChild(child); render();
}

function togglePracticeEntry(entryId) {
  const child = activeChild();
  const e = child.practiceLog.find(e => e.id === entryId);
  e.done = !e.done;
  persistChild(child); render();
}

function updateActualMinutes(entryId, value) {
  const child = activeChild();
  if (!child) return;
  const e = child.practiceLog.find(e => e.id === entryId);
  if (!e) return;
  if (value === '' || value === null) {
    e.actualMinutes = null;
  } else {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 0) return;
    e.actualMinutes = n;
  }
  persistChild(child); render();
}

function deletePracticeEntry(entryId) {
  const child = activeChild();
  if (!child || !canManageChild(child)) return;
  child.practiceLog = child.practiceLog.filter(e => e.id !== entryId);
  persistChild(child); render();
}

function handleAddPracticeClick() {
  const row = document.getElementById('practice-add-row');
  const instInput = row.querySelector('input[type=text]');
  const minsInput = row.querySelector('input[type=number]');
  const dateInput = row.querySelector('input[type=date]');
  addPracticeEntry(instInput, minsInput, dateInput);
}
// Lets an admin/owner queue up the next week's practice goal items ahead of
// time, instead of waiting for the calendar to roll over. Finds the
// furthest-out week already queued (or the current week if none), and adds
// one more week's worth of items after that.
function addNextWeek(childId) {
  const child = state.children.find(c => c.id === childId);
  if (!child || !isAdminOrLocal()) return;
  if (!child.practiceGoal) child.practiceGoal = { minutes: 30, timesPerWeek: 1 };
  if (!child.practiceLog) child.practiceLog = [];

  const currentWk = weekKeyFor(child);
  let latestWk = currentWk;
  child.practiceLog.forEach(e => {
    if (e.auto && e.weekKey && e.weekKey > latestWk) latestWk = e.weekKey;
  });

  const nextDate = new Date(latestWk + 'T00:00:00');
  nextDate.setDate(nextDate.getDate() + 7);
  const nextWk = nextDate.toISOString().slice(0, 10);

  for (let i = 0; i < child.practiceGoal.timesPerWeek; i++) {
    child.practiceLog.push({
      id: uid(),
      instrument: 'Practice',
      minutes: child.practiceGoal.minutes,
      actualMinutes: null,
      date: nextWk,
      done: false,
      auto: true,
      weekKey: nextWk
    });
  }
  persistChild(child); render();
}

// Admin picks which date the week should be considered to start on; that
// date's weekday becomes the recurring anchor (e.g. picking a Monday makes
// every week start on Monday from then on).
function updateWeekStart(childId, value) {
  const child = state.children.find(c => c.id === childId);
  if (!child || !canManageChild(child) || !value) return;
  child.weekStart = value;
  regenerateWeeklyDefaults(child);
  persistChild(child); render();
}

function updateEntryDate(entryId, value) {
  const child = activeChild();
  if (!child || !canManageChild(child) || !value) return;
  const e = child.practiceLog.find(e => e.id === entryId);
  if (!e) return;
  e.date = value;
  persistChild(child); render();
}
