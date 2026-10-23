function renderPracticeEntryRow(e, canEdit) {
  return `
    <div class="practice-entry ${e.done ? 'done' : ''}">
      <input type="checkbox" ${e.done ? 'checked' : ''} onchange="togglePracticeEntry('${e.id}')">
      <span class="inst">${escapeHtml(e.instrument)}${e.auto ? '<span class="auto-tag">Weekly goal</span>' : ''}</span>
      <span class="mins">${e.auto ? 'Goal ' : ''}${e.minutes}m</span>
      <input type="number" class="actual-input" min="0" placeholder="Actual" title="Actual minutes practiced" value="${e.actualMinutes ?? ''}" onchange="updateActualMinutes('${e.id}', this.value)">
      ${canEdit
        ? `<input type="date" class="entry-date" value="${e.date || ''}" onchange="updateEntryDate('${e.id}', this.value)">`
        : `<span class="pdate">${formatDate(e.date)}</span>`}
      ${canEdit ? `<button class="del" onclick="deletePracticeEntry('${e.id}')">Remove</button>` : ''}
    </div>
  `;
}

function renderPractice(child) {
  const log = [...(child.practiceLog || [])].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const goal = child.practiceGoal || { minutes: 30, timesPerWeek: 1 };
  const goalLabel = `Goal: ${goal.timesPerWeek}× ${goal.minutes} min / week`;
  const canEdit = canManageChild(child);
  const canAdmin = isAdminOrLocal();
  const editBtn = canAdmin ? `<button class="edit-goal-btn" onclick="openEditGoal('${child.id}')">Edit goal</button>` : '';

  // Group entries by the week they fall in (using this child's week-start
  // anchor), each under a clear separator naming that week's start date.
  const weekGroups = [];
  const indexByWeek = {};
  log.forEach(e => {
    const wk = e.date ? weekKeyFor(child, new Date(e.date + 'T00:00:00')) : 'undated';
    if (!(wk in indexByWeek)) {
      indexByWeek[wk] = weekGroups.length;
      weekGroups.push({ wk, entries: [] });
    }
    weekGroups[indexByWeek[wk]].entries.push(e);
  });

  const logHtml = weekGroups.length
    ? weekGroups.map((g, i) => `
        <div class="week-separator ${i === 0 ? 'first' : ''}">${g.wk === 'undated' ? 'No date' : 'Week of ' + formatDate(g.wk)}</div>
        ${g.entries.map(e => renderPracticeEntryRow(e, canEdit)).join('')}
      `).join('')
    : '<div style="color:var(--ink-soft); font-size:13.5px; padding:6px 0;">No practice logged yet.</div>';

  return `
    <div class="practice-card">
      <div class="practice-head">
        <h3>Instrument practice</h3>
      </div>
      <div class="practice-goal-row">
        <span class="practice-goal-label">${goalLabel}</span>
        ${editBtn}
      </div>
      ${logHtml}
      <div class="practice-add-row" id="practice-add-row">
        <input type="text" placeholder="Instrument">
        <input type="number" placeholder="Min" min="1">
        <input type="date">
        <button onclick="handleAddPracticeClick()">Log</button>
      </div>
    </div>
  `;
}
