function addAssignment(subjectId, titleInput, dateInput) {
  const title = titleInput.value.trim();
  if (!title) return;
  const child = activeChild();
  const subject = child.subjects.find(s => s.id === subjectId);
  subject.assignments.push({ id: uid(), title, dueDate: dateInput.value || '', done: false });
  titleInput.value = ''; dateInput.value = '';
  persistChild(child); render();
}

function toggleAssignment(subjectId, assignmentId) {
  const child = activeChild();
  const subject = child.subjects.find(s => s.id === subjectId);
  const a = subject.assignments.find(a => a.id === assignmentId);
  a.done = !a.done;
  persistChild(child); render();
}

function deleteAssignment(subjectId, assignmentId) {
  const child = activeChild();
  if (!child || !canManageChild(child)) return;
  const subject = child.subjects.find(s => s.id === subjectId);
  subject.assignments = subject.assignments.filter(a => a.id !== assignmentId);
  persistChild(child); render();
}
