import { requireUser, logout } from "../core/auth.js";
import { renderFlashMessage, showToast } from "../utils/helpers.js";
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
  return Boolean(
    profile &&
    profile.phone &&
    profile.address &&
    profile.city &&
    profile.owner_type
  );
}

function prefillOwnerProfile(profile) {
  if (!profile) return;
  document.getElementById("ownerPhone").value = profile.phone || "";
  document.getElementById("ownerAddress").value = profile.address || "";
  document.getElementById("ownerCity").value = profile.city || "";
  document.getElementById("ownerType").value = profile.owner_type || "individual";
}

async function loadOwnerSummary() {
  const ownerResult = await getOwnerByUserId(user.user_id);
  const ownerProfile = ownerResult?.data || null;

  prefillOwnerProfile(ownerProfile);
  setProfileStatus(isOwnerProfileComplete(ownerProfile));

  const propertyCountElement = document.getElementById("ownerPropertyCount");
  if (!ownerProfile?.owner_id) {
    if (propertyCountElement) propertyCountElement.textContent = "0";
    return;
  }

  const { data: properties } = await getPropertiesByOwner(ownerProfile.owner_id);
  if (propertyCountElement) propertyCountElement.textContent = String((properties || []).length);
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
    console.error("Failed to save owner profile:", error);
    showToast(`Profile update failed: ${error.message || "unknown error"}`, "error");
    return;
  }

  setProfileStatus(isOwnerProfileComplete(data));
  showToast("Owner profile updated", "success");
  loadOwnerSummary();
});

document.getElementById("logoutBtn").addEventListener("click", logout);

loadOwnerSummary();
