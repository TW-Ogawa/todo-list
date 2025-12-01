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
    const todo = (idx !== null && todos[idx]) ? todos[idx] : null;

    // --- Temporary state for notes and links ---
    let currentNotes = todo ? [...(todo.notes || [])] : [];
    let currentLinks = todo ? [...(todo.links || [])] : [];

    // --- DOM Elements ---
    const titleInput = document.getElementById('title');
    const detailInput = document.getElementById('detail');
    const noteInput = document.getElementById('note-input');
    const addNoteBtn = document.getElementById('add-note-btn');
    const notesList = document.getElementById('notes-list');
    const linkInput = document.getElementById('link-input');
    const addLinkBtn = document.getElementById('add-link-btn');
    const linkError = document.getElementById('link-error');
    const linksList = document.getElementById('links-list');

    // --- Render Functions ---
    const renderNotes = () => {
      notesList.innerHTML = '';
      currentNotes.forEach((note, index) => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center bg-gray-100 p-2 rounded';
        li.textContent = note;
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '削除';
        deleteBtn.className = 'text-red-500 text-sm hover:underline';
        deleteBtn.onclick = () => {
          currentNotes.splice(index, 1);
          renderNotes();
        };
        li.appendChild(deleteBtn);
        notesList.appendChild(li);
      });
    };

    const renderLinks = () => {
      linksList.innerHTML = '';
      currentLinks.forEach((link, index) => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center bg-gray-100 p-2 rounded';
        const a = document.createElement('a');
        a.href = link;
        a.textContent = link;
        a.target = '_blank';
        a.className = 'text-blue-500 hover:underline truncate';
        li.appendChild(a);
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '削除';
        deleteBtn.className = 'text-red-500 text-sm hover:underline';
        deleteBtn.onclick = () => {
          currentLinks.splice(index, 1);
          renderLinks();
        };
        li.appendChild(deleteBtn);
        linksList.appendChild(li);
      });
    };

    // --- Initial Population ---
    if (todo) {
      titleInput.value = todo.title;
      detailInput.value = todo.detail || '';
    }
    renderNotes();
    renderLinks();

    // --- Event Listeners ---
    addNoteBtn.addEventListener('click', () => {
      const noteText = noteInput.value.trim();
      if (noteText) {
        currentNotes.push(noteText);
        noteInput.value = '';
        renderNotes();
      }
    });

    addLinkBtn.addEventListener('click', () => {
      const linkUrl = linkInput.value.trim();
      if (isValidUrl(linkUrl)) {
        currentLinks.push(linkUrl);
        linkInput.value = '';
        linkError.classList.add('hidden');
        renderLinks();
      } else {
        linkError.classList.remove('hidden');
      }
    });

    todoForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const title = titleInput.value;
      const detail = detailInput.value;

      const newTodoData = {
        title,
        detail,
        notes: currentNotes,
        links: currentLinks
      };

      if (idx !== null && todos[idx]) {
        // Update existing ToDo, preserving checked status
        todos[idx] = { ...todos[idx], ...newTodoData };
      } else {
        // Create new ToDo
        todos.push({ ...newTodoData, checked: false });
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
    li.className = 'bg-white p-4 rounded shadow'; // Removed flex from here

    const mainDiv = document.createElement('div');
    mainDiv.className = 'flex justify-between items-center';

    // Checkbox & Text
    const checkboxDiv = document.createElement('div');
    checkboxDiv.className = 'flex items-center';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'mr-4 w-5 h-5 accent-blue-500 flex-shrink-0';
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
    actionsDiv.className = 'flex space-x-2 flex-shrink-0 ml-4';

    const hasNotesOrLinks = (todo.notes && todo.notes.length > 0) || (todo.links && todo.links.length > 0);

    if (hasNotesOrLinks) {
      const detailsBtn = document.createElement('button');
      detailsBtn.className = 'bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 text-sm';
      detailsBtn.textContent = '詳細';
      actionsDiv.appendChild(detailsBtn);
    }

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

    mainDiv.appendChild(checkboxDiv);
    mainDiv.appendChild(actionsDiv);
    li.appendChild(mainDiv);

    // Accordion Content for Notes and Links
    if (hasNotesOrLinks) {
      const accordionContent = document.createElement('div');
      accordionContent.className = 'hidden mt-4 pt-4 border-t border-gray-200';

      // Notes
      if (todo.notes && todo.notes.length > 0) {
        const notesTitle = document.createElement('h4');
        notesTitle.className = 'font-semibold text-sm mb-2';
        notesTitle.textContent = 'メモ';
        const notesUl = document.createElement('ul');
        notesUl.className = 'list-disc list-inside space-y-1 text-gray-700';
        todo.notes.forEach(note => {
          const noteLi = document.createElement('li');
          noteLi.textContent = note;
          notesUl.appendChild(noteLi);
        });
        accordionContent.appendChild(notesTitle);
        accordionContent.appendChild(notesUl);
      }

      // Links
      if (todo.links && todo.links.length > 0) {
        const linksTitle = document.createElement('h4');
        linksTitle.className = 'font-semibold text-sm mt-3 mb-2';
        linksTitle.textContent = 'リンク';
        const linksUl = document.createElement('ul');
        linksUl.className = 'space-y-1';
        todo.links.forEach(link => {
          const linkLi = document.createElement('li');
          const linkA = document.createElement('a');
          linkA.href = link;
          linkA.target = '_blank';
          linkA.className = 'text-blue-500 hover:underline';
          linkA.textContent = link;
          linkLi.appendChild(linkA);
          linksUl.appendChild(linkLi);
        });
        accordionContent.appendChild(linksTitle);
        accordionContent.appendChild(linksUl);
      }

      li.appendChild(accordionContent);

      // Accordion Toggle Logic
      const detailsBtn = actionsDiv.querySelector('button'); // find the details button
      detailsBtn.addEventListener('click', () => {
        accordionContent.classList.toggle('hidden');
      });
    }

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

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
