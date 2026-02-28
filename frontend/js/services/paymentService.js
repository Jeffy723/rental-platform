import supabaseClient from "../core/supabaseClient.js";

export async function listPayments() {
  return supabaseClient
    .from("rent_payments")
    .select(
      "payment_id,agreement_id,payment_month,amount_paid,payment_date,payment_mode,payment_status,rental_agreements(property_id,tenant_id,monthly_rent,properties(address,city,owner_id,owners(user_id)),tenants(user_id,users(name,email)))"
    )
    .order("payment_id", { ascending: false });
}

export async function createPayment(payload) {
  return supabaseClient
    .from("rent_payments")
    .insert([payload])
    .select()
    .single();
}
