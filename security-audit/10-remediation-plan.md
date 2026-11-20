# Remediation Plan

**Date:** 2026-11-18

## Priority 1 — Fix immediately (before any public deployment)

### 1. Rotate the JWT secret (C-001)
1. Add `JWT_SECRET_KEY` to environment / `.env` file (never commit).
2. Edit `backend/app/auth.py:11`:
   ```python
   SECRET_KEY = os.environ["JWT_SECRET_KEY"]
   ```
3. Create `.env.example` with `JWT_SECRET_KEY=<generate with secrets.token_hex(32)>`.
4. Add `.env` to `.gitignore`.
5. All existing tokens are invalid after the key changes — expected.

### 2. Remove database from git (H-003)
```bash
echo "*.db" >> .gitignore
git rm --cached backend/restaurant.db
git commit -m "Remove database from tracking"
# Optionally rewrite history with git-filter-repo
```

### 3. Add file type validation (C-002)
Add magic-byte check + extension allowlist to both `gallery.py` and `menu.py`.
Extract to `backend/app/utils/upload.py` shared helper.

### 4. Add file size limit (H-004)
Add `MAX_UPLOAD_SIZE = 5 * 1024 * 1024` and enforce during streaming read.

## Priority 2 — Fix within one sprint

### 5. Add rate limiting (H-002)
Add `slowapi` to requirements.txt and limit `/auth/login` to 5/minute per IP.

### 6. Add security headers (M-003)
Add HTTP middleware to `main.py`.

### 7. Restrict CORS (M-001)
Enumerate explicit methods and headers.

### 8. Validate reservation fields (M-004)
Add `Field(pattern=..., max_length=...)` to `ReservationCreate`.

### 9. Add enum to ReservationStatus (H-005)

## Priority 3 — Before production release

### 10. Move JWT to HttpOnly cookie (H-001)
Requires backend endpoint to set cookie + frontend to stop reading localStorage.

### 11. Fix index.html title (L-001)
Use Angular `Title` service.

### 12. Add robots.txt and sitemap.xml

### 13. Add LocalBusiness JSON-LD structured data

### 14. Add pagination to list endpoints (M-005)

## Priority 4 — Code quality (ponytail findings)

### P-001 Move MENU_IMAGES to a data file
### P-002 Use `forkJoin` in `ngOnInit`
### P-003 Extract shared upload utility
### P-004 Simplify `isValidToken` using `jwt-decode` npm package
