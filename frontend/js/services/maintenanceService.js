import supabaseClient from "../core/supabaseClient.js";

export async function listMaintenanceRequests() {
  return supabaseClient
    .from("maintenance_requests")
    .select(
      "request_id,agreement_id,issue_type,description,request_date,status,cost_estimate,rental_agreements(property_id,tenant_id,properties(address,city,owner_id,owners(user_id)),tenants(user_id,users(name,email)))"
    )
    .order("request_id", { ascending: false });
}

export async function createMaintenanceRequest(payload) {
  return supabaseClient
    .from("maintenance_requests")
    .insert([payload])
    .select()
    .single();
}

export async function updateMaintenanceRequest(requestId, payload) {
  return supabaseClient
    .from("maintenance_requests")
    .update(payload)
    .eq("request_id", requestId)
    .select()
    .single();
}
