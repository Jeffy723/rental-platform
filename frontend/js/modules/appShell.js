function getCurrentUser() {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getBasePrefix() {
  const path = window.location.pathname;
  if (path.includes("/pages/") || path.includes("/dashboards/")) return "../";
  return "./";
}

function getNavByRole(role) {
  if (role === "owner") {
    return [
      ["Dashboard", "dashboards/owner.html"],
      ["Add Property", "pages/add-property.html"],
      ["Properties", "pages/property-list.html"],
      ["Agreements", "pages/agreements.html"],
      ["Payments", "pages/payments.html"],
      ["Maintenance", "pages/maintenance.html"]
    ];
  }

  if (role === "tenant") {
    return [
      ["Dashboard", "dashboards/tenant.html"],
      ["Browse", "pages/property-list.html"],
      ["Agreements", "pages/agreements.html"],
      ["Payments", "pages/payments.html"],
      ["Maintenance", "pages/maintenance.html"]
    ];
  }

  if (role === "admin") {
    return [
      ["Dashboard", "dashboards/admin.html"],
      ["Properties", "pages/property-list.html"],
      ["Agreements", "pages/agreements.html"],
      ["Payments", "pages/payments.html"],
      ["Maintenance", "pages/maintenance.html"]
    ];
  }

  return [
    ["Home", "index.html"],
    ["About", "pages/about.html"],
    ["Discover", "pages/discover.html"],
    ["Terms", "pages/terms.html"]
  ];
}

function buildLink(prefix, [label, href]) {
  const fullHref = `${prefix}${href}`;
  const active = window.location.pathname.endsWith(`/${href}`) || window.location.pathname.endsWith(href);
  return `<a class="${active ? "active" : ""}" href="${fullHref}">${label}</a>`;
}

function getRoleClass(role) {
  if (role === "admin") return "role-admin";
  if (role === "owner") return "role-owner";
  return "role-tenant";
}

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("") || "U";
}

function renderUtilityBar() {
  const utility = document.querySelector(".utility-bar");
  if (!utility) return;

  const user = getCurrentUser();
  const role = user?.role;
  const prefix = getBasePrefix();
  const links = getNavByRole(role).map((link) => buildLink(prefix, link)).join("");
  const existingContent = utility.innerHTML.trim();

  utility.innerHTML = `
    <div class="app-nav shell-panel app-nav-fixed">
      <a class="app-brand" href="${prefix}index.html">🏠 Rental Platform</a>
      <nav class="app-links">${links}</nav>
      <div class="app-user-actions">
        ${user ? `
          <a class="profile-link" href="${prefix}pages/profile.html" aria-label="Profile">
            <span class="avatar-placeholder">${getInitials(user.name)}</span>
            <span>${user.name || "User"}</span>
            <span class="role-chip ${getRoleClass(user.role)}">${user.role || "member"}</span>
          </a>
          <button id="logoutBtn" class="btn btn-danger" type="button">Logout</button>
        ` : `
          <a class="btn btn-secondary" href="${prefix}pages/login.html">Login</a>
          <a class="btn btn-primary" href="${prefix}pages/register.html">Sign up</a>
        `}
      </div>
    </div>
    ${existingContent ? `<div class="utility-secondary-actions">${existingContent}</div>` : ""}
  `;
}

renderUtilityBar();

if (document.getElementById("logoutBtn")) {
  import("./logout.js");
}

