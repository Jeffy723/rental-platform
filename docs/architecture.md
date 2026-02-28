# Architecture Overview

## Frontend
- Plain HTML pages with ES modules.
- Shared styling in `frontend/css/global.css`, `forms.css`, and `dashboard.css`.
- Service modules in `frontend/js/services/` encapsulate Supabase data access.
- UI modules in `frontend/js/modules/` render and bind each page.

## Data flow
1. Page module loads and validates auth/role where required.
2. Module calls service layer functions.
3. Service layer uses `supabaseClient` to query/insert/update.
4. Module renders cards/tables/forms based on response.

## Domain model
Core entities:
- Users
- Owners / Tenants profiles
- Properties + property images
- Rental agreements
- Rent payments
- Maintenance requests

## Deployment shape
- Frontend hosted as static assets (CDN, object storage, or web server).
- Supabase provides PostgreSQL, Auth, and Storage.
- Optional edge functions can be added for notifications/reporting.
