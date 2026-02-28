import { requireUser } from "../core/auth.js";
import { listAgreements } from "../services/agreementService.js";
import { createMaintenanceRequest, listMaintenanceRequests, updateMaintenanceRequest } from "../services/maintenanceService.js";
import { formatCurrency, formatDate } from "../utils/helpers.js";

const user = requireUser(["admin", "owner", "tenant"]);
if (!user) throw new Error("Unauthorized");

const requestForm = document.getElementById("requestForm");
const agreementSelect = document.getElementById("agreementId");
const requestTableBody = document.getElementById("requestTableBody");
const roleTag = document.getElementById("roleTag");

roleTag.textContent = `Logged in as: ${user.role}`;

if (user.role !== "tenant") {
  requestForm.style.display = "none";
}

async function loadAgreementOptionsForTenant() {
  if (user.role !== "tenant") return;

  const { data, error } = await listAgreements();
  if (error) {
    console.error(error);
    alert("Failed to load agreements");
    return;
  }

  const tenantAgreements = (data || []).filter((agreement) => agreement.tenants?.user_id === user.user_id);

  agreementSelect.innerHTML = `<option value="">Select Agreement</option>${tenantAgreements
    .map(
      (agreement) =>
        `<option value="${agreement.agreement_id}">#${agreement.agreement_id} - ${agreement.properties?.address || "-"}</option>`
    )
    .join("")}`;
}

function filterByRole(rows) {
  if (user.role === "admin") return rows;
  if (user.role === "owner") {
    return rows.filter((row) => row.rental_agreements?.properties?.owners?.user_id === user.user_id);
  }
  return rows.filter((row) => row.rental_agreements?.tenants?.user_id === user.user_id);
}

async function loadMaintenanceList() {
  const { data, error } = await listMaintenanceRequests();
  if (error) {
    console.error(error);
    alert("Failed to fetch maintenance requests");
    return;
  }

  const rows = filterByRole(data || []);

  requestTableBody.innerHTML = rows.length
    ? rows
      .map(
        (row) => `
        <tr>
          <td>${row.request_id}</td>
          <td>${row.rental_agreements?.properties?.address || "-"}</td>
          <td>${row.rental_agreements?.tenants?.users?.name || "-"}</td>
          <td>${row.issue_type || "-"}</td>
          <td>${row.description || "-"}</td>
          <td>${formatDate(row.request_date)}</td>
          <td>${row.status || "-"}</td>
          <td>${formatCurrency(row.cost_estimate)}</td>
          <td>${user.role !== "tenant" ? `<button class="btn btn-secondary resolveBtn" data-id="${row.request_id}">Resolve</button>` : "-"}</td>
        </tr>
      `
      )
      .join("")
    : "<tr><td colspan='9'>No maintenance requests found.</td></tr>";
}

requestForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    agreement_id: Number(agreementSelect.value),
    issue_type: document.getElementById("issueType").value.trim(),
    description: document.getElementById("description").value.trim(),
    request_date: document.getElementById("requestDate").value,
    status: "open",
    cost_estimate: Number(document.getElementById("costEstimate").value || 0)
  };

  const { error } = await createMaintenanceRequest(payload);
  if (error) {
    console.error(error);
    alert("Failed to create request");
    return;
  }

  alert("Maintenance request submitted");
  requestForm.reset();
  loadMaintenanceList();
});

requestTableBody.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;
  if (!target.classList.contains("resolveBtn")) return;

  const id = Number(target.dataset.id);
  if (!id) return;

  const cost = prompt("Enter final cost estimate");
  const { error } = await updateMaintenanceRequest(id, {
    status: "resolved",
    cost_estimate: Number(cost || 0)
  });

  if (error) {
    console.error(error);
    alert("Failed to update request");
    return;
  }

  loadMaintenanceList();
});

loadAgreementOptionsForTenant();
loadMaintenanceList();
