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

// --- Template Management ---

function getTemplates() {
  return JSON.parse(localStorage.getItem('templates') || '[]');
}

function saveTemplate(template) {
  const templates = getTemplates();
  templates.push({
    id: crypto.randomUUID(),
    title: template.title,
    detail: template.detail || ''
  });
  localStorage.setItem('templates', JSON.stringify(templates));
}

function deleteTemplate(id) {
  const templates = getTemplates();
  const filtered = templates.filter(t => t.id !== id);
  localStorage.setItem('templates', JSON.stringify(filtered));
}

function applyTemplate(id) {
  const templates = getTemplates();
  const template = templates.find(t => t.id === id);
  if (template) {
    const todos = getTodos();
    todos.push({
      title: template.title,
      detail: template.detail,
      checked: false
    });
    saveTodos(todos);
    return true;
  }
  return false;
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
      const saveAsTemplateCheckbox = document.getElementById('saveAsTemplate');
      const saveAsTemplate = saveAsTemplateCheckbox ? saveAsTemplateCheckbox.checked : false;

      if (idx !== null && todos[idx]) {
        todos[idx] = { ...todos[idx], title, detail }; // Preserve other props like 'checked'
      } else {
        todos.push({ title, detail, checked: false });
      }
      saveTodos(todos);

      // Save as template if checkbox is checked
      if (saveAsTemplate) {
        saveTemplate({ title, detail });
      }

      window.location.href = 'todolist.html';
    });
  }

  // 3. ToDo List Page
  const todoList = document.getElementById('todoList');
  if (todoList) {
    renderTodos();
    renderTemplates();
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
    li.className = 'bg-white p-4 rounded shadow flex justify-between items-center';

    // Checkbox
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
    titleDiv.textContent = todo.title; // Secure: textContent prevents XSS

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

// --- Template Rendering ---

function renderTemplates() {
  const templates = getTemplates();
  const list = document.getElementById('templateList');
  const noTemplatesMsg = document.getElementById('noTemplates');
  if (!list) return;

  list.innerHTML = '';

  if (templates.length === 0) {
    if (noTemplatesMsg) noTemplatesMsg.classList.remove('hidden');
    return;
  }

  if (noTemplatesMsg) noTemplatesMsg.classList.add('hidden');

  templates.forEach((template) => {
    const li = document.createElement('li');
    li.className = 'flex justify-between items-center bg-gray-50 p-2 rounded';

    // Template info
    const infoDiv = document.createElement('div');
    infoDiv.className = 'flex-1';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'font-medium';
    titleSpan.textContent = template.title;

    const detailSpan = document.createElement('span');
    detailSpan.className = 'text-gray-500 text-sm ml-2';
    detailSpan.textContent = template.detail ? `- ${template.detail}` : '';

    infoDiv.appendChild(titleSpan);
    infoDiv.appendChild(detailSpan);

    // Actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'flex space-x-2';

    const applyBtn = document.createElement('button');
    applyBtn.className = 'bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm';
    applyBtn.textContent = '作成';
    applyBtn.addEventListener('click', () => {
      if (applyTemplate(template.id)) {
        renderTodos();
      }
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm';
    deleteBtn.textContent = '削除';
    deleteBtn.addEventListener('click', () => {
      if (confirm('このテンプレートを削除しますか？')) {
        deleteTemplate(template.id);
        renderTemplates();
      }
    });

    actionsDiv.appendChild(applyBtn);
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(infoDiv);
    li.appendChild(actionsDiv);
    list.appendChild(li);
  });
}
