// simple to-do
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');

addBtn.addEventListener('click', () => {
  const taskText = taskInput.value.trim();
  if (taskText === '') return;

  const li = document.createElement('li');
  li.className = 'task-item';

  const check = document.createElement('span');
  check.className = 'check';
  check.innerHTML = '○';
  const taskTextSpan = document.createElement('span');
  taskTextSpan.className = 'task-text';
  taskTextSpan.textContent = taskText;

  check.addEventListener('click', () => {
    taskTextSpan.classList.toggle('completed');
    check.innerHTML = taskTextSpan.classList.contains('completed') ? '✔️' : '○';
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete';
  deleteBtn.innerHTML = '×';
  deleteBtn.addEventListener('click', () => {
    taskList.removeChild(li);
  });

  li.appendChild(check);
  li.appendChild(taskTextSpan);
  li.appendChild(deleteBtn);
  taskList.appendChild(li);

  taskInput.value = '';
});
