# CLAUDE.md - AI Assistant Guide for ToDo List Application

## Project Overview

This is a simple, client-side only ToDo list web application built with vanilla JavaScript, HTML5, and Tailwind CSS. The application uses `localStorage` for data persistence and requires no backend server or build process.

**Language**: Japanese (UI and documentation)
**Type**: Educational/demonstration project
**Status**: Active development

## Quick Start

1. Open `login.html` in a browser
2. Default credentials: username `user`, password `pass`
3. No build tools, package managers, or server required

## Architecture

### Technology Stack

- **HTML5**: Semantic markup with Japanese language support (`lang="ja"`)
- **JavaScript ES6**: Vanilla JavaScript with modern syntax
- **Tailwind CSS**: Via CDN (https://cdn.tailwindcss.com)
- **Storage**: Browser `localStorage` for data persistence

### Application Type

- **Client-side only**: No backend, API, or database
- **Multi-page application (MPA)**: Three separate HTML files with page reloads for navigation
- **State management**: `localStorage` acts as the single source of truth

### Data Flow

```
User Action → JavaScript Function → localStorage → Re-render DOM
                                    ↓
                            Persisted across sessions
```

## File Structure

```
todo-list/
├── login.html              # Login page
├── todolist.html           # ToDo list view (main page)
├── edit.html               # Create/edit ToDo form
├── js/
│   └── app.js              # All JavaScript logic (192 lines)
├── .github/
│   └── copilot-instructions.md   # GitHub Copilot AI guide
├── .gemini/
│   └── styleguide.md             # Gemini AI guide (Japanese responses)
├── README.md               # User-facing documentation (Japanese)
└── CLAUDE.md              # This file (Claude AI guide)
```

### HTML Files

All HTML files share common patterns:
- UTF-8 encoding with Japanese language support
- Responsive viewport meta tag
- Tailwind CSS CDN in `<head>`
- Import `js/app.js` before closing `</body>`
- Clean, semantic markup with Tailwind utility classes

**login.html**
- Simple centered login form
- Username and password inputs (both required)
- Error message container (hidden by default)
- Form ID: `loginForm`

**todolist.html**
- Header with title and logout button
- "新規作成" (Create New) button linking to `edit.html`
- Empty `<ul id="todoList">` container (populated by JavaScript)

**edit.html**
- Centered form for creating/editing ToDos
- Title input (required) and detail textarea (optional)
- Form ID: `todoForm`
- Query parameter `?idx=N` indicates edit mode

## JavaScript Architecture (app.js)

### Code Organization

The `app.js` file is organized into logical sections:

1. **Authentication Functions** (lines 5-25)
2. **Data Management Functions** (lines 27-35)
3. **Page Initialization** (lines 37-103)
4. **Rendering & Actions** (lines 105-191)

### Key Functions

#### Authentication

```javascript
checkLogin()
```
- Verifies `localStorage.getItem('todo_login') === '1'`
- Redirects to `login.html` if not authenticated
- Called on page load for protected pages

```javascript
login(username, password)
```
- **Hardcoded credentials**: `user` / `pass`
- Returns `true` on success, `false` on failure
- Sets `localStorage.setItem('todo_login', '1')`
- **Security note**: Not suitable for production use

```javascript
logout()
```
- Removes `todo_login` from localStorage
- Redirects to `login.html`

#### Data Management

```javascript
getTodos()
```
- Returns parsed array from `localStorage.getItem('todos')`
- Defaults to empty array `[]` if no data exists
- **Location**: js/app.js:29

```javascript
saveTodos(todos)
```
- Stringifies and saves array to `localStorage.setItem('todos', ...)`
- **Location**: js/app.js:33

#### Page-Specific Logic

The app uses a single DOMContentLoaded event listener that determines which page logic to execute based on the presence of specific DOM elements:

**Login Page** (lines 50-64)
- Detects `#loginForm`
- Handles form submission
- Shows error message on failed login
- Returns early to skip authentication check

**Edit Page** (lines 72-96)
- Detects `#todoForm`
- Reads `?idx=` query parameter for edit mode
- Pre-fills form fields if editing existing ToDo
- Preserves `checked` property when updating
- Redirects to `todolist.html` after save

**ToDo List Page** (lines 99-102)
- Detects `#todoList`
- Calls `renderTodos()` to populate the list

#### Rendering & Actions

```javascript
renderTodos()
```
- Clears and rebuilds `#todoList` DOM
- Creates elements programmatically (no innerHTML for user data)
- **Security**: Uses `textContent` instead of `innerHTML` to prevent XSS
- Attaches event listeners to checkboxes and delete buttons
- Shows "ToDoがありません。" when empty
- **Location**: js/app.js:109

```javascript
toggleCheck(idx)
```
- Toggles `checked` boolean for ToDo at index
- Saves and re-renders
- **Location**: js/app.js:176

```javascript
deleteTodo(idx)
```
- Shows confirmation dialog: "本当に削除しますか？"
- Uses `Array.splice(idx, 1)` to remove
- Saves and re-renders
- **Location**: js/app.js:185

## Data Structure

### localStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `todo_login` | String | Authentication flag (`'1'` = logged in) |
| `todos` | JSON String | Serialized array of ToDo objects |

### ToDo Object Schema

```javascript
{
  title: String,    // Required. ToDo title/name
  detail: String,   // Optional. Additional details
  checked: Boolean  // Completion status (default: false)
}
```

**Example**:
```javascript
[
  {
    title: "買い物に行く",
    detail: "牛乳、卵、パンを買う",
    checked: false
  },
  {
    title: "レポート提出",
    detail: "",
    checked: true
  }
]
```

## Coding Conventions

### JavaScript Style

- **ES6 syntax**: Arrow functions, template literals, destructuring
- **No semicolons**: Optional (but used consistently in this project)
- **DOM manipulation**:
  - Use `document.getElementById()` for element selection
  - Create elements with `document.createElement()`
  - Use `textContent` (never `innerHTML`) for user-generated content
- **Event handling**:
  - Prefer `addEventListener()` over inline `onclick` attributes
  - Attach listeners in DOMContentLoaded callback or during render
- **Error handling**: Minimal (relies on browser defaults)

### Security Practices

✅ **What the code does well**:
- Uses `textContent` to prevent XSS when rendering user data
- No use of `eval()` or dangerous patterns

⚠️ **Known limitations** (acceptable for demo/learning project):
- Hardcoded credentials in source code
- No CSRF protection (client-side only, so N/A)
- No input sanitization (relies on textContent)
- Authentication state stored in plain localStorage

### HTML/CSS Patterns

- **Tailwind classes**: Utility-first approach
- **Responsive**: Uses Tailwind responsive utilities and flexbox
- **Accessibility**: Basic form labels, but could be improved
- **Class naming**: Tailwind utilities only (no custom CSS)

## Development Workflows

### Making Changes

1. **Edit HTML/JS files directly** in your editor
2. **Refresh browser** to see changes (no build step)
3. **Test manually** in browser DevTools
4. **Commit with clear messages** (see Git Conventions below)

### Debugging

- **Console logging**: Add `console.log()` statements
- **DevTools**:
  - Application tab → Local Storage to inspect data
  - Console for errors
  - Elements tab for DOM inspection
- **Network tab**: Verify CDN resources load correctly

### Testing Strategy

**Current state**: No automated tests

**Manual testing checklist**:
- [ ] Login with correct credentials
- [ ] Login with incorrect credentials (should show error)
- [ ] Create new ToDo
- [ ] Edit existing ToDo
- [ ] Toggle ToDo completion
- [ ] Delete ToDo
- [ ] Logout and verify session cleared
- [ ] Test with empty localStorage
- [ ] Test with multiple ToDos

**Recommended for future**:
- Unit tests with Jest or Vitest
- E2E tests with Playwright or Cypress
- Accessibility testing with axe-core

## Git Conventions

### Branch Naming

- **Feature branches**: Start with `claude/` for AI assistant work
- **Main branch**: Default branch for stable code
- Always develop on designated feature branches

### Commit Messages

**Pattern observed in history**:
- Japanese language commit messages
- Descriptive and concise
- Examples:
  - "GeminiCodeAssistのプルリクエストレビューの日本語化設定を追加"
  - "READMEを追加"
  - "カスタムインストラクションの追加"

**Best practices**:
- Write clear, descriptive messages
- Use Japanese (to match existing pattern)
- Focus on "what" and "why" rather than "how"

### Workflow

1. Make changes on feature branch
2. Test thoroughly in browser
3. Commit with descriptive message
4. Push to remote: `git push -u origin <branch-name>`
5. Create pull request when ready

## Common Tasks for AI Assistants

### Adding a New Feature

1. **Read existing code first**: Never propose changes without understanding current implementation
2. **Follow existing patterns**: Match the style in app.js
3. **Update data structure if needed**: Modify ToDo object schema in localStorage
4. **Test in browser**: Verify functionality works end-to-end
5. **Update documentation**: Modify this CLAUDE.md file if architecture changes

### Refactoring Guidelines

⚠️ **Avoid over-engineering**:
- Don't add features not explicitly requested
- Don't add TypeScript, bundlers, or frameworks unless asked
- Don't add excessive error handling for impossible scenarios
- Keep it simple - this is a learning/demo project

✅ **Good refactorings**:
- Extract repeated code into functions
- Improve accessibility (ARIA labels, keyboard navigation)
- Add meaningful comments for complex logic
- Improve security (input validation, CSP headers if deploying)

### Bug Fix Workflow

1. **Reproduce the bug**: Test in browser first
2. **Identify root cause**: Use DevTools debugger
3. **Make minimal fix**: Change only what's necessary
4. **Verify fix**: Test the specific scenario
5. **Check for regressions**: Test related functionality

### Code Review Considerations

When reviewing or modifying code, check for:
- **XSS vulnerabilities**: Ensure user input uses `textContent` not `innerHTML`
- **Index bounds**: Verify array access with `todos[idx]` checks for existence
- **Data consistency**: Ensure localStorage stays in sync with UI
- **Japanese language**: UI text should remain in Japanese
- **Tailwind classes**: Follow existing utility patterns
- **Browser compatibility**: Test in modern browsers (Chrome, Firefox, Safari)

## Important Caveats

### What NOT to do

- ❌ Don't add backend/API endpoints (project is client-side only)
- ❌ Don't add build tools (Webpack, Vite, etc.) unless specifically requested
- ❌ Don't convert to SPA framework (React, Vue) without explicit request
- ❌ Don't add databases (the project uses localStorage intentionally)
- ❌ Don't remove Japanese language (UI is intentionally in Japanese)
- ❌ Don't add CDN alternatives without testing (Tailwind CSS CDN is required)

### Limitations to be aware of

- **localStorage limits**: ~5-10MB depending on browser
- **No user isolation**: All users share same browser storage
- **No sync**: Data is local to one browser
- **Hardcoded auth**: Credentials are in source code (not production-ready)
- **No validation**: Accepts any string input for title/detail

## Deployment

### Current State

No deployment configuration exists. The app runs directly from the filesystem.

### Potential Deployment Options

If deployment is requested:

1. **GitHub Pages**:
   - Static hosting (free)
   - Perfect for this project
   - No build step needed

2. **Netlify/Vercel**:
   - Drop-in static hosting
   - No configuration needed

3. **Simple HTTP Server**:
   - `python -m http.server`
   - `npx serve`

**Note**: All options work since there's no backend to deploy.

## AI Assistant Collaboration

### Other AI Assistant Guides

This project includes guides for multiple AI assistants:

- **.github/copilot-instructions.md**: GitHub Copilot (comprehensive, English)
- **.gemini/styleguide.md**: Gemini Code Assist (Japanese responses requested)
- **CLAUDE.md**: This file (Claude Code)

### Coordination Guidelines

When working with other AI assistants or developers:
- Read README.md and other AI guides to understand expectations
- Maintain consistency with established patterns
- Preserve Japanese language in UI
- Keep the project simple and focused

### Communication Style

- **Be concise**: Users are working in CLI environment
- **Use code references**: Format as `file_path:line_number`
- **Avoid assumptions**: Read code before suggesting changes
- **Ask when uncertain**: Clarify requirements before implementing

## Troubleshooting

### Common Issues

**Problem**: Login doesn't work
**Solution**: Check browser console for errors. Verify `js/app.js` is loading.

**Problem**: ToDos disappear after refresh
**Solution**: Check DevTools → Application → Local Storage. Verify `todos` key exists.

**Problem**: Styles not loading
**Solution**: Verify internet connection (Tailwind CSS is via CDN). Check Network tab.

**Problem**: Can't edit existing ToDo
**Solution**: Verify URL has `?idx=N` parameter. Check console for errors.

**Problem**: Changes not appearing
**Solution**: Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R) to clear cache.

## Changelog

### 2025-11-28
- Created comprehensive CLAUDE.md guide for AI assistants
- Documented all functions, data structures, and workflows
- Established coding conventions and common tasks

---

**Last Updated**: 2025-11-28
**Maintained by**: AI assistants working on this repository
**Questions?**: Refer to README.md for user documentation or app.js for implementation details
