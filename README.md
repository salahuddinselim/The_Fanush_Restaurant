# The Fanus Restaurant — Full-Stack Website

A production-quality restaurant website built with **Angular 19** (frontend) and **FastAPI + SQLite** (backend). Features a public-facing site with scroll-reveal animations and a full CMS admin panel.

---

## Live Preview

| Public Site | Admin Panel |
|---|---|
| ![Hero section with wine/cream palette, Playfair Display headings, and food photography](https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80) | |

---

## Screenshots

### Hero — Full-width landing with animated entrance

The hero loads with a Ken Burns background zoom and staggered fade-up for each text element (eyebrow → heading → lead → CTA buttons → stats strip).

```
┌────────────────────────────────────────────────────────┐
│  🍽  THE FANUS RESTAURANT            [Call to Order]   │
│────────────────────────────────────────────────────────│
│                                                        │
│  Gosnells · Western Australia                          │
│                                                        │
│  Honest Italian cooking,                               │
│  made fresh every day.                                 │
│                                                        │
│  Pasta, pizza, burgers and grill classics.             │
│                                                        │
│  [View the Menu]   [+61 411 074 381]                   │
│                                                        │
│  3.8★ Google  │  Fresh Made to Order  │  Family Owned  │
└────────────────────────────────────────────────────────┘
```

### About — Slide-in image grid + copy

```
┌───────────────────────────────────────────────────────┐
│  [Food Photo 1]  [Photo 2]   Our Kitchen              │
│                  [Photo 3]   ─────────────            │
│                              A neighbourhood table    │
│                              with an Italian heart.   │
│                                                       │
│                              [Italian] [Pizza] [Dine] │
│                              [Takeaway] [Family]      │
└───────────────────────────────────────────────────────┘
```

### Full Menu — Tabbed categories, price-line layout

```
┌───────────────────────────────────────────────────────┐
│  [Pasta] [Pizza] [Burgers] [Grills] [Desserts]        │
│  ─────────────────────────────────                    │
│  Pasta                                                │
│  Spaghetti Bolognese ................... A$16.90      │
│  Slow-cooked beef ragù, parmesan                      │
│  Fettuccine Carbonara .................. A$17.50      │
└───────────────────────────────────────────────────────┘
```

### Feature Strip — Dark band with 3 value propositions

```
┌─────────────────┬─────────────────┬──────────────────┐
│  Made to Order  │  Family Friendly │  Dine In or      │
│                 │                  │  Takeaway        │
│  Every dish     │  Kids' menu &    │  Albany Hwy or   │
│  cooked fresh   │  generous serves │  delivery        │
└─────────────────┴─────────────────┴──────────────────┘
```

### Visit — Hours, contact info + OpenStreetMap

```
┌──────────────────────────┬──────────────────────────┐
│  Restaurant Details      │                          │
│  📍 2310 Albany Hwy      │      [OpenStreetMap]     │
│  📞 +61 411 074 381      │                          │
│  🍽 Italian · Pizza      │      (Gosnells, WA)      │
│  ⭐ 3.8 / 5 Google       │                          │
│                          │                          │
│  Opening Hours           │                          │
│  Monday  11am – 9pm      │                          │
│  Sunday  Closed          │                          │
└──────────────────────────┴──────────────────────────┘
```

### Reservation Form — Reactive form with validation

```
┌───────────────────────────────────────────────────────┐
│  Make a Reservation                                   │
│  ─────────────────                                    │
│  Full Name *         Phone                            │
│  [____________]      [____________]                   │
│  Email *             Party Size *                     │
│  [____________]      [    2      ]                    │
│  Date *              Time *                           │
│  [____________]      [____________]                   │
│  Special Requests                                     │
│  [__________________________________________]         │
│                                                       │
│  [        Request Reservation        ]                │
└───────────────────────────────────────────────────────┘
```

### Admin Panel — Full CMS

