# Rental Platform

Rental Platform is a multi-role web app for managing rental properties and operations.

## Roles
- **Tenant**: browse listings, view agreements, make payments, and raise maintenance requests.
- **Owner**: publish and manage properties, review renters, and track agreement lifecycle.
- **Admin**: monitor users and high-level activity through an overview dashboard.

## Project structure
- `frontend/` – static HTML/CSS/JS client with role-based pages and dashboards.
- `backend/database/` – PostgreSQL schema and seed data designed for Supabase.
- `backend/policies/` – row-level security snippets.
- `backend/storage/` – storage rules and guidance for image uploads.
- `config/` – shared app configuration constants.
- `docs/` – architecture notes and API usage references.

## Local run
Because the frontend is static, you can serve it with any simple web server:

```bash
cd frontend
python -m http.server 8080
```

Then open `http://localhost:8080/public/index.html`.

## Backend expectations
This project expects a Supabase project with tables from `backend/database/schema.sql` and a storage bucket named `property-images`.
