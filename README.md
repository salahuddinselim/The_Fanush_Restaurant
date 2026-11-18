# The Fanus Restaurant — Full-Stack Website

A production-quality restaurant website built with **Angular 17** (frontend) and **FastAPI + SQLite** (backend). Features a public-facing site with scroll-reveal animations, 3D food icons, live menu search, and a full CMS admin panel.

---

## Live Preview

| Public site | Admin CMS |
|---|---|
| ![Hero section of The Fanus Restaurant](docs/screenshots/home-hero.png) | ![Admin dashboard statistics](docs/screenshots/admin-dashboard-stats.jpeg) |
| ![Menu section with category tabs and dishes](docs/screenshots/home-menu.jpeg) | ![Admin sign-in form](docs/screenshots/admin-login-form.jpeg) |

All screenshots are committed under [`docs/screenshots/`](docs/screenshots/) and render directly on GitHub.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Features](#features)
3. [Project Structure](#project-structure)
4. [Design System](#design-system)
5. [Icons](#icons)
6. [Animations](#animations)
7. [Getting Started](#getting-started)
8. [Admin Panel](#admin-panel)
9. [API Reference](#api-reference)
10. [Configuration](#configuration)
11. [Security](#security)
12. [Screenshots](#screenshots)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Angular 17 · Standalone components · Lazy routing |
| Styling | SCSS · CSS custom properties · Playfair Display + Inter |
| Icons | Iconify (lucide + fluent-emoji 3D) |
| Backend | FastAPI · Python 3.11 · Uvicorn |
| Database | SQLite (via SQLAlchemy 2.0) |
| Auth | JWT (python-jose) · bcrypt (passlib) |
| Rate limiting | slowapi 0.1.9 (5 login attempts / minute) |
| Maps | OpenStreetMap embed — no API key required |
| Images | Unsplash CDN with keyword-matched fallbacks |

---

## Features

### Public Site

- **Hero section** — Ken Burns background zoom, staggered fade-up entrance, stat strip
- **About section** — kitchen photography grid, brand story, animated badge pills
- **Menu** — sticky horizontal category nav, card-based item grid, Unsplash matched photos, item detail modal
- **Live search** — real-time filter with ARIA combobox + listbox suggestions
- **Feature strip** — 3-cell stagger animation
- **Visit section** — opening hours table, contact details, OpenStreetMap embed
- **Reservation form** — reactive validation, per-field error hints, success state
- **Footer** — links, branding

### Admin CMS (requires login)

- **Dashboard** — reservation counts, quick actions
- **Site settings** — restaurant name, tagline, description, address, phone, email, hero image URL, logo URL
- **Opening hours** — per-day open/close times with closed toggle
- **Menu manager** — categories and items (name, description, price, image URL, sort order)
- **Reservations** — view, confirm, cancel, delete bookings
- **Gallery manager** — upload and remove restaurant images

### Technical

- Scroll-reveal via IntersectionObserver (`.reveal`, `.reveal-left`, `.reveal-right`, `.reveal-scale`)
- Mobile burger menu with slide-in panel and mobile search
- Route guards on all `/admin/*` routes
- `prefers-reduced-motion` respected
- Full keyboard navigation (Escape to close modals, Tab order correct)
- ARIA labels, roles, and combobox on search
- Schema.org `Restaurant` structured data in `<head>`
- Open Graph + Twitter Card meta tags
- Rate limiting on auth endpoints (429 on abuse)

---

## Project Structure

```
restaurant-site/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app, CORS, rate limit handler
│   │   ├── models.py            # SQLAlchemy models (User, MenuItem, etc.)
│   │   ├── schemas.py           # Pydantic v2 request/response schemas
│   │   ├── auth.py              # JWT creation, bcrypt verify, route guard
│   │   ├── database.py          # SQLAlchemy engine + session factory
│   │   ├── limiter.py           # slowapi Limiter singleton
│   │   └── routers/
│   │       ├── auth.py          # POST /auth/login  (rate-limited)
│   │       ├── config.py        # GET/PUT /config   (allowlist enforced)
│   │       ├── hours.py         # GET/PUT /hours
│   │       ├── menu.py          # GET/POST/PUT/DELETE /menu/categories
│   │       ├── reservations.py  # GET/POST/PUT/DELETE /reservations
│   │       └── gallery.py       # GET/POST/DELETE /gallery
│   ├── seed.py                  # Seeds DB with demo data + admin user
│   ├── requirements.txt
│   └── restaurant.db            # SQLite file (auto-created on first run)
│
└── frontend/
    └── src/
        ├── index.html           # App shell, SEO meta, Iconify CDN
        ├── styles.scss          # Global tokens, animations, font imports
        └── app/
            ├── app.config.ts    # Router + HttpClient providers
            ├── app.routes.ts    # Lazy routes: / and /admin/*
            ├── core/
            │   └── services/
            │       ├── api.service.ts   # HTTP client for all endpoints
            │       └── auth.service.ts  # JWT storage, login, guard
            ├── public/
            │   └── home/
            │       ├── home.component.ts    # Main page logic
            │       ├── home.component.html  # Full public site template
            │       ├── home.component.scss  # Page-level styles
            │       └── menu-images.ts       # Keyword → Unsplash URL map
            └── admin/
                ├── login/           # Auth page
                ├── dashboard/       # CMS overview + stats
                ├── site-settings/   # Restaurant config form
                ├── hours-manager/   # Opening hours editor
                ├── menu-manager/    # Categories + items CRUD
                ├── reservations/    # Booking management table
                └── gallery-manager/ # Image upload + delete
```

---

## Design System

| Token | Value | Usage |
|---|---|---|
| `--wine` | `#7a1f2b` | Primary brand, buttons, active states |
| `--wine-dark` | `#5c1620` | Hover states |
| `--gold` | `#c08a2e` | CTA buttons, decorative accents |
| `--gold-soft` | `#e0b45f` | Hero stats, feature headings |
| `--cream` | `#faf6f0` | Page background |
| `--cream-2` | `#f3ece1` | Section alternates |
| `--ink` | `#1c1512` | Body text |

**Fonts:** Playfair Display (headings, 600–800 weight) · Inter (body, 400–700 weight)

---

## Icons

Icons are served via **Iconify** — a framework-agnostic SVG icon runtime loaded from CDN. No npm package required.

```html
<!-- Loaded in index.html -->
<script src="https://cdn.jsdelivr.net/npm/iconify-icon@2.1.0/dist/iconify-icon.min.js" defer></script>
```

| Icon set | Prefix | Used for |
|---|---|---|
| Lucide | `lucide:` | Search, map-pin, phone, utensils, star |
| Fluent Emoji | `fluent-emoji:` | Food category icons (3D coloured style) |

Category icon mapping (auto-detected from category name):

| Keyword | Icon |
|---|---|
| pizza | `fluent-emoji:pizza` |
| pasta | `fluent-emoji:spaghetti` |
| burger | `fluent-emoji:hamburger` |
| salad | `fluent-emoji:green-salad` |
| drink / juice / smoothie | `fluent-emoji:cup-with-straw` |
| coffee | `fluent-emoji:hot-beverage` |
| dessert / cake | `fluent-emoji:shortcake` |
| breakfast | `fluent-emoji:cooking` |
| chicken | `fluent-emoji:poultry-leg` |
| *(default)* | `fluent-emoji:fork-and-knife-with-plate` |

---

## Animations

- **Hero entrance** — Ken Burns bg zoom + staggered fade-up (0.15 s–0.75 s delays)
- **Scroll reveal** — IntersectionObserver triggers `.reveal` / `.reveal-left` / `.reveal-right` / `.reveal-scale` on scroll
- **About section** — images slide from left, copy from right, badge pills stagger
- **Category nav** — sticky bar pop animation; active tab highlighted
- **Menu cards** — image scale + shadow on hover; card click opens detail modal
- **Feature strip** — 3 cells stagger in with 0.13 s intervals
- **Visit section** — icon wiggle on hover, map scale on hover
- **Forms** — card shadow lift on hover, success panel pulse
- Respects `prefers-reduced-motion`

---

## Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Python | 3.10 or 3.11 |
| Node.js | 18+ |
| npm | 9+ |
| Angular CLI | 17 (`npm install -g @angular/cli@17`) |

---

### 1 — Clone the repo

```bash
git clone https://github.com/<your-username>/restaurant-site.git
cd restaurant-site
```

---

### 2 — Start the Backend (FastAPI)

```bash
# Navigate to backend folder
cd backend

# Create a virtual environment
python -m venv .venv

# Activate it
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Windows (Git Bash / CMD):
.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with demo data and an admin user
python seed.py

# Start the development server
uvicorn app.main:app --reload --port 8000
```

The API is now running at:
- `http://localhost:8000` — API root
- `http://localhost:8000/docs` — Interactive Swagger UI
- `http://localhost:8000/redoc` — ReDoc documentation

> **Note:** `seed.py` creates `restaurant.db` and populates it with sample menu categories, items, opening hours, gallery images, and an admin user. It is safe to run multiple times — it checks for existing data before inserting.

---

### 3 — Start the Frontend (Angular)

Open a **new terminal** (keep the backend running):

```bash
# From the project root
cd frontend

# Install dependencies
npm install

# Start the development server
ng serve
# or: npx ng serve
```

The site is now available at `http://localhost:4200`.

Changes to any `.ts`, `.html`, or `.scss` file are hot-reloaded automatically.

---

### 4 — Build for Production

```bash
cd frontend
ng build --configuration=production
```

Output goes to `frontend/dist/frontend/browser/`. Serve these static files with Nginx, Caddy, or any static file host.

---

## Admin Panel

### Login

| Field | Value |
|---|---|
| URL | `http://localhost:4200/admin/login` |
| Username | `admin` |
| Password | `admin123` |

> Change the password immediately after first login via the database or by adding a "change password" endpoint.

### Admin sections

| Path | Description |
|---|---|
| `/admin/dashboard` | Overview and stats |
| `/admin/site-settings` | Restaurant name, contact, hero image |
| `/admin/hours` | Opening hours per day |
| `/admin/menu` | Categories and menu items |
| `/admin/reservations` | View and manage bookings |
| `/admin/gallery` | Upload and remove gallery photos |

All `/admin/*` routes are protected by an Angular route guard that checks for a valid JWT in `localStorage`. Navigating to any admin page without logging in redirects to `/admin/login`.

---

## API Reference

Base URL: `http://localhost:8000`

All `(auth)` endpoints require a `Bearer <token>` header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/login` | Returns JWT access token | No (rate-limited: 5/min) |

**Request body:**
```json
{ "username": "admin", "password": "admin123" }
```
**Response:**
```json
{ "access_token": "eyJ...", "token_type": "bearer" }
```

---

### Config

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/config` | Public restaurant settings | No |
| `PUT` | `/config` | Update settings | Yes |

**Public keys returned by GET:**
`restaurant_name`, `tagline`, `description`, `address`, `phone`, `email`, `hero_image_url`, `logo_url`, `location_label`, `cta_text`

**PUT request body:**
```json
{
  "items": [
    { "key": "restaurant_name", "value": "The Fanus Restaurant" },
    { "key": "phone", "value": "+61 411 074 381" }
  ]
}
```

---

### Opening Hours

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/hours` | List all opening hours | No |
| `PUT` | `/hours` | Bulk update hours | Yes |

---

### Menu

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/menu/categories` | All categories with nested items | No |
| `POST` | `/menu/categories` | Create a category | Yes |
| `PUT` | `/menu/categories/{id}` | Update a category | Yes |
| `DELETE` | `/menu/categories/{id}` | Delete a category | Yes |
| `POST` | `/menu/categories/{id}/items` | Add item to category | Yes |
| `PUT` | `/menu/items/{id}` | Update a menu item | Yes |
| `DELETE` | `/menu/items/{id}` | Delete a menu item | Yes |

---

### Reservations

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/reservations` | Create a reservation | No |
| `GET` | `/reservations?skip=0&limit=50` | List reservations (paginated) | Yes |
| `PUT` | `/reservations/{id}` | Update status (pending/confirmed/cancelled) | Yes |
| `DELETE` | `/reservations/{id}` | Delete a reservation | Yes |

**POST request body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+61 400 000 000",
  "date": "2026-12-25",
  "time": "19:00",
  "party_size": 4,
  "notes": "Window seat if possible"
}
```

---

### Gallery

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/gallery` | List gallery images | No |
| `POST` | `/gallery` | Upload an image | Yes |
| `DELETE` | `/gallery/{id}` | Remove an image | Yes |

---

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Returns `{"status": "ok"}` |

---

## Configuration

### Frontend API URL

The frontend reads the backend URL in this priority order:

1. `<meta name="api-url" content="https://api.example.com">` in `index.html`
2. `window.RESTAURANT_API_URL = 'https://api.example.com'` before Angular boots
3. Defaults to `http://localhost:8000` when served from `localhost` / `127.0.0.1`
4. Defaults to same-origin paths (`/config`, `/menu/...`) on any other host

### CORS

The backend allows `http://localhost:4200` and `http://127.0.0.1:4200` by default.

For a deployed split-host setup, pass a comma-separated list before starting Uvicorn:

```bash
CORS_ALLOW_ORIGINS=https://restaurant.example.com uvicorn app.main:app
```

### JWT Secret

Set a strong secret in the environment before starting the backend:

```bash
# PowerShell
$env:SECRET_KEY = "change-me-to-a-long-random-string"
uvicorn app.main:app --reload

# Bash
SECRET_KEY="change-me-to-a-long-random-string" uvicorn app.main:app --reload
```

> **Never** use the default development secret in production.

---

## Security

| Feature | Detail |
|---|---|
| Rate limiting | `/auth/login` limited to 5 requests / minute per IP via slowapi |
| Config allowlist | `GET /config` only returns the 10 whitelisted public keys |
| Auth guards | All write endpoints require a valid JWT |
| Pagination | `GET /reservations` accepts `skip` and `limit` (max 50) |
| Input validation | Pydantic v2 validates all request bodies |
| CORS | Only configured origins are allowed |

---

## Screenshots

### Home — hero

The hero loads with a Ken Burns background zoom and staggered fade-up for each text element (eyebrow → heading → lead → CTA buttons → stats strip).

![Home hero of The Fanus Restaurant](docs/screenshots/home-hero.png)

### About — story and image grid

![About section with kitchen photography and brand story](docs/screenshots/home-about.jpeg)

### Full menu — tabbed categories and prices

![Menu section with category tabs and dish cards](docs/screenshots/home-menu.jpeg)

### Visit — hours, contact details and map

![Visit section with opening hours, address and OpenStreetMap](docs/screenshots/home-visit.jpeg)

### Reservation form — reactive validation

![Reservation form with name, contact, date, time and party size fields](docs/screenshots/home-reservation.jpeg)

### Admin panel — sign in and CMS dashboard

![Admin sign-in form](docs/screenshots/admin-login-form.jpeg)

![Admin dashboard statistics](docs/screenshots/admin-dashboard-stats.jpeg)

---

*Built with Angular 17 + FastAPI · Gosnells, Western Australia*
