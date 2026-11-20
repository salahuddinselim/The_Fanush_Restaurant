# Database Security Report

**Date:** 2026-11-18

## Connection Security

| Check | Status | Notes |
|---|---|---|
| Parameterized queries | PASS | SQLAlchemy ORM used throughout |
| SQL injection | PASS | No raw SQL strings found |
| Connection pooling | N/A | SQLite single-file |
| Database credentials in code | LOW | No password needed (SQLite) |
| Database file in git | FAIL H-003 | `restaurant.db` tracked by git |

## Password Storage

| Check | Status | Notes |
|---|---|---|
| Passwords hashed | PASS | bcrypt via passlib |
| Salt used | PASS | bcrypt includes salt |
| Hash algorithm | PASS | bcrypt (cost factor default) |
| Plain-text passwords | PASS — none found | |

## Schema Issues

| Check | Status | Notes |
|---|---|---|
| Sensitive columns encrypted at rest | INFO | SQLite has no native encryption |
| `Reservation.status` free-text | FAIL H-005 | No enum constraint in DB |
| `Reservation.date` as String | MEDIUM | Date format not validated |
| `Reservation.time` as String | MEDIUM | Time format not validated |
| `MenuItem.price` as Float | INFO | Float for currency — consider Decimal |

## Transactions

- All write operations use `db.commit()` after changes. PASS.
- No explicit transaction handling for multi-step operations (acceptable at current scale).

## Backup

- No backup mechanism exists. The only copy is the working `restaurant.db` file.
- **Recommendation:** Add a nightly `sqlite3 restaurant.db .dump > backup_$(date +%Y%m%d).sql` cron job.
