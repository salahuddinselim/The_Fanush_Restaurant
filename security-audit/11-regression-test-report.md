# Regression Test Report

**Date:** 2026-11-18  
**Status:** Pre-fix baseline (all vulnerabilities open)

## Tests to run after each fix

### After C-001 fix (JWT secret from env)
- [ ] Login with valid credentials returns token
- [ ] Login with invalid credentials returns 401
- [ ] Admin endpoints accept valid token
- [ ] Old tokens (signed with hardcoded key) are rejected

### After C-002 fix (file upload validation)
- [ ] Upload valid JPEG → accepted
- [ ] Upload valid PNG → accepted
- [ ] Upload `.py` file renamed to `.jpg` → rejected 400
- [ ] Upload `.html` file → rejected 400
- [ ] Upload file > 5 MB → rejected 413
- [ ] Upload file = 5 MB → accepted

### After H-002 fix (rate limiting)
- [ ] 5 rapid login attempts succeed
- [ ] 6th attempt within 60s → 429
- [ ] After 60s, login succeeds again

### After H-003 fix (db out of git)
- [ ] `git status` shows `restaurant.db` as untracked
- [ ] `git log -- backend/restaurant.db` shows no tracked history (after filter-repo)

### After M-003 fix (security headers)
- [ ] Response headers include `X-Frame-Options: DENY`
- [ ] Response headers include `X-Content-Type-Options: nosniff`
- [ ] Response headers include `Content-Security-Policy`

### After M-004 fix (input validation)
- [ ] party_size = 0 → 422
- [ ] party_size = -1 → 422
- [ ] name longer than 200 chars → 422
- [ ] date with wrong format → 422
