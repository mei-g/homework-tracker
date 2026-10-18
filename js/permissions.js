// Structural changes (add/delete a child or subject, delete a logged item,
// edit a logged item's date, edit the weekly goal or week-start) are
// admin-only. Guests can only tick things off and log new items — enforced
// both here in the UI and, best-effort, in Firestore rules.

// Only an admin (or the local single-user fallback) can change practice goals.
// Admin can manage any child; a guest can fully manage children they added
// themselves (add/delete the child, its subjects, assignments, practice
// items, dates, and goal) but not anyone else's.
function canManageChild(child) {
  if (!USE_FIREBASE) return true;
  if (currentRole === 'admin') return true;
  return !!child && child.ownerId === (currentUser && currentUser.uid);
}

function isAdminOrLocal() {
  return !USE_FIREBASE || currentRole === 'admin';
}
