export function isRequired(value) {
  return String(value || "").trim().length > 0;
}

export function isPositiveNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0;
}

export function validatePropertyPayload(payload) {
  const errors = [];

  if (!isRequired(payload.property_type)) errors.push("Property type is required");
  if (!isRequired(payload.address)) errors.push("Address is required");
  if (!isRequired(payload.city)) errors.push("City is required");
  if (!isPositiveNumber(payload.rent_amount)) errors.push("Rent must be a valid number");

  return {
    valid: errors.length === 0,
    errors
  };
}
