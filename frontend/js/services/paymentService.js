import supabaseClient from "../core/supabaseClient.js";

function normalizeRelation(value) {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

function normalizePaymentRecord(record) {
  if (!record) return record;

  const agreement = normalizeRelation(record.rental_agreements);
  const property = normalizeRelation(agreement?.properties);
  const owner = normalizeRelation(property?.owners);
  const tenant = normalizeRelation(agreement?.tenants);
  const tenantUser = normalizeRelation(tenant?.users);

  return {
    ...record,
    rental_agreements: agreement
      ? {
        ...agreement,
        properties: property
          ? {
            ...property,
            owners: owner
          }
          : property,
        tenants: tenant
          ? {
            ...tenant,
            users: tenantUser
          }
          : tenant
      }
      : agreement
  };
}

export async function listPayments() {
  const { data, error } = await supabaseClient
    .from("rent_payments")
    .select(
      "payment_id,agreement_id,payment_month,amount_paid,payment_date,payment_mode,payment_status,rental_agreements!rent_payments_agreement_id_fkey(property_id,tenant_id,monthly_rent,properties!rental_agreements_property_id_fkey(address,city,owner_id,owners!properties_owner_id_fkey(user_id)),tenants!rental_agreements_tenant_id_fkey(user_id,users!tenants_user_id_fkey(name,email)))"
    )
    .order("payment_id", { ascending: false });

  return {
    data: (data || []).map((item) => normalizePaymentRecord(item)),
    error
  };
}

export async function createPayment(payload) {
  return supabaseClient
    .from("rent_payments")
    .insert([payload])
    .select()
    .single();
}
