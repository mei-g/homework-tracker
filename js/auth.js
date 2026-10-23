// --- Auth handlers ---
async function handleAuthSubmit() {
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  if (!email || !password) return;
  authError = '';
  authBusy = true;
  render();
  try {
    if (authMode === 'signup') {
      await auth.createUserWithEmailAndPassword(email, password);
    } else {
      await auth.signInWithEmailAndPassword(email, password);
    }
    // onAuthStateChanged will take it from here
  } catch (e) {
    authError = e.message.replace(/^Firebase:\s*/, '');
  }
  authBusy = false;
  render();
}

function toggleAuthMode() {
  authMode = authMode === 'signin' ? 'signup' : 'signin';
  authError = '';
  render();
}

function signOutUser() {
  auth.signOut();
}
