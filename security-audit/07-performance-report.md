# Performance Report

**Date:** 2026-11-18

## Backend API

| Endpoint | Concern |
|---|---|
| `GET /menu/categories` | N+1 risk: SQLAlchemy lazy-loads items per category by default; use `joinedload` |
| `GET /reservations` | Unbounded query — no pagination |
| File uploads | Loaded fully into memory via `shutil.copyfileobj`; acceptable up to ~5 MB |

### N+1 Fix (menu categories)
```python
from sqlalchemy.orm import joinedload

def get_categories(db: Session = Depends(get_db)):
    return (
        db.query(models.MenuCategory)
        .options(joinedload(models.MenuCategory.items))
        .filter(models.MenuCategory.is_active == True)
        .order_by(models.MenuCategory.display_order)
        .all()
    )
```

## Frontend

| Check | Observation |
|---|---|
| Angular lazy loading | PASS — all admin routes lazy loaded |
| Images | Unsplash CDN images use `?w=400&q=70` — optimized |
| `ngOnInit` API calls | 4 sequential calls; use `forkJoin` to parallelize |
| IntersectionObserver | Used for reveal animations — efficient |
| Menu search | Client-side filtering on loaded data — OK at current scale |

### forkJoin improvement
```typescript
import { forkJoin } from 'rxjs';

ngOnInit() {
  forkJoin({
    config: this.api.getConfig(),
    categories: this.api.getCategories(),
    gallery: this.api.getGallery(),
    hours: this.api.getHours(),
  }).subscribe(({ config, categories, gallery, hours }) => {
    this.config = config;
    this.categories = categories;
    if (categories.length) this.activeCatId = categories[0].id;
    this.gallery = gallery;
    this.hours = hours;
    setTimeout(() => this.setupCatObserver(), 100);
  });
}
```

## Core Web Vitals (estimated, local dev)

| Metric | Estimate | Target |
|---|---|---|
| LCP | ~1.2s (local) | < 2.5s |
| CLS | Low (layout reserved) | < 0.1 |
| INP | < 100ms | < 200ms |

**Note:** External Unsplash images will increase LCP in production. Preload the hero image:
```html
<link rel="preload" as="image" href="HERO_URL" fetchpriority="high">
```
