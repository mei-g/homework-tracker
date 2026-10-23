// First-run walkthrough for new accounts. Shown once per user per browser
// (remembered in localStorage) and reopenable from the "Tutorial" button.
const TUTORIAL_SEEN_KEY = 'homeroom-tutorial-seen-';

function tutorialUserKey() {
  return TUTORIAL_SEEN_KEY + (currentUser ? currentUser.uid : 'local');
}

function hasSeenTutorial() {
  try { return !!localStorage.getItem(tutorialUserKey()); } catch (e) { return true; }
}

function markTutorialSeen() {
  try { localStorage.setItem(tutorialUserKey(), '1'); } catch (e) { /* ignore */ }
}

function tutorialSteps() {
  const steps = [
    {
      title: 'Welcome to Homeroom',
      body: 'Homeroom tracks homework and instrument practice for each of your children. This quick tour takes about a minute.'
    },
    {
      title: '1. Add a child',
      body: 'Click <b>+ Add child</b> under the title, give them a name and pick a color. Each child gets a tab; click a tab to switch between children. The small <b>3/8</b> number on a tab shows items done out of total.'
    },
    {
      title: '2. Add subjects and assignments',
      body: 'With a child selected, click <b>+ Add subject</b> (Math, Reading…). Inside a subject, type an assignment, optionally pick a due date, and press <b>Add</b>. Tick the checkbox when it\'s finished. Overdue items turn red.'
    },
    {
      title: '3. Track weekly practice',
      body: 'The <b>Instrument practice</b> card has a weekly goal (for example 3 × 30 min). Goal sessions appear automatically each week. Tick a session when done and enter the <b>Actual</b> minutes. You can also log extra practice at the bottom. Use <b>Edit goal</b> to change the target.'
    },
    {
      title: '4. Weeks and progress',
      body: 'The <b>Week</b> card shows minutes practiced this week and overall. Pick a date to choose which weekday your week starts on, or use <b>+ Add week</b> to queue next week\'s sessions early. The bar at the top shows overall progress.'
    }
  ];
  if (USE_FIREBASE) {
    steps.push({
      title: '5. Admins and guests',
      body: currentRole === 'admin'
        ? 'You\'re an <b>admin</b>: you can see and manage every child, and only admins can edit practice goals and queue weeks. Anyone who signs up after you starts as a guest.'
        : 'You\'re a <b>guest</b>: you can add and fully manage the children you create. You can\'t see other families\' children. Ask an admin if you need more access.'
    });
  }
  steps.push({
    title: 'You\'re all set',
    body: 'Start by adding your first child. You can reopen this tour anytime with the <b>Tutorial</b> button at the top right.'
  });
  return steps;
}

// Called from render(): opens the tour automatically for first-time users.
function maybeShowTutorial() {
  if (modal || hasSeenTutorial()) return;
  markTutorialSeen();
  modal = { type: 'tutorial', step: 0 };
}

function openTutorial() { modal = { type: 'tutorial', step: 0 }; render(); }

function tutorialGo(delta) {
  const last = tutorialSteps().length - 1;
  modal.step = Math.max(0, Math.min(last, modal.step + delta));
  render();
}

function renderTutorialModal() {
  const steps = tutorialSteps();
  const i = Math.min(modal.step, steps.length - 1);
  const s = steps[i];
  const isLast = i === steps.length - 1;
  return `
    <div class="modal-backdrop" onclick="if(event.target===this) closeModal()">
      <div class="modal tutorial-modal">
        <div class="tutorial-count">Step ${i + 1} of ${steps.length}</div>
        <h3>${s.title}</h3>
        <p class="tutorial-body">${s.body}</p>
        <div class="tutorial-dots">
          ${steps.map((_, n) => `<span class="tutorial-dot ${n === i ? 'active' : ''}"></span>`).join('')}
        </div>
        <div class="modal-actions">
          ${isLast ? '' : '<button class="btn-cancel" onclick="closeModal()">Skip</button>'}
          ${i > 0 ? '<button class="btn-cancel" onclick="tutorialGo(-1)">Back</button>' : ''}
          ${isLast
            ? '<button class="btn-save" onclick="closeModal()">Get started</button>'
            : '<button class="btn-save" onclick="tutorialGo(1)">Next</button>'}
        </div>
      </div>
    </div>
  `;
}