```
┌──────────────┬────────────────────────────────────────┐
│  🍽 Fanus    │  Dashboard                             │
│  ─────────── │  ──────────────────────────────────── │
│  Dashboard   │  [⚙ Site Settings] [🕐 Hours]         │
│  Site Config │  [🍝 Menu]  [📋 Reservations]         │
│  Hours       │  [🖼 Gallery]  [🔑 Sign Out]           │
│  Menu        │                                        │
│  Reservations│                                        │
│  Gallery     │                                        │
│  Sign Out    │                                        │
└──────────────┴────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 19 · Standalone components · Reactive Forms |
| Styling | SCSS · CSS custom properties · Playfair Display + Inter |
| Backend | FastAPI · Python 3.11 · Uvicorn |
| Database | SQLite (via SQLAlchemy) |
| Auth | JWT (python-jose) · bcrypt 4.0.1 |
| Maps | OpenStreetMap embed (no API key required) |
| Images | Unsplash CDN |

---

## Project Structure

```
restaurant-site/
├── backend/
│   ├── main.py              # FastAPI app, all routes
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # JWT + bcrypt helpers
│   ├── seed.py              # Initial data seeder
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── app/
        │   ├── core/
        │   │   └── services/
        │   │       ├── api.service.ts      # HTTP client for all endpoints
        │   │       └── auth.service.ts     # JWT token management
        │   ├── public/
        │   │   └── home/                   # Full public one-page site
        │   └── admin/
        │       ├── login/                  # Auth page
        │       ├── dashboard/              # CMS overview
        │       ├── site-settings/          # Restaurant config
        │       ├── hours-manager/          # Opening hours
        │       ├── menu-manager/           # Categories + items
        │       ├── reservations/           # Booking management
        │       └── gallery-manager/        # Image management
        ├── styles.scss                     # Global design tokens + animations
        └── index.html
```

---

## Design System

| Token | Value | Usage |
|---|---|---|
| `--wine` | `#7a1f2b` | Primary brand, buttons, accents |
| `--wine-dark` | `#5c1620` | Hover states |
| `--gold` | `#c08a2e` | CTA buttons, decorative |
| `--gold-soft` | `#e0b45f` | Hero stats, feature headings |
| `--cream` | `#faf6f0` | Page background |
| `--cream-2` | `#f3ece1` | Section alternates |
| `--ink` | `#1c1512` | Body text |

**Fonts:** Playfair Display (headings, 600–800) · Inter (body, 400–700)

---

## Animations

- **Hero entrance**: Ken Burns bg zoom + staggered fade-up (0.15s–0.75s delays)
- **Scroll reveal**: IntersectionObserver triggers `.reveal` / `.reveal-left` / `.reveal-right` / `.reveal-scale` on scroll
- **About section**: images slide from left, copy from right, badge pills stagger
- **Menu tabs**: active tab pop animation; item rows slide-indent on hover
- **Feature strip**: 3 cells stagger in with 0.13s intervals
- **Visit section**: icon wiggle on hover, map scale on hover
- **Forms**: card shadow lift on hover, success panel pulse
- Respects `prefers-reduced-motion`

---

## Getting Started

### Backend

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python seed.py                  # seed database + admin user
uvicorn main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

### Frontend

```bash
cd frontend
npm install
ng serve
# → http://localhost:4200
```

### Admin Login

| Field | Value |
|---|---|
| URL | http://localhost:4200/admin/login |
| Username | `admin` |
| Password | `admin123` |

### Runtime Configuration

The frontend uses `http://localhost:8000` when the site is served from `localhost` or `127.0.0.1`. On any other host it uses same-origin API paths, so `/config`, `/menu/categories`, and the other endpoints should be reverse-proxied to the backend.

For a separate API host, override the base URL before Angular loads:

```html
<meta name="api-url" content="https://api.example.com" />
```

You can also set `window.RESTAURANT_API_URL = 'https://api.example.com'` before bootstrap. The meta tag takes precedence over the window value.

The backend allows local Angular origins by default. For deployed split-host setups, set a comma-separated allowlist before starting Uvicorn:

```bash
CORS_ALLOW_ORIGINS=https://restaurant.example.com,https://admin.example.com uvicorn main:app
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/login` | Get JWT token |
| `GET` | `/config` | Restaurant settings |
| `PUT` | `/config` | Update settings (auth) |
| `GET` | `/hours` | Opening hours |
| `PUT` | `/hours` | Update hours (auth) |
| `GET` | `/menu/categories` | Menu with items (public) |
| `GET/POST` | `/menu/categories` | Category management (auth) |
| `GET/POST` | `/reservations` | List / create reservations |
| `PUT` | `/reservations/{id}` | Update status (auth) |
| `DELETE` | `/reservations/{id}` | Delete reservation (auth) |
| `GET/POST` | `/gallery` | Gallery images |
| `GET` | `/health` | Health check |

---

## Features

- **Public site**: Hero, About, Full menu, Feature strip, Visit/map, CTA band, Reservation form, Footer
- **Admin CMS**: Site settings, opening hours, menu (categories + items), reservations (confirm/cancel/delete), gallery
- **Validation**: Reactive forms with per-field error hints and `markAllAsTouched()` on submit
- **Map**: OpenStreetMap embed — no API key, no billing
- **Responsive**: Mobile burger menu, stacked grids, touch-friendly tap targets
- **Auth**: JWT stored in `localStorage`, route guards on all `/admin/*` pages

---

*Built with Angular 19 + FastAPI · Gosnells, Western Australia*
