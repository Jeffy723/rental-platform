import { requireUser } from "../core/auth.js";
import { listProperties, getPropertiesByOwner, deleteProperty, updateProperty } from "../services/propertyService.js";
import { getOwnerByUserId } from "../services/userService.js";
import { formatCurrency, showToast } from "../utils/helpers.js";

const user = requireUser(["admin", "owner", "tenant"]);
if (!user) throw new Error("Unauthorized");

const cityFilter = document.getElementById("cityFilter");
const statusFilter = document.getElementById("statusFilter");
const searchBtn = document.getElementById("searchBtn");
const propertyTableBody = document.getElementById("propertyTableBody");
const propertyCards = document.getElementById("propertyCards");

const FALLBACK_IMG = "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80";

function statusClass(status) {
  const value = (status || "").toLowerCase();
  if (value === "available") return "status-pill status-available";
  if (value === "rented") return "status-pill status-rented";
  return "status-pill status-inactive";
}

async function fetchProperties() {
  let data;
  let error;

  if (user.role === "owner") {
    const ownerResult = await getOwnerByUserId(user.user_id);
    if (ownerResult.error || !ownerResult.data) {
      showToast("Owner profile not found", "error");
      return;
    }
    ({ data, error } = await getPropertiesByOwner(ownerResult.data.owner_id));
  } else {
    ({ data, error } = await listProperties({ city: cityFilter.value.trim(), status: statusFilter.value.trim() }));
  }

  if (error) {
    showToast("Failed to fetch properties", "error");
    return;
  }

  renderCards(data || []);
  renderTable(data || []);
}

function renderCards(properties) {
  if (!properties.length) {
    propertyCards.innerHTML = "<div class='empty-state'>No properties found. Try another city or status.</div>";
    return;
  }

  propertyCards.innerHTML = properties.map((property) => {
    const imageUrl = property.property_images?.[0]?.image_url || FALLBACK_IMG;
    const ownerName = property.owners?.users?.name || "Owner";
    const ownerEmail = property.owners?.users?.email || "N/A";
    return `
      <article class="property-card">
        <img src="${imageUrl}" alt="${property.title || "Property"}" />
        <div class="property-body">
          <h4>${property.title || "Untitled listing"}</h4>
          <p class="property-meta">${property.city || "-"}</p>
          <p><strong>${formatCurrency(property.rent_amount)}</strong> / month</p>
          <p><span class="${statusClass(property.status)}">${property.status || "Unknown"}</span></p>
          <p class="property-meta">Owner contact: ${ownerName} (${ownerEmail})</p>
          <div class="actions-row">
            <a class="btn btn-secondary" href="./property-details.html?id=${property.property_id}">Details</a>
            <a class="btn btn-primary" href="mailto:${ownerEmail}">Contact owner</a>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderTable(properties) {
  if (!properties.length) {
    propertyTableBody.innerHTML = "<tr><td colspan='7'>No properties found.</td></tr>";
    return;
  }

  propertyTableBody.innerHTML = properties.map((property) => {
    const ownerName = property.owners?.users?.name || "-";
    const ownerEmail = property.owners?.users?.email || "";
    const canManage = user.role === "admin" || (user.role === "owner" && property.owners?.user_id === user.user_id);

    return `
      <tr>
        <td>${property.property_id}</td>
        <td>${property.title || "-"}</td>
        <td>${property.address || "-"}, ${property.city || "-"}</td>
        <td>${formatCurrency(property.rent_amount)}</td>
        <td><span class="${statusClass(property.status)}">${property.status || "-"}</span></td>
        <td>${ownerEmail ? `${ownerName}<br/><a href='mailto:${ownerEmail}'>${ownerEmail}</a>` : ownerName}</td>
        <td>
          ${canManage ? `<button class='btn btn-secondary editBtn' data-id='${property.property_id}'>Edit rent</button>` : "-"}
          ${canManage ? `<button class='btn btn-danger deleteBtn' data-id='${property.property_id}'>Delete</button>` : ""}
        </td>
      </tr>
    `;
  }).join("");
}

async function handleDelete(propertyId) {
  if (!confirm(`Delete property #${propertyId}?`)) return;
  const { error } = await deleteProperty(propertyId);
  if (error) {
    showToast("Delete failed", "error");
    return;
  }
  showToast("Property deleted", "success");
  fetchProperties();
}

async function handleEdit(propertyId) {
  const newRent = prompt("Enter new monthly rent:");
  if (!newRent) return;
  const { error } = await updateProperty(propertyId, { rent_amount: Number(newRent) });
  if (error) {
    showToast("Update failed", "error");
    return;
  }
  showToast("Rent updated", "success");
  fetchProperties();
}

searchBtn.addEventListener("click", fetchProperties);
propertyTableBody.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;
  const propertyId = Number(target.dataset.id);
  if (!propertyId) return;
  if (target.classList.contains("deleteBtn")) await handleDelete(propertyId);
  if (target.classList.contains("editBtn")) await handleEdit(propertyId);
});

fetchProperties();
