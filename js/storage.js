// Fetch (or create) this user's role doc. The first person ever to sign up
// becomes admin automatically; everyone after that starts as a guest.
// An admin can promote other users later from the Firestore console
// (users/{uid}.role) if needed.
async function ensureUserRole(user) {
  const ref = db.collection('users').doc(user.uid);
  const snap = await ref.get();
  if (snap.exists) {
    currentRole = snap.data().role || 'guest';
    return;
  }
  const anyUsers = await db.collection('users').limit(1).get();
  const role = anyUsers.empty ? 'admin' : 'guest';
  await ref.set({ role, email: user.email || '' });
  currentRole = role;
}

async function loadChildrenFirestore() {
  const query = (currentRole === 'admin')
    ? db.collection('children')
    : db.collection('children').where('ownerId', '==', currentUser.uid);
  const snap = await query.get();
  state.children = snap.docs.map(d => Object.assign({ id: d.id }, d.data()));
  for (const child of state.children) {
    if (ensureWeeklyDefaults(child)) {
      await persistChild(child);
    }
  }
  if (!state.activeChildId || !state.children.find(c => c.id === state.activeChildId)) {
    state.activeChildId = state.children.length ? state.children[0].id : null;
  }
}

// Persist a single child (create or update). Falls back to saving the
// whole local blob when Firebase isn't configured.
async function persistChild(child) {
  if (USE_FIREBASE) {
    try {
      await db.collection('children').doc(child.id).set({
        ownerId: child.ownerId,
        name: child.name,
        color: child.color,
        subjects: child.subjects,
        practiceLog: child.practiceLog || [],
        practiceGoal: child.practiceGoal || { minutes: 30, timesPerWeek: 1 },
        weekStart: child.weekStart || null
      }, { merge: true });
      saveError = '';
    } catch (e) {
      console.error('Save child error', e);
      saveError = 'Couldn\'t save that change: ' + (e && e.message ? e.message : 'unknown error');
      render();
    }
  } else {
    await saveLocal();
  }
}

async function removeChildDoc(id) {
  if (USE_FIREBASE) {
    try {
      await db.collection('children').doc(id).delete();
    } catch (e) {
      console.error('Delete child error', e);
    }
  } else {
    await saveLocal();
  }
}

// Local (non-Firebase) fallback: whole-state save via Claude's storage.
async function saveLocal() {
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify(state), false);
  } catch (e) {
    console.error('Storage error', e);
  }
}

async function loadLocal() {
  try {
    const res = await window.storage.get(STORAGE_KEY, false);
    if (res && res.value) state = JSON.parse(res.value);
  } catch (e) {
    // no data yet
  }
  let anyChanged = false;
  state.children.forEach(child => {
    if (ensureWeeklyDefaults(child)) anyChanged = true;
  });
  if (anyChanged) await saveLocal();
  if (!state.activeChildId && state.children.length) {
    state.activeChildId = state.children[0].id;
  }
  render();
}
