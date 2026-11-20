# Application Inventory

**Date:** 2026-11-18  
**Scope:** restaurant-site (local development)  
**Authorized by:** Repository owner

## Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17 (standalone components, lazy loading) |
| Backend | FastAPI 0.111 + Uvicorn |
| Database | SQLite 3 (`restaurant.db`) |
| Auth | JWT (python-jose HS256), bcrypt passwords |
| File storage | Local filesystem (`static/uploads/`) |
| ORM | SQLAlchemy 2.0 |

## Public Routes (no auth)

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/config` | All site configuration |
| GET | `/hours` | Business hours |
| GET | `/menu/categories` | Active categories + items |
| GET | `/menu/items` | All menu items |
| GET | `/gallery` | Active gallery images |
| GET | `/static/uploads/**` | Uploaded files (direct) |
| POST | `/auth/login` | Admin login |
| POST | `/reservations` | Create reservation |

## Protected Routes (Bearer JWT required)

| Method | Path | Description |
|---|---|---|
| GET | `/menu/categories/all` | All categories inc. inactive |
| POST | `/menu/categories` | Create category |
| PUT | `/menu/categories/{id}` | Update category |
| DELETE | `/menu/categories/{id}` | Delete category |
| POST | `/menu/items` | Create item |
| PUT | `/menu/items/{id}` | Update item |
| DELETE | `/menu/items/{id}` | Delete item |
| POST | `/menu/items/{id}/image` | Upload item image |
| DELETE | `/menu/items/{id}/image` | Remove item image |
| GET | `/gallery/all` | All gallery images |
| POST | `/gallery` | Upload gallery image |
| PUT | `/gallery/{id}` | Update gallery image |
| DELETE | `/gallery/{id}` | Delete gallery image |
| PUT | `/config` | Update site config |
| PUT | `/hours/{id}` | Update business hours |
| GET | `/reservations` | List reservations |
| PUT | `/reservations/{id}` | Update reservation status |
| DELETE | `/reservations/{id}` | Delete reservation |

## Frontend Routes

| Path | Access | Component |
|---|---|---|
| `/` | Public | HomeComponent |
| `/admin/login` | Public | LoginComponent |
| `/admin/dashboard` | Auth Guard | DashboardComponent |
| `/admin/menu` | Auth Guard | MenuManagerComponent |
| `/admin/gallery` | Auth Guard | GalleryManagerComponent |
| `/admin/hours` | Auth Guard | HoursManagerComponent |
| `/admin/config` | Auth Guard | ConfigManagerComponent |
| `/admin/reservations` | Auth Guard | ReservationsComponent |

## User Roles

| Role | Description |
|---|---|
| Public (anonymous) | Read menu, gallery, config, hours; submit reservations |
| Admin | Full CRUD on all content, file uploads, reservation management |

## Data Models

- **User** — admin credentials (username, hashed_password)  
- **SiteConfig** — key/value site settings  
- **BusinessHour** — operating hours per day  
- **MenuCategory** — menu groupings with display order  
- **MenuItem** — individual dishes with price, image, availability  
- **GalleryImage** — restaurant photos  
- **Reservation** — customer booking requests  

## Third-party Dependencies

| Package | Version | Purpose |
|---|---|---|
| python-jose | 3.3.0 | JWT encoding/decoding |
| passlib[bcrypt] | 1.7.4 | Password hashing |
| Pillow | 10.3.0 | Image processing (imported, minimal use) |
| aiofiles | 23.2.1 | Async file I/O |
| Angular | 17 | Frontend framework |

## External Services

- Unsplash CDN — fallback menu/hero images (hardcoded in frontend)
- No payment gateway
- No email service
- No external auth provider
