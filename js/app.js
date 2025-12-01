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

// --- Tag Management ---

// Current filter tag (null means show all)
let currentFilterTag = null;

function parseTags(tagsInput) {
  if (!tagsInput || typeof tagsInput !== 'string') return [];
  return [...new Set(tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== ''))];
}

function getAllTags() {
  const todos = getTodos();
  const tagSet = new Set();
  todos.forEach(todo => {
    if (todo.tags && Array.isArray(todo.tags)) {
      todo.tags.forEach(tag => tagSet.add(tag));
    }
  });
  return Array.from(tagSet).sort();
}

function setFilterTag(tag) {
  currentFilterTag = tag;
  renderTagCloud();
  renderTodos();
}

function clearFilterTag() {
  currentFilterTag = null;
  renderTagCloud();
  renderTodos();
}

function renderTagCloud() {
  const tagCloudDiv = document.getElementById('tagCloud');
  if (!tagCloudDiv) return;

  const allTags = getAllTags();
  tagCloudDiv.innerHTML = '';

  if (allTags.length === 0) {
    return;
  }

  // Add "All" button
  const allBtn = document.createElement('button');
  allBtn.className = currentFilterTag === null 
    ? 'bg-blue-500 text-white px-3 py-1 rounded text-sm'
    : 'bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300';
  allBtn.textContent = 'すべて';
  allBtn.addEventListener('click', clearFilterTag);
  tagCloudDiv.appendChild(allBtn);

  // Add tag buttons
  allTags.forEach(tag => {
    const tagBtn = document.createElement('button');
    tagBtn.className = currentFilterTag === tag 
      ? 'bg-blue-500 text-white px-3 py-1 rounded text-sm'
      : 'bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300';
    tagBtn.textContent = '#' + tag;
    tagBtn.addEventListener('click', () => setFilterTag(tag));
    tagCloudDiv.appendChild(tagBtn);
  });
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
      // Load existing tags
      const tagsInput = document.getElementById('tags');
      if (tagsInput && todos[idx].tags && Array.isArray(todos[idx].tags)) {
        tagsInput.value = todos[idx].tags.join(', ');
      }
    }

    todoForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const title = document.getElementById('title').value;
      const detail = document.getElementById('detail').value;
      const tagsInput = document.getElementById('tags');
      const tags = tagsInput ? parseTags(tagsInput.value) : [];

      if (idx !== null && todos[idx]) {
        todos[idx] = { ...todos[idx], title, detail, tags }; // Preserve other props like 'checked'
      } else {
        todos.push({ title, detail, checked: false, tags });
      }
      saveTodos(todos);
      window.location.href = 'todolist.html';
    });
  }

  // 3. ToDo List Page
  const todoList = document.getElementById('todoList');
  if (todoList) {
    renderTagCloud();
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

  // Filter by tag if a filter is set
  let filteredTodosWithIdx = todos.map((todo, idx) => ({ todo, originalIdx: idx }));
  if (currentFilterTag !== null) {
    filteredTodosWithIdx = filteredTodosWithIdx.filter(({ todo }) => 
      todo.tags && Array.isArray(todo.tags) && todo.tags.includes(currentFilterTag)
    );
  }

  if (filteredTodosWithIdx.length === 0) {
    list.innerHTML = '<li class="text-gray-500">ToDoがありません。</li>';
    return;
  }

  filteredTodosWithIdx.forEach(({ todo, originalIdx }) => {
    const li = document.createElement('li');
    li.className = 'bg-white p-4 rounded shadow flex justify-between items-center';

    // Checkbox
    const checkboxDiv = document.createElement('div');
    checkboxDiv.className = 'flex items-center';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'mr-4 w-5 h-5 accent-blue-500';
    checkbox.checked = todo.checked || false;
    checkbox.addEventListener('change', () => toggleCheck(originalIdx));
    
    const textDiv = document.createElement('div');
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'font-medium';
    if (todo.checked) titleDiv.classList.add('line-through', 'text-gray-400');
    titleDiv.textContent = todo.title; // Secure: textContent prevents XSS

    const detailDiv = document.createElement('div');
    detailDiv.className = 'text-gray-500 text-sm';
    if (todo.checked) detailDiv.classList.add('line-through', 'text-gray-400');
    detailDiv.textContent = todo.detail || ''; // Secure

    // Tags display
    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'mt-1 flex flex-wrap gap-1';
    if (todo.tags && Array.isArray(todo.tags) && todo.tags.length > 0) {
      todo.tags.forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded';
        tagSpan.textContent = '#' + tag;
        tagsDiv.appendChild(tagSpan);
      });
    }

    textDiv.appendChild(titleDiv);
    textDiv.appendChild(detailDiv);
    textDiv.appendChild(tagsDiv);
    
    checkboxDiv.appendChild(checkbox);
    checkboxDiv.appendChild(textDiv);

    // Actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'flex space-x-2';

    const editLink = document.createElement('a');
    editLink.href = `edit.html?idx=${originalIdx}`;
    editLink.className = 'bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600';
    editLink.textContent = '編集';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600';
    deleteBtn.textContent = '削除';
    deleteBtn.addEventListener('click', () => deleteTodo(originalIdx));

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
  renderTagCloud();
  renderTodos();
}
