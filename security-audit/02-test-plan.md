# Test Plan

**Date:** 2026-11-18  
**Environment:** Local development (localhost:8000 / localhost:4200)

## Scope

All backend API endpoints, frontend components, file upload flows, authentication, and authorization.

## Excluded

- Third-party Unsplash CDN (not in scope)
- Production infrastructure (not deployed)
- Denial-of-service tests

## Test Phases

| Phase | Focus | Priority |
|---|---|---|
| 1 | Authentication & JWT | Critical |
| 2 | File upload security | Critical |
| 3 | Authorization (BOLA/BFLA) | High |
| 4 | Input validation | High |
| 5 | Security headers | Medium |
| 6 | CORS configuration | Medium |
| 7 | Public data exposure | Medium |
| 8 | Reservation spam | Medium |
| 9 | SEO/Frontend | Low |
| 10 | Performance | Low |

## Test Accounts

- Admin: created via seed.py (single admin user)
- Anonymous: no account needed for public endpoints

## Tools

- curl / httpx — API testing
- Browser DevTools — frontend inspection
- Python unittest / pytest — automated tests
- Lighthouse — performance/SEO
- npm audit — dependency scan
