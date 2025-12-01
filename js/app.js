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
    renderTodos();
    // Add event listeners for new buttons
    document.getElementById('exportJsonBtn').addEventListener('click', exportJson);
    document.getElementById('exportCsvBtn').addEventListener('click', exportCsv);
    document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
    document.getElementById('importFile').addEventListener('change', importFile);
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

// --- Export/Import ---

function exportJson() {
  const todos = getTodos();
  const dataStr = JSON.stringify(todos, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'todos.json';
  link.click();
  URL.revokeObjectURL(url);
}

function exportCsv() {
  const todos = getTodos();
  const header = ['title', 'detail', 'checked'];
  const csvRows = [
    header.join(','),
    ...todos.map(todo => [
        `"${todo.title.replace(/"/g, '""')}"`,
        `"${(todo.detail || '').replace(/"/g, '""')}"`,
        todo.checked
      ].join(','))
  ];
  const csvString = csvRows.join('\n');
  const dataBlob = new Blob([csvString], { type: 'text/csv' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'todos.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function parseJson(content) {
  try {
    return JSON.parse(content);
  } catch (e) {
    throw new Error('JSONの解析に失敗しました。');
  }
}

function parseCsv(content) {
  const lines = content.trim().split(/\r?\n/);
  const header = lines.shift();

  if (header !== 'title,detail,checked') {
    throw new Error('無効なCSVヘッダーです。ヘッダーは "title,detail,checked" である必要があります。');
  }

  return lines.map((line, index) => {
    // This is a simple parser assuming the format we export.
    // It may not work for all CSVs, but it's good enough for our purposes.
    // Handles quoted titles and details.
    const regex = /"((?:[^"]|"")*)"|([^,]+)|(true|false)/g;
    let match;
    const parts = [];
    while(match = regex.exec(line)) {
        if(match[0] === ',') continue;
        parts.push(match[1] ? match[1].replace(/""/g, '"') : match[2] || match[3]);
    }

    if (parts.length !== 3) {
      console.warn(`無効なCSV行 #${index + 1} をスキップします:`, line);
      return null;
    }

    return {
      title: parts[0],
      detail: parts[1],
      checked: parts[2] === 'true'
    };
  }).filter(todo => todo !== null); // Remove nulls from skipped lines
}

function validateTodos(todos) {
  if (!Array.isArray(todos)) {
    return false;
  }
  return todos.every(todo =>
    typeof todo === 'object' &&
    todo !== null &&
    typeof todo.title === 'string' &&
    (typeof todo.detail === 'string' || typeof todo.detail === 'undefined') &&
    typeof todo.checked === 'boolean'
  );
}

function importFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    try {
      let importedTodos;
      if (file.name.endsWith('.json')) {
        importedTodos = parseJson(content);
      } else if (file.name.endsWith('.csv')) {
        importedTodos = parseCsv(content);
      } else {
        throw new Error('サポートされていないファイル形式です。.json または .csv ファイルを選択してください。');
      }

      if (!validateTodos(importedTodos)) {
        throw new Error('ファイルの内容が不正か、ToDoアイテムの形式が正しくありません。');
      }

      const existingTodos = getTodos();
      const newTodos = importedTodos.filter(imported =>
        !existingTodos.some(existing =>
          existing.title === imported.title && existing.detail === imported.detail
        )
      );

      if (importedTodos.length > 0 && newTodos.length === 0) {
        alert('インポートされたToDoはすべて既存のリストに存在します。');
        return;
      }

      const mergedTodos = existingTodos.concat(newTodos);
      saveTodos(mergedTodos);
      renderTodos();
      alert(`${newTodos.length}件の新しいToDoがインポートされました。`);

    } catch (error) {
      alert(`インポートに失敗しました: ${error.message}`);
    } finally {
      // Reset file input to allow re-uploading the same file
      event.target.value = '';
    }
  };
  reader.onerror = function() {
    alert('ファイルの読み込み中にエラーが発生しました。');
    event.target.value = '';
  };
  reader.readAsText(file);
}
