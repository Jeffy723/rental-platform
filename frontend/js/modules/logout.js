import { setFlashMessage } from "../utils/helpers.js";

function logoutUser() {

  // Clear stored session
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
  localStorage.removeItem("name");

  // Set flash message for login page
  setFlashMessage("Logged out successfully", "success", "auth");

  // Redirect to login
  window.location.href = "../auth/login.html";
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", logoutUser);
}