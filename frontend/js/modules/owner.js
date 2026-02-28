import { requireUser } from "../core/auth.js";
import { renderFlashMessage, showToast, formatCurrency } from "../utils/helpers.js";
import { validatePropertyPayload } from "../utils/validators.js";
import { getOwnerByUserId, saveOwnerProfile } from "../services/userService.js";
import { createProperty, getPropertiesByOwner, uploadPropertyImage } from "../services/propertyService.js";

const user = requireUser(["owner"]);
if (!user) throw new Error("Unauthorized");

renderFlashMessage("dashboard");

const ownerProfileForm = document.getElementById("ownerProfileForm");
const ownerProfileStatus = document.getElementById("ownerProfileStatus");
const ownerQuickPropertyForm = document.getElementById("ownerQuickPropertyForm");
const ownerQuickImageInput = document.getElementById("quickPropertyImages");
const ownerQuickGalleryPreview = document.getElementById("ownerQuickGalleryPreview");

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

function renderQuickImagePreviews() {
  const files = Array.from(ownerQuickImageInput.files || []);
  ownerQuickGalleryPreview.innerHTML = files.length
    ? files.map((file) => `<img src="${URL.createObjectURL(file)}" alt="upload preview" />`).join("")
    : "";
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

ownerQuickImageInput.addEventListener("change", renderQuickImagePreviews);

ownerQuickPropertyForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const { data: ownerData, error: ownerError } = await getOwnerByUserId(user.user_id);
  if (ownerError || !ownerData?.owner_id) {
    showToast("Please complete owner profile before adding properties", "error");
    return;
  }

  const payload = {
    title: document.getElementById("quickTitle").value.trim(),
    property_type: document.getElementById("quickPropertyType").value.trim(),
    address: document.getElementById("quickAddress").value.trim(),
    city: document.getElementById("quickCity").value.trim(),
    rent_amount: Number(document.getElementById("quickRent").value || 0),
    area_sqft: 0,
    bedrooms: 0,
    bathrooms: 0,
    office_rooms: 0,
    shop_units: 0,
    allowed_usage: "",
    status: document.getElementById("quickStatus").value,
    owner_id: ownerData.owner_id
  };

  const validation = validatePropertyPayload(payload);
  if (!validation.valid) {
    showToast(validation.errors.join(", "), "error");
    return;
  }

  const submitBtn = ownerQuickPropertyForm.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.textContent = "Publishing...";

  const { data, error } = await createProperty(payload);
  if (error || !data?.property_id) {
    showToast("Failed to add property", "error");
    submitBtn.disabled = false;
    submitBtn.textContent = "Publish Property";
    return;
  }

  const files = Array.from(ownerQuickImageInput.files || []);
  for (const file of files) {
    const uploadResult = await uploadPropertyImage(file, data.property_id);
    if (uploadResult.error) {
      console.error("Image upload failed", uploadResult.error);
    }
  }

  showToast("Property published successfully", "success");
  ownerQuickPropertyForm.reset();
  ownerQuickGalleryPreview.innerHTML = "";
  submitBtn.disabled = false;
  submitBtn.textContent = "Publish Property";
  loadOwnerSummary();
});

loadOwnerSummary();
