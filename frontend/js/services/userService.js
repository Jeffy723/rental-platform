import supabaseClient from "../core/supabaseClient.js";

export async function getOwners() {
  return supabaseClient
    .from("owners")
    .select("owner_id,user_id,phone,address,city,owner_type,users(name,email)");
}

export async function getTenants() {
  return supabaseClient
    .from("tenants")
    .select("tenant_id,user_id,phone,aadhaar_no,occupation,permanent_address,city,users(name,email)");
}

export async function getOwnerByUserId(userId) {
  return supabaseClient
    .from("owners")
    .select("owner_id,user_id,phone,address,city,owner_type")
    .eq("user_id", userId)
    .single();
}

export async function getTenantByUserId(userId) {
  return supabaseClient
    .from("tenants")
    .select("tenant_id,user_id,phone,aadhaar_no,occupation,permanent_address,city")
    .eq("user_id", userId)
    .single();
}

export async function getAllUsers() {
  return supabaseClient
    .from("users")
    .select("user_id,name,email,role,created_at")
    .order("user_id", { ascending: true });
}

export async function saveOwnerProfile(userId, payload) {
  const existing = await getOwnerByUserId(userId);

  if (existing.data) {
    return supabaseClient
      .from("owners")
      .update(payload)
      .eq("user_id", userId)
      .select("owner_id,user_id,phone,address,city,owner_type")
      .single();
  }

  return supabaseClient
    .from("owners")
    .insert([{ user_id: userId, ...payload }])
    .select("owner_id,user_id,phone,address,city,owner_type")
    .single();
}

export async function saveTenantProfile(userId, payload) {
  const existing = await getTenantByUserId(userId);

  if (existing.data) {
    return supabaseClient
      .from("tenants")
      .update(payload)
      .eq("user_id", userId)
      .select("tenant_id,user_id,phone,aadhaar_no,occupation,permanent_address,city")
      .single();
  }

  return supabaseClient
    .from("tenants")
    .insert([{ user_id: userId, ...payload }])
    .select("tenant_id,user_id,phone,aadhaar_no,occupation,permanent_address,city")
    .single();
}
