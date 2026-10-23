function renderWeekCard(child) {
  const canEdit = canManageChild(child);
  const canAdmin = isAdminOrLocal();
  const weekStartDate = getWeekStartDate(child);
  const weekStartKey = weekStartDate.toISOString().slice(0, 10);
  const weekNum = isoWeekNumber(weekStartDate);
  const weekPicker = canEdit
    ? `<input type="date" class="week-start-input" value="${weekStartKey}" onchange="updateWeekStart('${child.id}', this.value)">`
    : `<span class="practice-goal-label">Starts ${formatDate(weekStartKey)}</span>`;

  const futureWeeks = new Set(
    (child.practiceLog || []).filter(e => e.auto && e.weekKey && e.weekKey > weekStartKey).map(e => e.weekKey)
  ).size;
  const plannedAhead = futureWeeks
    ? `<span class="planned-ahead">${futureWeeks} week${futureWeeks > 1 ? 's' : ''} planned ahead</span>`
    : '';
  const addWeekBtn = canAdmin
    ? `<button class="add-week-btn" onclick="addNextWeek('${child.id}')" title="Queue up next week's practice goal now">+ Add week</button>`
    : '';

  return `
    <div class="practice-card week-card">
      <div class="practice-head">
        <h3>Week ${weekNum}</h3>
      </div>
      <div class="practice-week-row">
        <div class="practice-week-left">
          ${weekPicker}
          ${plannedAhead}
        </div>
        ${addWeekBtn}
      </div>
      <div class="week-stats-row">
        <div class="week-stat">
          <span class="week-stat-label">This week</span>
          <span class="week-stat-value">${fmtDuration(weekPracticeMinutes(child))}</span>
        </div>
        <div class="week-stat">
          <span class="week-stat-label">Overall</span>
          <span class="week-stat-value">${fmtDuration(totalPracticeMinutes(child))}</span>
        </div>
      </div>
    </div>
  `;
}
