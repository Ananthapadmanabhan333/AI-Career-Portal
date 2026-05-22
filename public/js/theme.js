/**
 * High-Performance Client Theme Persister (Light/Dark Mode)
 * Saves selections locally and switches variables accordingly.
 */

document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (!themeToggleBtn) return;

  const htmlElement = document.documentElement;

  // Read persisted preference or default to Dark mode
  const currentTheme = localStorage.getItem('theme') || 'dark';
  htmlElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(themeToggleBtn, currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    const activeTheme = htmlElement.getAttribute('data-theme');
    const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(themeToggleBtn, newTheme);
  });
});

function updateThemeIcon(btn, theme) {
  const icon = btn.querySelector('i');
  if (!icon) return;

  if (theme === 'light') {
    icon.className = 'fa-solid fa-sun text-warning';
  } else {
    icon.className = 'fa-solid fa-moon text-primary';
  }
}
