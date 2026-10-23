// Interactive first-run tour for new accounts. Instead of a slideshow it
// highlights the real controls and waits for the user to actually use them
// (add a child, add a subject, add and tick an assignment, tick a practice
// session). Shown once per user per browser; reopen with the Tutorial button.
const TUTORIAL_SEEN_KEY = 'homeroom-tutorial-seen-';

let tour = null; // { step, baseline, scrolled } while the tour is running

function tutorialUserKey() {
  return TUTORIAL_SEEN_KEY + (currentUser ? currentUser.uid : 'local');
}

function hasSeenTutorial() {
  try { return !!localStorage.getItem(tutorialUserKey()); } catch (e) { return true; }
}

function markTutorialSeen() {
  try { localStorage.setItem(tutorialUserKey(), '1'); } catch (e) { /* ignore */ }
}

// ---- progress measures: a step completes when its number goes up ----
function tourAssignments() {
  const c = activeChild();
  return c ? c.subjects.flatMap(s => s.assignments) : [];
}

// A step with `measure` waits for the user to act; a step without it is info.
function tourSteps() {
  const steps = [
    {
      title: 'Welcome to Homeroom',
      body: 'Let\'s learn by doing. This short tour highlights the real buttons and waits for you to try them — it takes about two minutes.'
    },
    {
      target: '.add-kid-tab',
      title: '1. Add a child',
      body: 'Click the highlighted <b>+ Add child</b> button, enter a name, pick a color and save. Each child gets their own tab.',
      measure: () => state.children.length
    },
    {
      target: '.add-subject-btn',
      title: '2. Add a subject',
      body: 'Now click <b>+ Add subject</b> and create one, such as Math or Reading. Assignments are grouped by subject.',
      measure: () => { const c = activeChild(); return c ? c.subjects.length : 0; }
    },
    {
      target: '.subject .add-row',
      title: '3. Add an assignment',
      body: 'Type an assignment in the highlighted row, optionally pick a due date, and press <b>Add</b>.',
      measure: () => tourAssignments().length
    },
    {
      target: '.assignment input[type=checkbox]',
      title: '4. Tick it off',
      body: 'Tick the checkbox when the assignment is finished. Watch the progress bars update.',
      measure: () => tourAssignments().filter(a => a.done).length
    },
    {
      target: '.practice-card:not(.week-card) .practice-entry input[type=checkbox]',
      title: '5. Log practice',
      body: 'Weekly practice sessions appear automatically from the goal. Tick one when it\'s done — you can also type the <b>Actual</b> minutes beside it.',
      measure: () => { const c = activeChild(); return c ? c.practiceLog.filter(e => e.done).length : 0; }
    },
    {
      target: '.week-card',
      title: '6. Weeks at a glance',
      body: 'This card totals the minutes practiced this week and overall. Pick a date to choose the weekday your week starts on, or use <b>+ Add week</b> to queue next week\'s sessions.'
    }
  ];
  if (USE_FIREBASE) {
    steps.push({
      title: '7. Admins and guests',
      body: currentRole === 'admin'
        ? 'You\'re an <b>admin</b>: you can see and manage every child, and only admins can edit practice goals and queue weeks. Anyone who signs up after you starts as a guest.'
        : 'You\'re a <b>guest</b>: you can add and fully manage the children you create. You can\'t see other families\' children. Ask an admin if you need more access.'
    });
  }
  steps.push({
    title: 'You\'re all set!',
    body: 'That\'s the whole app. Reopen this tour anytime with the <b>Tutorial</b> button at the top right.'
  });
  return steps;
}

function currentTourStep() {
  const steps = tourSteps();
  return steps[Math.min(tour.step, steps.length - 1)];
}

function enterTourStep(step) {
  tour.step = step;
  tour.scrolled = false;
  const s = currentTourStep();
  tour.baseline = s.measure ? s.measure() : 0;
}

function startTour() {
  markTutorialSeen();
  modal = null;
  tour = {};
  enterTourStep(0);
}

// Called from render(): opens the tour automatically for first-time users.
function maybeShowTutorial() {
  if (tour || modal || hasSeenTutorial()) return;
  startTour();
}

function openTutorial() { startTour(); render(); }
function endTour() { tour = null; render(); }

function tourNext() {
  if (tour.step >= tourSteps().length - 1) return endTour();
  enterTourStep(tour.step + 1);
  render();
}

function tourBack() {
  if (tour.step > 0) { enterTourStep(tour.step - 1); render(); }
}

// Called at the start of render(): moves on once the user has done the
// action the current step is waiting for.
function advanceTourIfDone() {
  if (!tour) return;
  const s = currentTourStep();
  if (s.measure && s.measure() > tour.baseline) {
    enterTourStep(tour.step + 1);
  }
}

function renderTour() {
  if (!tour) return '';
  const steps = tourSteps();
  const i = Math.min(tour.step, steps.length - 1);
  const s = steps[i];
  const last = i === steps.length - 1;
  const waiting = !!s.measure;
  const centered = !s.target && !waiting;
  return `
    <div class="tour-card ${centered ? 'centered' : ''}" role="dialog" aria-live="polite">
      <div class="tour-count">Step ${i + 1} of ${steps.length}${waiting ? ' · your turn' : ''}</div>
      <h3>${s.title}</h3>
      <p class="tour-body">${s.body}</p>
      <div class="tour-actions">
        <button class="tour-skip" onclick="endTour()">${last ? '' : 'Skip tour'}</button>
        <span class="tour-spacer"></span>
        ${i > 0 ? '<button class="btn-cancel" onclick="tourBack()">Back</button>' : ''}
        <button class="btn-save" onclick="tourNext()">${last ? 'Get started' : waiting ? 'Skip step' : 'Next'}</button>
      </div>
    </div>
  `;
}

// Called at the end of render(): outlines the control the step is about.
function applyTourHighlight() {
  document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
  if (!tour) return;
  const s = currentTourStep();
  if (!s.target) return;
  const el = document.querySelector(s.target);
  if (!el) return;
  el.classList.add('tour-highlight');
  if (!tour.scrolled) {
    tour.scrolled = true;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
}
