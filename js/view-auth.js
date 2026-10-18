function renderAuthScreen() {
  const isSignup = authMode === 'signup';
  return `
    <div class="auth-wrap">
      <h1>Homeroom</h1>
      <p class="sub">${isSignup ? 'Create an account to start tracking.' : 'Sign in to see your homework tracker.'}</p>
      ${authError ? `<div class="auth-error">${escapeHtml(authError)}</div>` : ''}
      <input type="email" id="auth-email" placeholder="Email" autocomplete="email">
      <input type="password" id="auth-password" placeholder="Password" autocomplete="${isSignup ? 'new-password' : 'current-password'}" onkeydown="if(event.key==='Enter') handleAuthSubmit()">
      <button class="primary" onclick="handleAuthSubmit()" ${authBusy ? 'disabled' : ''}>${authBusy ? 'Please wait…' : (isSignup ? 'Create account' : 'Sign in')}</button>
      <div class="auth-toggle">
        ${isSignup ? 'Already have an account?' : "Don't have an account?"}
        <a onclick="toggleAuthMode()">${isSignup ? 'Sign in' : 'Sign up'}</a>
      </div>
    </div>
  `;
}
