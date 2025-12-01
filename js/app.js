/**
 * ToDo App Logic
 */

// --- Authentication ---

function checkLogin() {
  if (localStorage.getItem('todo_login') !== '1') {
    window.location.href = 'login.html';
  }
}

function login(username, password) {
  // Hardcoded credentials (as per original code, but centralized)
  if (username === 'user' && password === 'pass') {
    localStorage.setItem('todo_login', '1');
    return true;
  }
  return false;
}

function logout() {
  localStorage.removeItem('todo_login');
  window.location.href = 'login.html';
}

// --- Data Management ---

function getTodos() {
  return JSON.parse(localStorage.getItem('todos') || '[]');
}

function saveTodos(todos) {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// --- Page Specific Logic ---

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const page = path.split('/').pop();

  // Global Logout Handler (if button exists)
  const logoutBtn = document.getElementById('logoutBtn'); // Will add ID to button in HTML
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  // 1. Login Page
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      if (login(username, password)) {
        window.location.href = 'todolist.html';
      } else {
        document.getElementById('loginError').classList.remove('hidden');
      }
    });
    return; // No further logic needed for login page
  }

  // For other pages, check login first
  if (page !== 'login.html') {
    checkLogin();
  }

  // 2. Edit Page
  const todoForm = document.getElementById('todoForm');
  if (todoForm) {
    const params = new URLSearchParams(window.location.search);
    const idx = params.has('idx') ? parseInt(params.get('idx')) : null;
    const todos = getTodos();
    let currentSubtasks = []; // In-memory store for subtasks on this page

    // --- Subtask UI Management ---
    const subtaskInput = document.getElementById('subtaskInput');
    const addSubtaskBtn = document.getElementById('addSubtaskBtn');
    const subtaskList = document.getElementById('subtaskList');

    function renderSubtasks() {
      subtaskList.innerHTML = '';
      currentSubtasks.forEach((subtask, subIdx) => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center bg-gray-100 p-2 rounded';

        const span = document.createElement('span');
        span.textContent = subtask.text;
        li.appendChild(span);

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.textContent = '削除';
        deleteBtn.className = 'bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600';
        deleteBtn.onclick = () => {
          currentSubtasks.splice(subIdx, 1);
          renderSubtasks(); // Re-render
        };
        li.appendChild(deleteBtn);

        subtaskList.appendChild(li);
      });
    }

    addSubtaskBtn.addEventListener('click', () => {
      const text = subtaskInput.value.trim();
      if (text) {
        currentSubtasks.push({ text: text, checked: false });
        subtaskInput.value = '';
        renderSubtasks();
      }
    });

    // --- Load existing data ---
    if (idx !== null && todos[idx]) {
      document.getElementById('title').value = todos[idx].title;
      document.getElementById('detail').value = todos[idx].detail || '';
      currentSubtasks = todos[idx].subtasks || [];
      renderSubtasks(); // Initial render
    }

    // --- Form Submission ---
    todoForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const title = document.getElementById('title').value;
      const detail = document.getElementById('detail').value;

      if (idx !== null && todos[idx]) {
        // Editing existing ToDo
        todos[idx] = { ...todos[idx], title, detail, subtasks: currentSubtasks };
      } else {
        // Creating new ToDo
        todos.push({ title, detail, checked: false, subtasks: currentSubtasks });
      }
      saveTodos(todos);
      window.location.href = 'todolist.html';
    });
  }

  // 3. ToDo List Page
  const todoList = document.getElementById('todoList');
  if (todoList) {
    renderTodos();
  }
});

// --- Rendering & Actions (Exposed to global for inline event handlers if needed, but we prefer event delegation or re-attaching) ---
// Since we are moving away from inline handlers like onclick="deleteTodo()", we need to handle events carefully.
// We will attach event listeners during render or use delegation.

