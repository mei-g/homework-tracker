function activeChild() {
  return state.children.find(c => c.id === state.activeChildId) || null;
}
// ---- render ----
function render() {
  const app = document.getElementById('app');

  if (USE_FIREBASE && !currentUser) {
    tour = null;
    app.innerHTML = renderAuthScreen();
    return;
  }

  advanceTourIfDone();
  maybeShowTutorial();

  const child = activeChild();

  const accountHtml = `
    <div class="header-meta">
      <button class="tutorial-btn" onclick="openTutorial()">? Tutorial</button>
      ${USE_FIREBASE ? `
        <span class="role-badge ${currentRole === 'admin' ? 'admin' : ''}">${currentRole}</span>
        <button class="signout-btn" onclick="signOutUser()">Sign out</button>
      ` : ''}
    </div>
  `;

  let html = `
    <header class="top">
      <div>
        <h1>Homeroom</h1>
        <p>${currentRole === 'admin' ? 'Track assignments across every child.' : 'Track assignments for the children you\'ve added.'}</p>
      </div>
      ${accountHtml}
    </header>

    ${saveError ? `
      <div class="error-banner">
        <span>${escapeHtml(saveError)}</span>
        <button onclick="dismissSaveError()" title="Dismiss">×</button>
      </div>
    ` : ''}

    ${state.children.length >= 7 ? `
      <div class="kid-finder-row">
        <input type="text" class="kid-filter" placeholder="Filter children by name…" value="${escapeHtml(childFilter)}" oninput="updateChildFilter(this.value)">
        <select class="kid-jump" onchange="if(this.value) selectChild(this.value)">
          <option value="">Jump to child…</option>
          ${state.children.map(c => `<option value="${c.id}" ${c.id === state.activeChildId ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
        </select>
      </div>
    ` : ''}

    <div class="kids-row">
      ${state.children.filter(c => !childFilter || c.name.toLowerCase().includes(childFilter.toLowerCase())).map(c => {
        const p = childProgress(c);
        const delBtn = canManageChild(c)
          ? `<button class="kid-del" title="Delete ${escapeHtml(c.name)}" onclick="event.stopPropagation(); confirmDeleteChild('${c.id}')">×</button>`
          : '';
        return `<div class="kid-tab ${c.id === state.activeChildId ? 'active' : ''}" style="--kid-color:${c.color}" data-name="${escapeHtml(c.name.toLowerCase())}" onclick="selectChild('${c.id}')">
          <span class="kid-dot"></span>${escapeHtml(c.name)}
          <span class="kid-ring-num">${p.done}/${p.total}</span>
          ${delBtn}
        </div>`;
      }).join('')}
      <button class="add-kid-tab" onclick="openAddChild()">+ Add child</button>
    </div>
  `;

  if (!child) {
    html += `<div class="empty">Add a child to start tracking homework.</div>`;
  } else {
    const cp = childProgress(child);
    html += `
      <div class="overall" style="--kid-color:${child.color}">
        <div class="row"><h2>${escapeHtml(child.name)}'s overall progress</h2><span class="pct">${cp.pct}%</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${cp.pct}%"></div></div>
      </div>

      ${renderWeekCard(child)}

      ${renderPractice(child)}

      <div class="subjects">
        ${child.subjects.map(s => renderSubject(s)).join('')}
      </div>

      ${canManageChild(child) ? `<button class="add-subject-btn" onclick="openAddSubject()">+ Add subject</button>` : ''}
    `;
  }

  if (modal) html += renderModal();

  app.innerHTML = html + renderTour();
  applyTourHighlight();

  // wire up date min for new inputs not needed; wire enter key handlers
  document.querySelectorAll('.add-row input[type=text]').forEach(inp => {
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const btn = inp.closest('.add-row').querySelector('button');
        btn.click();
      }
    });
  });
}
