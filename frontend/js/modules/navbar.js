import { syncStoredUserWithSession, watchAuthState } from "../core/auth.js";

function getDashboardPath(role) {
  if (role === "admin") return "../dashboards/admin.html";
  if (role === "owner" || role === "tenant") return "../pages/select-dashboard.html";
  return "../index.html";
}

async function renderNavbar() {
  const welcome = document.getElementById("welcomeUser");
  const navRight = document.querySelector(".nav-right");

  if (!navRight) {
    console.warn("Navbar container not found");
    return;
  }

  const appUser = await syncStoredUserWithSession();
  const email = appUser?.email || "";

  if (!email) {
    navRight.innerHTML = `
      <a href="../pages/login.html" class="btn btn-secondary">Login</a>
      <a href="../pages/register.html" class="btn btn-primary">Register</a>
    `;
    if (welcome) welcome.textContent = "Welcome";
    return;
  }

  if (welcome) {
    welcome.textContent = appUser?.name
      ? `Welcome, ${appUser.name}`
      : "Welcome";
  }

  navRight.innerHTML = `
    <a href="${getDashboardPath(appUser?.role)}" class="btn btn-secondary">Dashboard</a>
    <a href="../pages/profile.html" class="btn btn-primary">Profile</a>
  `;
}

/* 🔥 FIX 1: wait for DOM */
document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();

  /* 🔥 FIX 2: react to auth changes */
  watchAuthState(() => {
    renderNavbar();
  });
});