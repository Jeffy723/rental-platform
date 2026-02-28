import { requireUser } from "../core/auth.js";
import { listProperties, getPropertiesByOwner, deleteProperty, updateProperty } from "../services/propertyService.js";
import { getOwnerByUserId } from "../services/userService.js";
import { formatCurrency } from "../utils/helpers.js";

const user = requireUser(["admin", "owner", "tenant"]);
if (!user) throw new Error("Unauthorized");

const cityFilter = document.getElementById("cityFilter");
const statusFilter = document.getElementById("statusFilter");
const searchBtn = document.getElementById("searchBtn");
const propertyTableBody = document.getElementById("propertyTableBody");

async function fetchProperties() {
  let data;
  let error;

  if (user.role === "owner") {
    const ownerResult = await getOwnerByUserId(user.user_id);
    if (ownerResult.error || !ownerResult.data) {
      alert("Owner profile not found");
      return;
    }
    ({ data, error } = await getPropertiesByOwner(ownerResult.data.owner_id));
  } else {
    ({ data, error } = await listProperties({
      city: cityFilter.value.trim(),
      status: statusFilter.value.trim()
    }));
  }

  if (error) {
    console.error(error);
    alert("Failed to fetch properties");
    return;
  }

  renderTable(data || []);
}

function renderTable(properties) {
  if (properties.length === 0) {
    propertyTableBody.innerHTML = "<tr><td colspan='9'>No properties found.</td></tr>";
    return;
  }

  propertyTableBody.innerHTML = properties
    .map((property) => {
      const ownerName = property.owners?.users?.name || "-";
      const ownerEmail = property.owners?.users?.email || "";
      const imageUrl = property.property_images?.[0]?.image_url || "";
      const canManage = user.role === "admin" || (user.role === "owner" && property.owners?.user_id === user.user_id);
      const ownerContact = ownerEmail ? `${ownerName}<br/><a href="mailto:${ownerEmail}">${ownerEmail}</a>` : ownerName;

      return `
        <tr>
          <td>${property.property_id}</td>
          <td>${property.title || "-"}</td>
          <td>${property.property_type || "-"}</td>
          <td>${property.address || "-"}, ${property.city || "-"}</td>
          <td>${formatCurrency(property.rent_amount)}</td>
          <td>${property.status || "-"}</td>
          <td>${ownerContact}</td>
          <td>${imageUrl ? `<a href="${imageUrl}" target="_blank">View</a>` : "-"}</td>
          <td>
            ${canManage ? `<button class="btn btn-secondary editBtn" data-id="${property.property_id}">Edit</button>` : "-"}
            ${canManage ? `<button class="btn btn-danger deleteBtn" data-id="${property.property_id}">Delete</button>` : ""}
          </td>
        </tr>
      `;
    })
    .join("");
}

async function handleDelete(propertyId) {
  if (!confirm(`Delete property #${propertyId}?`)) return;
  const { error } = await deleteProperty(propertyId);
  if (error) {
    console.error(error);
    alert("Delete failed");
    return;
  }
  fetchProperties();
}

async function handleEdit(propertyId) {
  const newRent = prompt("Enter new monthly rent:");
  if (!newRent) return;
  const { error } = await updateProperty(propertyId, { rent_amount: Number(newRent) });
  if (error) {
    console.error(error);
    alert("Update failed");
    return;
  }
  fetchProperties();
}

searchBtn.addEventListener("click", fetchProperties);
propertyTableBody.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;

  const propertyId = Number(target.dataset.id);
  if (!propertyId) return;

  if (target.classList.contains("deleteBtn")) {
    await handleDelete(propertyId);
  }

  if (target.classList.contains("editBtn")) {
    await handleEdit(propertyId);
  }
});

fetchProperties();
