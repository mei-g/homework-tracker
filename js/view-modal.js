function renderModal() {
  if (modal.type === 'deleteChild') {
    return `
      <div class="modal-backdrop" onclick="if(event.target===this) closeModal()">
        <div class="modal">
          <h3>Delete ${escapeHtml(modal.name)}?</h3>
          <p style="font-size:13.5px; color:var(--ink-soft); margin:-4px 0 16px;">This removes all their subjects, assignments, and practice log. This can't be undone.</p>
          <div class="modal-actions">
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
            <button class="btn-save" style="background:var(--coral)" onclick="performDeleteChild()">Delete</button>
          </div>
        </div>
      </div>
    `;
  }
  if (modal.type === 'deleteSubject') {
    return `
      <div class="modal-backdrop" onclick="if(event.target===this) closeModal()">
        <div class="modal">
          <h3>Delete ${escapeHtml(modal.name)}?</h3>
          <p style="font-size:13.5px; color:var(--ink-soft); margin:-4px 0 16px;">This removes all its assignments. This can't be undone.</p>
          <div class="modal-actions">
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
            <button class="btn-save" style="background:var(--coral)" onclick="performDeleteSubject()">Delete</button>
          </div>
        </div>
      </div>
    `;
  }
  if (modal.type === 'practiceGoal') {
    return `
      <div class="modal-backdrop" onclick="if(event.target===this) closeModal()">
        <div class="modal">
          <h3>Weekly practice goal</h3>
          <div style="display:flex; gap:8px; margin-bottom:6px;">
            <div style="flex:1;">
              <label style="font-size:12px; color:var(--ink-soft); display:block; margin-bottom:4px;">Minutes per session</label>
              <input type="number" min="1" value="${modal.minutes}" oninput="modal.minutes=this.value" style="width:100%; padding:9px 10px; border:1px solid var(--line); border-radius:7px; font-size:14px; font-family:inherit;">
            </div>
            <div style="flex:1;">
              <label style="font-size:12px; color:var(--ink-soft); display:block; margin-bottom:4px;">Times per week</label>
              <input type="number" min="1" value="${modal.timesPerWeek}" oninput="modal.timesPerWeek=this.value" style="width:100%; padding:9px 10px; border:1px solid var(--line); border-radius:7px; font-size:14px; font-family:inherit;">
            </div>
          </div>
          <p style="font-size:12px; color:var(--ink-soft); margin:6px 0 14px;">Updates this week's remaining practice items to match. Already-completed sessions stay as they are.</p>
          <div class="modal-actions">
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
            <button class="btn-save" onclick="saveGoalModal()">Save</button>
          </div>
        </div>
      </div>
    `;
  }
  const isChild = modal.type === 'child';
  return `
    <div class="modal-backdrop" onclick="if(event.target===this) closeModal()">
      <div class="modal">
        <h3>${isChild ? 'Add a child' : 'Add a subject'}</h3>
        <input type="text" id="modal-name" placeholder="${isChild ? 'Name' : 'Subject name'}" value="${escapeHtml(modal.name)}" oninput="modal.name=this.value">
        <div class="swatches">
          ${COLORS.map(c => `<div class="swatch ${modal.color === c ? 'selected' : ''}" style="background:${c}" onclick="modal.color='${c}'; render(); document.getElementById('modal-name').focus();"></div>`).join('')}
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" onclick="closeModal()">Cancel</button>
          <button class="btn-save" onclick="saveModal()">Save</button>
        </div>
      </div>
    </div>
  `;
}
