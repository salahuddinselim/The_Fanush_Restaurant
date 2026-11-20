# Security Audit Report

**Date:** 2026-11-18  
**Severity scale:** CRITICAL / HIGH / MEDIUM / LOW / INFO

---

## C-001 — Hardcoded JWT Secret Key

**Severity:** CRITICAL  
**File:** `backend/app/auth.py:11`  
**CWE:** CWE-798 (Use of Hard-coded Credentials)

**Description:**  
The JWT signing key is the literal string `"change-this-secret-key-in-production"`. This value is committed to source control and is publicly visible. Any attacker who reads the code can forge admin-level JWT tokens and gain full administrative access without valid credentials.

**Reproduction:**
```python
import jose.jwt as jwt
token = jwt.encode({"sub": "admin", "exp": 9999999999}, "change-this-secret-key-in-production", algorithm="HS256")
# Use token in Authorization: Bearer <token> → full admin access
```

**Impact:** Complete authentication bypass. Full admin takeover.

**Fix:** Read from an environment variable with no default.
```python
import os
SECRET_KEY = os.environ["JWT_SECRET_KEY"]  # no default — fail fast if unset
```
Generate a secret: `python -c "import secrets; print(secrets.token_hex(32))"`

---

## C-002 — Unrestricted File Upload

**Severity:** CRITICAL  
**Files:** `backend/app/routers/gallery.py:38`, `backend/app/routers/menu.py:102`  
**CWE:** CWE-434 (Unrestricted Upload of File with Dangerous Type)

**Description:**  
File extension is taken from the client-supplied filename with no MIME type or magic-byte verification. Uploaded files are served directly under `/static/uploads/` with no execution sandbox. An authenticated attacker can upload any file type.

**Current code:**
```python
ext = os.path.splitext(file.filename)[1]  # trusts client filename
filename = f"{uuid.uuid4()}{ext}"
```

**Impact:** Upload of `.html` enables stored XSS. Upload of server-side script types (if interpreter ever present) enables RCE.

**Fix:**
```python
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
ALLOWED_MAGIC = {b'\xff\xd8\xff', b'\x89PNG', b'GIF8', b'RIFF', b'WEBP'}

async def validate_image(file: UploadFile) -> bytes:
    content = await file.read(512)
    if not any(content.startswith(sig) for sig in ALLOWED_MAGIC):
        raise HTTPException(400, "Invalid image file")
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, "File type not allowed")
    return content
```
Also add `MAX_FILE_SIZE = 5 * 1024 * 1024` (5 MB) check.

---

## H-001 — JWT Token in localStorage

**Severity:** HIGH  
**File:** `frontend/src/app/core/services/auth.service.ts:15`  
**CWE:** CWE-922 (Insecure Storage of Sensitive Information)

**Description:**  
The admin JWT is stored in `localStorage`, which is accessible to any JavaScript on the same origin. If an XSS vulnerability exists (or is later introduced), the token is immediately exfiltrated.

**Fix:** Store in an `HttpOnly` cookie set by the backend. The frontend never reads the cookie directly; the browser attaches it automatically. Alternatively, use `sessionStorage` as a partial improvement (tab-scoped, cleared on close).

---

## H-002 — No Rate Limiting on Login Endpoint

**Severity:** HIGH  
**File:** `backend/app/routers/auth.py`  
**CWE:** CWE-307 (Improper Restriction of Excessive Authentication Attempts)

**Description:**  
`POST /auth/login` accepts unlimited requests. An attacker can attempt thousands of password guesses per second.

**Fix:** Add slowapi rate limiting.
```python
from slowapi import Limiter
from slowapi.util import get_remote_address
limiter = Limiter(key_func=get_remote_address)

@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, ...):
```

---

## H-003 — SQLite Database in Repository

**Severity:** HIGH  
**File:** `backend/restaurant.db`

