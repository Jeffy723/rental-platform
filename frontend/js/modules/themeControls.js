const THEME_STORAGE_KEY = "theme";

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  syncToggleLabels(theme);
}

function syncToggleLabels(theme) {
  const isDark = theme === "dark";
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.textContent = isDark ? "☀️ Light mode" : "🌙 Dark mode";
    button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  });
}

function getDashboardUrlByRole() {
  const role = localStorage.getItem("role") || "owner";
  if (role === "admin") return "../dashboards/admin.html";
  if (role === "tenant") return "../dashboards/tenant.html";
  return "../dashboards/owner.html";
}

function wireBackLinks() {
  const dashboardUrl = getDashboardUrlByRole();
  document.querySelectorAll("[data-back-dashboard]").forEach((link) => {
    link.setAttribute("href", dashboardUrl);
  });
}

function init() {
  const initialTheme = getPreferredTheme();
  setTheme(initialTheme);
  wireBackLinks();

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
      setTheme(currentTheme === "dark" ? "light" : "dark");
    });
  });
}

init();
