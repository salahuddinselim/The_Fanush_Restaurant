# API Security Report

**Date:** 2026-11-18

## Endpoint Inventory

### `/auth/login` POST — PUBLIC
- **Auth required:** No
- **Rate limited:** No ← HIGH vulnerability
- **Input validation:** pydantic (username: str, password: str, no length bounds)
- **Error response:** Consistent "Incorrect username or password" (good — no enumeration)
- **Issue H-002:** No brute-force protection

### `/config` GET — PUBLIC
- **Issue M-002:** Returns all site configuration. No filtering of sensitive keys.

### `/menu/categories` GET — PUBLIC
- OK. Returns only active categories.

### `/menu/items` GET — PUBLIC
- **Issue M-005:** No pagination. Returns all items.

### `/menu/items/{id}/image` POST — PROTECTED
- **Issue C-002:** No file type or size validation.

### `/gallery` POST — PROTECTED
- **Issue C-002:** No file type or size validation.

### `/reservations` POST — PUBLIC
- **Issue M-004:** No length validation on name/notes.
- **Issue:** `party_size` accepts negative values and 0.
- **Issue:** `date` and `time` accept arbitrary strings.
- No CAPTCHA / spam protection.

### `/reservations/{id}` PUT — PROTECTED
- **Issue H-005:** `status` field accepts arbitrary strings.

## BOLA / IDOR Assessment

- All resource IDs are sequential integers. Enumeration risk is medium.
- Protected endpoints properly check auth before database access.
- No cross-user data isolation concern (single admin role).
- **PASS:** Unauthorized users cannot read/modify reservations, gallery, or menu admin data.

## Mass Assignment

- Pydantic `model_dump(exclude_unset=True)` used for updates — only provided fields updated. PASS.
- `MenuItemCreate` / `MenuCategoryCreate` use explicit schemas. PASS.

## Excessive Data Exposure

- `GET /reservations` returns phone, email, notes to authenticated admin only. PASS.
- `GET /menu/categories` returns full item list including unavailable items? No — filtered to active only. PASS.
- `GET /config` is fully public. MEDIUM concern (see M-002).
