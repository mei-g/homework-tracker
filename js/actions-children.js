// ---- actions ----
function confirmDeleteChild(id) {
  const child = state.children.find(c => c.id === id);
  if (!child || !canManageChild(child)) return;
  modal = { type: 'deleteChild', childId: id, name: child.name };
  render();
}

function performDeleteChild() {
  const id = modal.childId;
  state.children = state.children.filter(c => c.id !== id);
  if (state.activeChildId === id) {
    state.activeChildId = state.children.length ? state.children[0].id : null;
  }
  modal = null;
  removeChildDoc(id); render();
}

function confirmDeleteSubject(subjectId) {
  const child = activeChild();
  if (!child || !canManageChild(child)) return;
  const subject = child.subjects.find(s => s.id === subjectId);
  if (!subject) return;
  modal = { type: 'deleteSubject', childId: child.id, subjectId, name: subject.name };
  render();
}

function performDeleteSubject() {
  const child = state.children.find(c => c.id === modal.childId);
  if (!child || !canManageChild(child)) { modal = null; render(); return; }
  child.subjects = child.subjects.filter(s => s.id !== modal.subjectId);
  modal = null;
  persistChild(child); render();
}

function selectChild(id) { state.activeChildId = id; render(); }

// Filters the child tabs live as you type, without a full re-render (which
// would otherwise steal focus from the input on every keystroke). Scales
// fine to a couple hundred children since it's just DOM show/hide.
function updateChildFilter(value) {
  childFilter = value;
  const needle = value.trim().toLowerCase();
  document.querySelectorAll('.kid-tab').forEach(el => {
    const name = el.getAttribute('data-name') || '';
    el.style.display = (!needle || name.includes(needle)) ? '' : 'none';
  });
}

function openAddChild() { modal = { type: 'child', name: '', color: COLORS[state.children.length % COLORS.length] }; render(); }
function openAddSubject() { if (!canManageChild(activeChild())) return; modal = { type: 'subject', name: '', color: COLORS[(activeChild()?.subjects.length || 0) % COLORS.length] }; render(); }
function closeModal() { modal = null; render(); }

function saveModal() {
  if (!modal.name.trim()) return;
  if (modal.type === 'subject' && !canManageChild(activeChild())) { modal = null; render(); return; }
  if (modal.type === 'child') {
    const child = {
      id: uid(),
      name: modal.name.trim(),
      color: modal.color,
      subjects: [],
      practiceLog: [],
      practiceGoal: { minutes: 30, timesPerWeek: 1 },
      ownerId: USE_FIREBASE ? currentUser.uid : 'local'
    };
    ensureWeeklyDefaults(child);
    state.children.push(child);
    state.activeChildId = child.id;
    modal = null;
    persistChild(child); render();
    return;
  } else if (modal.type === 'subject') {
    const child = activeChild();
    if (child) {
      child.subjects.push({ id: uid(), name: modal.name.trim(), color: modal.color, assignments: [] });
      modal = null;
      persistChild(child); render();
      return;
    }
  }
  modal = null;
  render();
}

function openEditGoal(childId) {
  const child = state.children.find(c => c.id === childId);
  if (!child || !isAdminOrLocal()) return;
  if (!child.practiceGoal) child.practiceGoal = { minutes: 30, timesPerWeek: 1 };
  modal = { type: 'practiceGoal', childId, minutes: child.practiceGoal.minutes, timesPerWeek: child.practiceGoal.timesPerWeek };
  render();
}

function saveGoalModal() {
  const child = state.children.find(c => c.id === modal.childId);
  const minutes = parseInt(modal.minutes, 10);
  const timesPerWeek = parseInt(modal.timesPerWeek, 10);
  if (!child || !isAdminOrLocal() || !minutes || minutes <= 0 || !timesPerWeek || timesPerWeek <= 0) return;
  child.practiceGoal = { minutes, timesPerWeek };
  regenerateWeeklyDefaults(child);
  modal = null;
  persistChild(child); render();
}
