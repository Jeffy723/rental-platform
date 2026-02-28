import { requireUser } from "../core/auth.js";
import { getOwnerByUserId } from "../services/userService.js";
import { createProperty, uploadPropertyImage } from "../services/propertyService.js";
import { validatePropertyPayload } from "../utils/validators.js";
import { showToast } from "../utils/helpers.js";

const user = requireUser(["owner"]);
if (!user) throw new Error("Unauthorized");

const form = document.getElementById("propertyForm");
const imageInput = document.getElementById("propertyImages");
const galleryPreview = document.getElementById("galleryPreview");

imageInput.addEventListener("change", () => {
  const files = Array.from(imageInput.files || []);
  galleryPreview.innerHTML = files.length
    ? files.map((file) => `<img src="${URL.createObjectURL(file)}" alt="upload preview" />`).join("")
    : "";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    title: document.getElementById("title").value.trim(),
    property_type: document.getElementById("propertyType").value.trim(),
    address: document.getElementById("address").value.trim(),
    city: document.getElementById("city").value.trim(),
    area_sqft: Number(document.getElementById("areaSqft").value || 0),
    bedrooms: Number(document.getElementById("bedrooms").value || 0),
    bathrooms: Number(document.getElementById("bathrooms").value || 0),
    office_rooms: Number(document.getElementById("officeRooms").value || 0),
    shop_units: Number(document.getElementById("shopUnits").value || 0),
    rent_amount: Number(document.getElementById("rent").value || 0),
    allowed_usage: document.getElementById("allowedUsage").value.trim(),
    status: document.getElementById("status").value
  };

  const validation = validatePropertyPayload(payload);
  if (!validation.valid) {
    showToast(validation.errors.join(", "), "error");
    return;
  }

  const { data: ownerData, error: ownerError } = await getOwnerByUserId(user.user_id);
  if (ownerError || !ownerData?.owner_id) {
    showToast("Please complete owner profile before adding properties", "error");
    return;
  }

  payload.owner_id = ownerData.owner_id;

  const submitBtn = form.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.textContent = "Publishing...";

  const { data, error } = await createProperty(payload);
  if (error || !data) {
    showToast("Failed to add property", "error");
    submitBtn.disabled = false;
    submitBtn.textContent = "Publish Property";
    return;
  }

  const files = Array.from(imageInput.files || []);
  for (const file of files) {
    const uploadResult = await uploadPropertyImage(file, data.property_id);
    if (uploadResult.error) {
      console.error("Image upload failed", uploadResult.error);
    }
  }

  showToast("Property published successfully", "success");
  form.reset();
  galleryPreview.innerHTML = "";
  submitBtn.disabled = false;
  submitBtn.textContent = "Publish Property";
});
