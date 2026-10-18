// --- Boot ---
if (USE_FIREBASE) {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  auth = firebase.auth();
  auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    if (user) {
      try {
        await ensureUserRole(user);
        await loadChildrenFirestore();
      } catch (e) {
        console.error('Auth/role error', e);
      }
    } else {
      currentRole = null;
      state = { children: [], activeChildId: null };
    }
    render();
  });
} else {
  loadLocal();
}
