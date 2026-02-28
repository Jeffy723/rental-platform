# Storage Rules

Bucket expected by frontend: **`property-images`**.

## Recommended bucket setup
1. Create bucket `property-images`.
2. Keep the bucket public for direct image display, or keep private and provide signed URLs.
3. Store files under prefix: `properties/`.

## Suggested policy approach
- **Insert**: allow authenticated owners/admins to upload.
- **Select**: allow public read if listing visibility is public.
- **Delete/Update**: restrict to owner of associated property or admin.

## Naming convention
Frontend uploads with:

`properties/<propertyId>_<timestamp>.<ext>`

This keeps filenames unique and easy to audit.