**Description:**  
The binary SQLite database file is tracked by git. This exposes the full database schema, all reservation data (names, emails, phone numbers), all admin credentials (hashed), and all configuration to anyone with read access to the repository.

**Fix:**  
1. Add `*.db` to `.gitignore` immediately.  
2. Remove the file from git history: `git filter-branch` or `git-filter-repo`.  
3. Rotate the admin password.

---

## H-004 — No File Size Limit on Uploads

**Severity:** HIGH  
**Files:** `gallery.py`, `menu.py`

**Description:**  
No `Content-Length` or streaming size check is enforced. An authenticated attacker can upload arbitrarily large files, filling disk storage.

**Fix:** Add a streaming size guard:
```python
MAX_SIZE = 5 * 1024 * 1024  # 5 MB
content = b""
async for chunk in file:
    content += chunk
    if len(content) > MAX_SIZE:
        raise HTTPException(413, "File too large")
```

---

## H-005 — Unrestricted Reservation Status Values

**Severity:** MEDIUM  
**File:** `backend/app/schemas.py:124`

**Description:**  
`ReservationStatusUpdate.status` is a plain `str` with no validation. An admin can set status to any arbitrary string, polluting business logic and reporting.

**Fix:**
```python
from enum import Enum
class ReservationStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"

class ReservationStatusUpdate(BaseModel):
    status: ReservationStatus
```

---

## M-001 — Overly Permissive CORS

**Severity:** MEDIUM  
**File:** `backend/app/main.py:25-26`

**Description:**  
`allow_methods=["*"]` and `allow_headers=["*"]` with `allow_credentials=True` is a dangerous combination. Per the CORS spec, `allow_credentials=True` with wildcard methods/headers is inconsistent and browsers may refuse the response or handle it unexpectedly.

**Fix:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=configured_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)
```

---

## M-002 — Public Site Configuration Endpoint

**Severity:** MEDIUM  
**File:** `backend/app/routers/config.py:11`

**Description:**  
`GET /config` returns all key/value pairs without authentication. If sensitive keys (API keys, credentials) are stored in SiteConfig, they are publicly accessible.

**Fix:** Maintain a whitelist of publicly readable keys and return only those without auth.

---

## M-003 — Missing Security Headers

**Severity:** MEDIUM  
**File:** `backend/app/main.py`

**Description:**  
No security headers are set. Missing: `X-Frame-Options`, `Content-Security-Policy`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`.

**Fix:** Add a middleware:
```python
from fastapi import Request
from fastapi.responses import Response

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "img-src 'self' https://images.unsplash.com data:; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com;"
    )
    return response
```

---

## M-004 — No Input Length Validation

**Severity:** MEDIUM

**Description:**  
`name`, `notes`, `description` fields have no max-length constraint. 10,000-character notes are accepted and stored.

**Fix:**
```python
from pydantic import Field
class ReservationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    notes: Optional[str] = Field(None, max_length=1000)
    party_size: int = Field(ge=1, le=50)
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    time: str = Field(pattern=r"^\d{2}:\d{2}$")
```

---

## M-005 — No Pagination

**Severity:** LOW  
**Files:** All list endpoints

**Description:**  
`GET /reservations`, `/menu/items`, `/gallery/all` return unbounded lists. With thousands of records, responses become large and slow.

**Fix:** Add `skip: int = 0, limit: int = 50` query parameters.

---

## L-001 — `index.html` Title is "Frontend"

**Severity:** LOW  
**File:** `frontend/src/index.html:5`

**Description:**  
The app title tag contains the scaffolding default "Frontend". This appears in browser tabs and leaks the development framework in page source.

**Fix:** Set title dynamically in `AppComponent` using Angular's `Title` service, or update the static `<title>` to the restaurant name.
```typescript
// app.component.ts
constructor(private titleService: Title) {
  titleService.setTitle('The Fanus Restaurant — Gosnells WA');
}
```
