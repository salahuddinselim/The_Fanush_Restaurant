# Functional QA Report

**Date:** 2026-11-18

## Navigation

| Test | Result |
|---|---|
| Public home page loads | PASS |
| Admin login route accessible | PASS |
| Protected routes redirect to login when unauthenticated | PASS |
| `/**` wildcard redirects to home | PASS |
| Browser back after logout re-checks auth guard | PASS — guard runs on navigation |

## Reservation Form

| Test | Result | Notes |
|---|---|---|
| Valid submission | PASS | Returns 201 |
| Empty name | PASS — blocked by Angular | Backend also rejects (field required) |
| Invalid email | PASS — rejected by pydantic EmailStr | |
| party_size = 0 | FAIL | Frontend `Validators.min(1)` only; backend accepts 0 |
| party_size = -1 | FAIL | Backend accepts negative party size |
| party_size = 999999 | FAIL | No upper bound |
| Extremely long notes (10,000 chars) | FAIL | Stored without truncation |
| Duplicate reservation same name/time | PASS (allowed by design) | |
| XSS payload in name field | PASS — Angular escapes output | |
| SQL injection in name field | PASS — SQLAlchemy parameterized | |
| Blank date string | FAIL | Backend accepts empty string for `date` |
| Arbitrary date format | FAIL | No date format validation on backend |

## Menu (admin)

| Test | Result | Notes |
|---|---|---|
| Create category | PASS | |
| Update category | PASS | |
| Delete category cascades items | PASS | |
| Create item with negative price | FAIL | Backend accepts `price = -5.0` |
| Upload image (valid JPEG) | PASS | |
| Upload .py file as image | FAIL — CRITICAL | File stored and served |
| Upload 50MB file | FAIL | No size limit enforced |

## Gallery

| Test | Result | Notes |
|---|---|---|
| Upload image | PASS | |
| Upload .html file | FAIL | Stored and served |
| Delete image removes file from disk | PASS | |

## Authentication

| Test | Result | Notes |
|---|---|---|
| Valid credentials return JWT | PASS | |
| Wrong password → 401 | PASS | Same error for wrong user/wrong pass (good — no enumeration) |
| Expired token → 401 | PASS | |
| Tampered token → 401 | PASS | |
| 100 rapid login attempts | FAIL | No rate limiting |
| Token forged with known secret | FAIL — CRITICAL | Secret is public in source |
