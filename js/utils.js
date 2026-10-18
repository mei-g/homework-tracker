function uid() { return Math.random().toString(36).slice(2, 10); }
function isOverdue(dueDate, done) {
  if (!dueDate || done) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  return new Date(dueDate) < today;
}

function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
