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

    if (idx !== null && todos[idx]) {
      document.getElementById('title').value = todos[idx].title;
      document.getElementById('detail').value = todos[idx].detail || '';
      document.getElementById('dueDate').value = todos[idx].dueDate || '';
    }

    todoForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const title = document.getElementById('title').value;
      const detail = document.getElementById('detail').value;
      const dueDate = document.getElementById('dueDate').value;

      if (idx !== null && todos[idx]) {
        todos[idx] = { ...todos[idx], title, detail, dueDate }; // Preserve other props like 'checked'
      } else {
        todos.push({ title, detail, dueDate, checked: false });
      }
      saveTodos(todos);
      window.location.href = 'todolist.html';
    });
  }

  // 3. ToDo List Page
  const todoList = document.getElementById('todoList');
  if (todoList) {
    // Initial render
    renderTodos();

    // Attach event listener for sorting
    const sortOrder = document.getElementById('sortOrder');
    if (sortOrder) {
      sortOrder.addEventListener('change', () => renderTodos());
    }
  }
});

// --- Rendering & Actions ---

function renderTodos() {
  let todos = getTodos();
  const list = document.getElementById('todoList');
  const sortOrder = document.getElementById('sortOrder')?.value;

  const originalTodos = getTodos(); // Get original for index mapping

  // Create a mappable/sortable array
  let processedTodos = todos.map((todo, index) => ({ ...todo, originalIndex: index }));

  // Sorting Logic
  if (sortOrder === 'dueDate') {
    processedTodos.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }

  if (!list) return;
  list.innerHTML = '';

  if (processedTodos.length === 0) {
    list.innerHTML = '<li class="text-gray-500">ToDoがありません。</li>';
    return;
  }

  processedTodos.forEach(todo => {
    const li = document.createElement('li');
    const originalIdx = todo.originalIndex;
    li.className = 'bg-white p-4 rounded shadow flex justify-between items-center';
    li.dataset.idx = originalIdx; // Keep track of the original index

    // --- Duedate Logic ---
    if (todo.dueDate && !todo.checked) {
      const dueDate = new Date(todo.dueDate);
      const today = new Date();
      // Reset time part for accurate date comparison
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        li.classList.add('border-2', 'border-red-500'); // Overdue visual cue
      }
    }

    // Checkbox and Text
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
    titleDiv.textContent = todo.title;

    const detailDiv = document.createElement('div');
    detailDiv.className = 'text-gray-500 text-sm';
    if (todo.checked) detailDiv.classList.add('line-through', 'text-gray-400');
    detailDiv.textContent = todo.detail || '';

    textDiv.appendChild(titleDiv);
    textDiv.appendChild(detailDiv);

    // Due Date Display
    if (todo.dueDate) {
      const dueDateDiv = document.createElement('div');
      dueDateDiv.className = 'text-gray-500 text-xs mt-1';
      dueDateDiv.textContent = `期限: ${todo.dueDate}`;
      textDiv.appendChild(dueDateDiv);
    }
    
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
  renderTodos();
}
