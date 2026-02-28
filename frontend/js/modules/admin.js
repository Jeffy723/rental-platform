import { requireUser, logout } from "../core/auth.js";
import { renderFlashMessage } from "../utils/helpers.js";
import { getAllUsers } from "../services/userService.js";
import { listProperties } from "../services/propertyService.js";

const user = requireUser(["admin"]);
if (!user) throw new Error("Unauthorized");

console.log("Admin logged in:", user.name);
renderFlashMessage("dashboard");

async function loadAdminSummary() {
  const [{ data: users }, { data: properties }] = await Promise.all([
    getAllUsers(),
    listProperties()
  ]);

  const userCountElement = document.getElementById("userCount");
  const propertyCountElement = document.getElementById("propertyCount");
  const userTableBody = document.getElementById("userTableBody");
  if (userCountElement) userCountElement.textContent = String((users || []).length);
  if (propertyCountElement) propertyCountElement.textContent = String((properties || []).length);

  if (userTableBody) {
    userTableBody.innerHTML = (users || []).length
      ? users
        .map(
          (row) => `
          <tr>
            <td>${row.user_id}</td>
            <td>${row.name || "-"}</td>
            <td>${row.email || "-"}</td>
            <td>${row.role || "-"}</td>
          </tr>
        `
        )
        .join("")
      : "<tr><td colspan='4'>No users found.</td></tr>";
  }
}

// Logout
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", logout);

loadAdminSummary();
