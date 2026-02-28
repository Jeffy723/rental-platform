import { requireUser, logout } from "../core/auth.js";

const user = requireUser(["admin", "owner", "tenant"]);
if (!user) throw new Error("Unauthorized");

const profileDetails = document.getElementById("profileDetails");

function valueOrFallback(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

profileDetails.innerHTML = `
  <article class="profile-item"><p class="profile-label">Name</p><p class="profile-value">${valueOrFallback(user.name)}</p></article>
  <article class="profile-item"><p class="profile-label">Email</p><p class="profile-value">${valueOrFallback(user.email)}</p></article>
  <article class="profile-item"><p class="profile-label">Role</p><p class="profile-value role-chip">${valueOrFallback(user.role)}</p></article>
  <article class="profile-item"><p class="profile-label">User ID</p><p class="profile-value">${valueOrFallback(user.user_id)}</p></article>
`;

document.getElementById("logoutBtn").addEventListener("click", logout);
