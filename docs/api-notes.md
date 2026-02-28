# API Notes (Supabase)

This app uses Supabase JS client directly from the browser.

## Main tables queried
- `users`
- `owners`
- `tenants`
- `properties`
- `property_images`
- `rental_agreements`
- `rent_payments`
- `maintenance_requests`

## Service mapping
- `propertyService.js` → property CRUD + image upload metadata
- `userService.js` → owner/tenant profile CRUD + user list
- `agreementService.js` → agreement listing + create + status update
- `paymentService.js` → rent payment listing + create
- `maintenanceService.js` → maintenance listing + create + update

## Auth assumptions
- Client stores lightweight user context in localStorage after login.
- Page modules enforce role guards through `requireUser`.
- Supabase Row Level Security should enforce server-side data boundaries.

## Storage assumptions
- Bucket: `property-images`
- Uploaded objects path: `properties/<propertyId_timestamp>.<ext>`
- Public URL is persisted in `property_images.image_url`
