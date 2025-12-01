/**
 * Theme management for dark mode
 * This script is loaded in the <head> to prevent FOUC (Flash of Unstyled Content).
 */

const themeManager = {
  // Applies the theme ('light' or 'dark') to the <body> element
  applyTheme: function(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  },

  // Determines the effective theme based on saved preference and system settings
  getEffectiveTheme: function() {
    const savedTheme = localStorage.getItem('theme') || 'auto';
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark') {
      return 'dark';
    }
    if (savedTheme === 'light') {
      return 'light';
    }
    // 'auto' or unset
    return systemPrefersDark ? 'dark' : 'light';
  },

  // Sets the initial theme on page load
  init: function() {
    // We need to wait for the body to exist before applying the class.
    const applyInitialTheme = () => {
      if (document.body) {
        this.applyTheme(this.getEffectiveTheme());
      } else {
        setTimeout(applyInitialTheme, 1);
      }
    };
    applyInitialTheme();

    // Listen for changes in OS preference for 'auto' mode
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const savedTheme = localStorage.getItem('theme') || 'auto';
      if (savedTheme === 'auto') {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  },

  // Changes and saves the theme preference
  setTheme: function(theme) { // 'light', 'dark', or 'auto'
    localStorage.setItem('theme', theme);
    this.applyTheme(this.getEffectiveTheme());
  },

  // Gets the current saved theme preference
  getTheme: function() {
      return localStorage.getItem('theme') || 'auto';
  }
};

// Initialize the theme as soon as this script is loaded.
themeManager.init();
