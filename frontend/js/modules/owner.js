import { requireUser, logout } from "../core/auth.js";
import { renderFlashMessage, showToast, formatCurrency } from "../utils/helpers.js";
import { getOwnerByUserId, saveOwnerProfile } from "../services/userService.js";
import { getPropertiesByOwner } from "../services/propertyService.js";

const user = requireUser(["owner"]);
if (!user) throw new Error("Unauthorized");

renderFlashMessage("dashboard");

const ownerProfileForm = document.getElementById("ownerProfileForm");
const ownerProfileStatus = document.getElementById("ownerProfileStatus");

function setProfileStatus(isComplete) {
  ownerProfileStatus.textContent = isComplete ? "Complete" : "Incomplete";
}

function isOwnerProfileComplete(profile) {
  return Boolean(profile && profile.phone && profile.address && profile.city && profile.owner_type);
}

function prefillOwnerProfile(profile) {
  if (!profile) return;
  document.getElementById("ownerPhone").value = profile.phone || "";
  document.getElementById("ownerAddress").value = profile.address || "";
  document.getElementById("ownerCity").value = profile.city || "";
  document.getElementById("ownerType").value = profile.owner_type || "Local";
}

async function loadOwnerSummary() {
  const ownerResult = await getOwnerByUserId(user.user_id);
  const ownerProfile = ownerResult?.data || null;

  prefillOwnerProfile(ownerProfile);
  setProfileStatus(isOwnerProfileComplete(ownerProfile));

  const propertyCountElement = document.getElementById("ownerPropertyCount");
  const rentedCountElement = document.getElementById("ownerRentedCount");
  const incomeElement = document.getElementById("ownerIncome");
  const preview = document.getElementById("ownerPropertyPreview");

  if (!ownerProfile?.owner_id) {
    propertyCountElement.textContent = "0";
    rentedCountElement.textContent = "0";
    incomeElement.textContent = formatCurrency(0);
    preview.innerHTML = "<div class='empty-state'>No properties yet. Add your first listing to start.</div>";
    return;
  }

  const { data: properties } = await getPropertiesByOwner(ownerProfile.owner_id);
  const rows = properties || [];
  const rented = rows.filter((item) => item.status === "Rented");
  const income = rented.reduce((sum, item) => sum + Number(item.rent_amount || 0), 0);

  propertyCountElement.textContent = String(rows.length);
  rentedCountElement.textContent = String(rented.length);
  incomeElement.textContent = formatCurrency(income);

  preview.innerHTML = rows.length
    ? rows.slice(0, 3).map((item) => `<article class='property-card'><img src='${item.property_images?.[0]?.image_url || "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80"}' alt='property'/><div class='property-body'><h4>${item.title || "Untitled"}</h4><p class='property-meta'>${item.city || "-"}</p><p><strong>${formatCurrency(item.rent_amount)}</strong></p></div></article>`).join("")
    : "<div class='empty-state'>No listings found.</div>";
}

ownerProfileForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    phone: document.getElementById("ownerPhone").value.trim(),
    address: document.getElementById("ownerAddress").value.trim(),
    city: document.getElementById("ownerCity").value.trim(),
    owner_type: document.getElementById("ownerType").value
  };

  if (!payload.phone || !payload.address || !payload.city || !payload.owner_type) {
    showToast("Please fill all owner profile fields", "error");
    return;
  }

  const { data, error } = await saveOwnerProfile(user.user_id, payload);
  if (error) {
    showToast(`Profile update failed: ${error.message || "unknown error"}`, "error");
    return;
  }

  setProfileStatus(isOwnerProfileComplete(data));
  showToast("Owner profile updated", "success");
  loadOwnerSummary();
});

document.getElementById("logoutBtn").addEventListener("click", logout);
loadOwnerSummary();
