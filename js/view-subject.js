function renderSubject(subject) {
  const p = subjectProgress(subject);
  const sorted = [...subject.assignments].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
  });

  return `
    <div class="subject" style="--subj-color:${subject.color}">
      <div class="subject-tab">${escapeHtml(subject.name)}</div>
      <div class="subject-card">
        <div class="subject-head">
          <div class="bar-track" style="flex:1; margin-right:12px;"><div class="bar-fill" style="width:${p.pct}%; background:${subject.color}"></div></div>
          <span class="frac">${p.done}/${p.total}</span>
          ${canManageChild(activeChild()) ? `<button class="del subject-del" title="Delete ${escapeHtml(subject.name)}" onclick="confirmDeleteSubject('${subject.id}')">Remove subject</button>` : ''}
        </div>
        ${sorted.map(a => `
          <div class="assignment ${a.done ? 'done' : ''}">
            <input type="checkbox" ${a.done ? 'checked' : ''} onchange="toggleAssignment('${subject.id}','${a.id}')">
            <div style="flex:1">
              <span class="title">${escapeHtml(a.title)}</span>
              ${a.dueDate ? `<span class="due ${isOverdue(a.dueDate, a.done) ? 'overdue' : ''}">${isOverdue(a.dueDate, a.done) ? 'Overdue · ' : 'Due '}${formatDate(a.dueDate)}</span>` : ''}
            </div>
            ${canManageChild(activeChild()) ? `<button class="del" onclick="deleteAssignment('${subject.id}','${a.id}')">Remove</button>` : ''}
          </div>
        `).join('') || '<div style="color:var(--ink-soft); font-size:13.5px; padding:6px 0;">No assignments yet.</div>'}
        <div class="add-row" id="addrow-${subject.id}">
          <input type="text" placeholder="New assignment">
          <input type="date">
          <button onclick="handleAddClick('${subject.id}')">Add</button>
        </div>
      </div>
    </div>
  `;
}

function handleAddClick(subjectId) {
  const row = document.getElementById('addrow-' + subjectId);
  const titleInput = row.querySelector('input[type=text]');
  const dateInput = row.querySelector('input[type=date]');
  addAssignment(subjectId, titleInput, dateInput);
}
