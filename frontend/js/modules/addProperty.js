import { requireUser } from "../core/auth.js";
import { getOwnerByUserId } from "../services/userService.js";
import { createProperty, uploadPropertyImage } from "../services/propertyService.js";
import { validatePropertyPayload } from "../utils/validators.js";

const user = requireUser(["owner"]);
if (!user) throw new Error("Unauthorized");

const form = document.getElementById("propertyForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

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
    alert(validation.errors.join("\n"));
    return;
  }

  try {
    const { data: ownerData, error: ownerError } = await getOwnerByUserId(user.user_id);

    if (ownerError) {
      console.error(ownerError);
      alert("Owner profile not found");
      return;
    }

    const ownerId = ownerData.owner_id;

    payload.owner_id = ownerId;

    const { data, error } = await createProperty(payload);

    if (error) {
      console.error(error);
      alert("Failed to add property");
      return;
    }

    const fileInput = document.getElementById("propertyImage");
    const selectedFile = fileInput.files[0];

    if (selectedFile) {
      const imageInsert = await uploadPropertyImage(selectedFile, data.property_id);
      if (imageInsert.error) {
        console.error("Property added, image upload failed:", imageInsert.error);
        alert("Property added, but image upload failed.");
      }
    }

    console.log("Property added:", data);
    alert("Property added successfully!");

    form.reset();
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
});
