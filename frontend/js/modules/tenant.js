import { requireUser, logout } from "../core/auth.js";
import { renderFlashMessage, showToast } from "../utils/helpers.js";
import { listProperties } from "../services/propertyService.js";
import { getTenantByUserId, saveTenantProfile } from "../services/userService.js";

const user = requireUser(["tenant"]);
if (!user) throw new Error("Unauthorized");

renderFlashMessage("dashboard");

const tenantProfileForm = document.getElementById("tenantProfileForm");
const tenantProfileStatus = document.getElementById("tenantProfileStatus");

function setProfileStatus(isComplete) {
  tenantProfileStatus.textContent = isComplete ? "Complete" : "Incomplete";
}

function isTenantProfileComplete(profile) {
  return Boolean(
    profile &&
    profile.phone &&
    profile.aadhaar_no &&
    profile.occupation &&
    profile.permanent_address &&
    profile.city
  );
}

function prefillTenantProfile(profile) {
  if (!profile) return;
  document.getElementById("tenantPhone").value = profile.phone || "";
  document.getElementById("aadhaarNo").value = profile.aadhaar_no || "";
  document.getElementById("occupation").value = profile.occupation || "";
  document.getElementById("permanentAddress").value = profile.permanent_address || "";
  document.getElementById("tenantCity").value = profile.city || "";
}

async function loadTenantSummary() {
  const [{ data: properties }, tenantResult] = await Promise.all([
    listProperties({ status: "available" }),
    getTenantByUserId(user.user_id)
  ]);

  const availableCountElement = document.getElementById("availablePropertyCount");
  if (availableCountElement) availableCountElement.textContent = String((properties || []).length);

  const tenantProfile = tenantResult?.data || null;
  prefillTenantProfile(tenantProfile);
  setProfileStatus(isTenantProfileComplete(tenantProfile));
}

tenantProfileForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    phone: document.getElementById("tenantPhone").value.trim(),
    aadhaar_no: document.getElementById("aadhaarNo").value.trim(),
    occupation: document.getElementById("occupation").value.trim(),
    permanent_address: document.getElementById("permanentAddress").value.trim(),
    city: document.getElementById("tenantCity").value.trim()
  };

  if (!payload.phone || !payload.aadhaar_no || !payload.occupation || !payload.permanent_address || !payload.city) {
    showToast("Please fill all tenant profile fields", "error");
    return;
  }

  const { data, error } = await saveTenantProfile(user.user_id, payload);
  if (error) {
    console.error("Failed to save tenant profile:", error);
    showToast(`Profile update failed: ${error.message || "unknown error"}`, "error");
    return;
  }

  setProfileStatus(isTenantProfileComplete(data));
  showToast("Tenant profile updated", "success");
});

document.getElementById("logoutBtn").addEventListener("click", logout);

loadTenantSummary();