function renderTodos() {
  const todos = getTodos();
  const list = document.getElementById('todoList');
  if (!list) return;

  list.innerHTML = '';

  if (todos.length === 0) {
    list.innerHTML = '<li class="text-gray-500">ToDoがありません。</li>';
    return;
  }

  todos.forEach((todo, idx) => {
    const li = document.createElement('li');
    li.className = 'bg-white p-4 rounded shadow'; // Removed flex to allow vertical stacking

    const mainContent = document.createElement('div');
    mainContent.className = 'flex justify-between items-center';

    // Checkbox and Text
    const checkboxDiv = document.createElement('div');
    checkboxDiv.className = 'flex items-center flex-grow'; // Allow text to take space
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'mr-4 w-5 h-5 accent-blue-500 flex-shrink-0'; // Prevent checkbox shrinking
    checkbox.checked = todo.checked || false;
    checkbox.addEventListener('change', () => toggleCheck(idx));
    
    const textDiv = document.createElement('div');
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'font-medium';
    if (todo.checked) titleDiv.classList.add('line-through', 'text-gray-400');
    titleDiv.textContent = todo.title;

    const detailDiv = document.createElement('div');
    detailDiv.className = 'text-gray-500 text-sm';
    if (todo.checked) detailDiv.classList.add('line-through', 'text-gray-400');
    detailDiv.textContent = todo.detail || '';

    textDiv.appendChild(titleDiv);
    textDiv.appendChild(detailDiv);
    
    checkboxDiv.appendChild(checkbox);
    checkboxDiv.appendChild(textDiv);

    // Actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'flex space-x-2 flex-shrink-0'; // Prevent buttons shrinking

    const editLink = document.createElement('a');
    editLink.href = `edit.html?idx=${idx}`;
    editLink.className = 'bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600';
    editLink.textContent = '編集';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600';
    deleteBtn.textContent = '削除';
    deleteBtn.addEventListener('click', () => deleteTodo(idx));

    actionsDiv.appendChild(editLink);
    actionsDiv.appendChild(deleteBtn);

    mainContent.appendChild(checkboxDiv);
    mainContent.appendChild(actionsDiv);
    li.appendChild(mainContent);

    // --- Subtasks ---
    if (todo.subtasks && todo.subtasks.length > 0) {
      // Progress Bar
      const completed = todo.subtasks.filter(s => s.checked).length;
      const total = todo.subtasks.length;
      const progress = total > 0 ? (completed / total) * 100 : 0;

      const progressContainer = document.createElement('div');
      progressContainer.className = 'mt-3';

      const progressText = document.createElement('div');
      progressText.className = 'text-sm text-gray-600 mb-1';
      progressText.textContent = `進捗: ${completed} / ${total}`;

      const progressBarBg = document.createElement('div');
      progressBarBg.className = 'w-full bg-gray-200 rounded-full h-2.5';

      const progressBar = document.createElement('div');
      progressBar.className = 'bg-blue-600 h-2.5 rounded-full';
      progressBar.style.width = `${progress}%`;

      progressBarBg.appendChild(progressBar);
      progressContainer.appendChild(progressText);
      progressContainer.appendChild(progressBarBg);
      li.appendChild(progressContainer);

      // Subtask List (collapsible)
      const subtaskContainer = document.createElement('div');
      subtaskContainer.className = 'mt-3 pt-3 border-t border-gray-200';

      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'text-sm text-blue-500 hover:underline mb-2';
      toggleBtn.textContent = 'サブタスクを表示';

      const subtaskList = document.createElement('ul');
      subtaskList.className = 'hidden space-y-2'; // Initially hidden

      toggleBtn.onclick = () => {
        const isHidden = subtaskList.classList.toggle('hidden');
        toggleBtn.textContent = isHidden ? 'サブタスクを表示' : 'サブタスクを隠す';
      };

      todo.subtasks.forEach((subtask, subIdx) => {
        const subLi = document.createElement('li');
        subLi.className = 'flex items-center text-sm';

        const subCheckbox = document.createElement('input');
        subCheckbox.type = 'checkbox';
        subCheckbox.className = 'mr-3 w-4 h-4 accent-blue-500';
        subCheckbox.checked = subtask.checked;
        subCheckbox.addEventListener('change', () => toggleSubtaskCheck(idx, subIdx));

        const subSpan = document.createElement('span');
        subSpan.textContent = subtask.text;
        if (subtask.checked) {
          subSpan.classList.add('line-through', 'text-gray-400');
        }

        subLi.appendChild(subCheckbox);
        subLi.appendChild(subSpan);
        subtaskList.appendChild(subLi);
      });

      subtaskContainer.appendChild(toggleBtn);
      subtaskContainer.appendChild(subtaskList);
      li.appendChild(subtaskContainer);
    }

    list.appendChild(li);
  });
}

function toggleSubtaskCheck(todoIdx, subtaskIdx) {
  const todos = getTodos();
  if (todos[todoIdx] && todos[todoIdx].subtasks[subtaskIdx]) {
    todos[todoIdx].subtasks[subtaskIdx].checked = !todos[todoIdx].subtasks[subtaskIdx].checked;
    saveTodos(todos);
    renderTodos();
  }
}

function toggleCheck(idx) {
  const todos = getTodos();
  if (todos[idx]) {
    todos[idx].checked = !todos[idx].checked;
    saveTodos(todos);
    renderTodos();
  }
}

function deleteTodo(idx) {
  if (!confirm('本当に削除しますか？')) return;
  const todos = getTodos();
  todos.splice(idx, 1);
  saveTodos(todos);
  renderTodos();
}
