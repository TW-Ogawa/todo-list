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

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(match) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[match];
  });
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

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
    }

    todoForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const title = document.getElementById('title').value;
      const detail = document.getElementById('detail').value;

      if (idx !== null && todos[idx]) {
        todos[idx] = { ...todos[idx], title, detail }; // Preserve other props like 'checked'
      } else {
        todos.push({ title, detail, checked: false });
      }
      saveTodos(todos);
      window.location.href = 'todolist.html';
    });
  }

  // 3. ToDo List Page
  const todoList = document.getElementById('todoList');
  if (todoList) {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => renderTodos());
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

  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput.value.toLowerCase();

  list.innerHTML = '';
  let itemsFound = false;

  todos.forEach((todo, idx) => {
    const titleMatch = todo.title && todo.title.toLowerCase().includes(searchTerm);
    const detailMatch = todo.detail && todo.detail.toLowerCase().includes(searchTerm);

    if (!searchTerm || titleMatch || detailMatch) {
      itemsFound = true;
      const li = document.createElement('li');
    li.className = 'bg-white p-4 rounded shadow flex justify-between items-center';

    const checkboxDiv = document.createElement('div');
    checkboxDiv.className = 'flex items-center';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'mr-4 w-5 h-5 accent-blue-500';
    checkbox.checked = todo.checked || false;
    checkbox.addEventListener('change', () => toggleCheck(idx));
    
    const textDiv = document.createElement('div');
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'font-medium';
    if (todo.checked) titleDiv.classList.add('line-through', 'text-gray-400');

    const detailDiv = document.createElement('div');
    detailDiv.className = 'text-gray-500 text-sm';
    if (todo.checked) detailDiv.classList.add('line-through', 'text-gray-400');

    // Highlighting
    if (searchTerm) {
      const safeSearchTerm = escapeRegExp(searchTerm);
      const regex = new RegExp(safeSearchTerm, 'gi');
      const highlightedTitle = escapeHTML(todo.title || '').replace(regex, `<span class="bg-yellow-200">$&</span>`);
      const highlightedDetail = escapeHTML(todo.detail || '').replace(regex, `<span class="bg-yellow-200">$&</span>`);
      titleDiv.innerHTML = highlightedTitle;
      detailDiv.innerHTML = highlightedDetail;
    } else {
      titleDiv.textContent = todo.title;
      detailDiv.textContent = todo.detail || '';
    }

    textDiv.appendChild(titleDiv);
    textDiv.appendChild(detailDiv);
    
    checkboxDiv.appendChild(checkbox);
    checkboxDiv.appendChild(textDiv);

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
    }
  });

  if (!itemsFound) {
    list.innerHTML = '<li class="text-gray-500">該当するToDoがありません。</li>';
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
