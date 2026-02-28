import supabaseClient from "../core/supabaseClient.js";
import { setFlashMessage } from "../utils/helpers.js";

const form = document.getElementById("registerForm");
const roleSelect = document.getElementById("role");
const ownerFields = document.getElementById("ownerFields");
const tenantFields = document.getElementById("tenantFields");

function toggleRoleFields() {
  const role = roleSelect.value;
  ownerFields.hidden = role !== "owner";
  tenantFields.hidden = role !== "tenant";
}

function getOwnerPayload(userId) {
  return {
    user_id: userId,
    phone: document.getElementById("ownerPhone").value.trim(),
    address: document.getElementById("ownerAddress").value.trim(),
    city: document.getElementById("ownerCity").value.trim(),
    owner_type: document.getElementById("ownerType").value
  };
}

function getOwnerFormPayload() {
  return {
    phone: document.getElementById("ownerPhone").value.trim(),
    address: document.getElementById("ownerAddress").value.trim(),
    city: document.getElementById("ownerCity").value.trim(),
    owner_type: document.getElementById("ownerType").value
  };
}

function getTenantPayload(userId) {
  return {
    user_id: userId,
    phone: document.getElementById("tenantPhone").value.trim(),
    aadhaar_no: document.getElementById("aadhaarNo").value.trim(),
    occupation: document.getElementById("occupation").value.trim(),
    permanent_address: document.getElementById("permanentAddress").value.trim(),
    city: document.getElementById("tenantCity").value.trim()
  };
}

function getTenantFormPayload() {
  return {
    phone: document.getElementById("tenantPhone").value.trim(),
    aadhaar_no: document.getElementById("aadhaarNo").value.trim(),
    occupation: document.getElementById("occupation").value.trim(),
    permanent_address: document.getElementById("permanentAddress").value.trim(),
    city: document.getElementById("tenantCity").value.trim()
  };
}

function validateRolePayload(role, payload) {
  if (role === "owner") {
    if (!payload.phone || !payload.address || !payload.city || !payload.owner_type) {
      return "Please fill all owner profile fields";
    }
    return null;
  }

  if (!payload.phone || !payload.aadhaar_no || !payload.occupation || !payload.permanent_address || !payload.city) {
    return "Please fill all tenant profile fields";
  }

  return null;
}

async function createRoleProfile(role, userId) {
  const payload = role === "owner" ? getOwnerPayload(userId) : getTenantPayload(userId);
  const validationError = validateRolePayload(role, payload);
  if (validationError) {
    return { success: false, validationError };
  }

  const table = role === "owner" ? "owners" : "tenants";
  const { error } = await supabaseClient.from(table).insert([payload]);
  if (error) {
    return { success: false, error };
  }

  return { success: true };
}

async function rollbackUser(userId) {
  return supabaseClient
    .from("users")
    .delete()
    .eq("user_id", userId);
}

function buildRoleInsertErrorMessage(role, profileError) {
  const code = profileError?.code || "unknown";
  const message = profileError?.message || "Unknown database error";

  if (code === "42501") {
    return `Registration failed: insert blocked by RLS policy on ${role}s table. Run backend/policies/rls.sql in Supabase SQL editor.`;
  }

  return `Registration failed: could not create ${role} profile (${code}) - ${message}`;
}

roleSelect.addEventListener("change", toggleRoleFields);
toggleRoleFields();

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = roleSelect.value;

  if (!name || !email || !password) {
    alert("Please fill all required fields");
    return;
  }

  const roleFormPayload = role === "owner" ? getOwnerFormPayload() : getTenantFormPayload();
  const validationError = validateRolePayload(role, roleFormPayload);
  if (validationError) {
    alert(validationError);
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from("users")
      .insert([{ name, email, password, role }])
      .select()
      .single();

    if (error || !data) {
      console.error("User insert failed:", error);
      alert(`Registration failed: ${error?.message || "could not create user"}`);
      return;
    }

    const profileResult = await createRoleProfile(role, data.user_id);
    if (!profileResult.success) {
      if (profileResult.validationError) {
        await rollbackUser(data.user_id);
        alert(profileResult.validationError);
        return;
      }

      console.error("Role profile creation failed:", profileResult.error);

      const { error: rollbackError } = await rollbackUser(data.user_id);
      if (rollbackError) {
        console.error("Rollback failed for users row:", rollbackError);
        alert(
          `${buildRoleInsertErrorMessage(role, profileResult.error)}\n\nUser row may already exist. Login and complete profile in dashboard.`
        );
        return;
      }

      alert(buildRoleInsertErrorMessage(role, profileResult.error));
      return;
    }

    setFlashMessage("Registered successfully. Please login.", "success", "auth");
    form.reset();
    window.location.href = "./login.html";
  } catch (err) {
    console.error("Unexpected registration error:", err);
    alert("Something went wrong");
  }
});
