/**
 * ToDo App Logic
 */

// --- Priority Constants ---

// Priority order for sorting (high = 1, medium = 2, low = 3)
const priorityOrder = { high: 1, medium: 2, low: 3 };

// Default priority value
const DEFAULT_PRIORITY = 'medium';

// Priority display names and CSS classes
const priorityConfig = {
  high: { label: '高', bgClass: 'bg-red-100', borderClass: 'border-l-4 border-red-500', textClass: 'text-red-600' },
  medium: { label: '中', bgClass: 'bg-yellow-50', borderClass: 'border-l-4 border-yellow-500', textClass: 'text-yellow-600' },
  low: { label: '低', bgClass: 'bg-green-50', borderClass: 'border-l-4 border-green-500', textClass: 'text-green-600' }
};

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

    if (idx !== null && todos[idx]) {
      document.getElementById('title').value = todos[idx].title;
      document.getElementById('detail').value = todos[idx].detail || '';
      // Set priority radio button
      const priority = todos[idx].priority || DEFAULT_PRIORITY;
      const priorityRadio = document.querySelector(`input[name="priority"][value="${priority}"]`);
      if (priorityRadio) priorityRadio.checked = true;
    }

    todoForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const title = document.getElementById('title').value;
      const detail = document.getElementById('detail').value;
      const priorityRadio = document.querySelector('input[name="priority"]:checked');
      const priority = priorityRadio ? priorityRadio.value : DEFAULT_PRIORITY;

      if (idx !== null && todos[idx]) {
        todos[idx] = { ...todos[idx], title, detail, priority }; // Preserve other props like 'checked'
      } else {
        todos.push({ title, detail, checked: false, priority });
      }
      saveTodos(todos);
      window.location.href = 'todolist.html';
    });
  }

  // 3. ToDo List Page
  const todoList = document.getElementById('todoList');
  if (todoList) {
    renderTodos();
    
    // Sort by priority button
    const sortBtn = document.getElementById('sortByPriorityBtn');
    if (sortBtn) {
      sortBtn.addEventListener('click', sortByPriority);
    }
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
    const priority = todo.priority || DEFAULT_PRIORITY;
    const config = priorityConfig[priority] || priorityConfig[DEFAULT_PRIORITY];
    
    const li = document.createElement('li');
    li.className = `${config.bgClass} ${config.borderClass} p-4 rounded shadow flex justify-between items-center`;

    // Checkbox
    const checkboxDiv = document.createElement('div');
    checkboxDiv.className = 'flex items-center';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'mr-4 w-5 h-5 accent-blue-500';
    checkbox.checked = todo.checked || false;
    checkbox.addEventListener('change', () => toggleCheck(idx));
    
    const textDiv = document.createElement('div');
    
    // Priority badge
    const priorityBadge = document.createElement('span');
    priorityBadge.className = `${config.textClass} text-xs font-bold mr-2 px-2 py-0.5 rounded`;
    priorityBadge.textContent = config.label;
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'font-medium flex items-center';
    if (todo.checked) titleDiv.classList.add('line-through', 'text-gray-400');
    
    const titleSpan = document.createElement('span');
    titleSpan.textContent = todo.title; // Secure: textContent prevents XSS
    
    titleDiv.appendChild(priorityBadge);
    titleDiv.appendChild(titleSpan);

    const detailDiv = document.createElement('div');
    detailDiv.className = 'text-gray-500 text-sm';
    if (todo.checked) detailDiv.classList.add('line-through', 'text-gray-400');
    detailDiv.textContent = todo.detail || ''; // Secure

    textDiv.appendChild(titleDiv);
    textDiv.appendChild(detailDiv);
    
    checkboxDiv.appendChild(checkbox);
    checkboxDiv.appendChild(textDiv);

    // Actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'flex space-x-2';

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

    li.appendChild(checkboxDiv);
    li.appendChild(actionsDiv);
    list.appendChild(li);
  });
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

function sortByPriority() {
  const todos = getTodos();
  const defaultPriorityValue = priorityOrder[DEFAULT_PRIORITY];
  todos.sort((a, b) => {
    const priorityA = priorityOrder[a.priority] || defaultPriorityValue;
    const priorityB = priorityOrder[b.priority] || defaultPriorityValue;
    return priorityA - priorityB;
  });
  saveTodos(todos);
  renderTodos();
}
