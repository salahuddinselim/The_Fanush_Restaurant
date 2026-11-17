# Restaurant Site Test Cases and Results

Generated: 2026-11-17

## Unit Test Run

Command:

```powershell
npx ng test --watch=false --browsers=ChromeHeadless
```

Final result: **180/180 PASS**

Browser: Chrome Headless 157.0.0.0 (Windows 10)

Backend command:

```powershell
python -m unittest discover -s tests -v
```

Backend final result: **2/2 PASS**

## Test Case Results

### `src/app/app.component.spec.ts` — 2/2 PASS

- [x] PASS — should create the app
- [x] PASS — should contain a router-outlet

### `src/app/public/home/home.component.spec.ts` — 40/40 PASS

- [x] PASS — should create
- [x] PASS — should load categories on init
- [x] PASS — should load config on init
- [x] PASS — should render cat-sticky-bar when categories exist
- [x] PASS — should render correct number of category buttons in sticky bar
- [x] PASS — should render menu cards for items
- [x] PASS — menu card should contain card-name and card-price
- [x] PASS — menu card should show an image with fallback when item has no image_url
- [x] PASS — menuItemImage should use uploaded image URLs and resolve relative paths
- [x] PASS — menu card price should include A$ prefix
- [x] PASS — menu card should have aria-label with item name and price
- [x] PASS — should mark first category as active by default
- [x] PASS — should update activeCatId when category tab is clicked
- [x] PASS — should hide cat-sticky-bar when search query is active
- [x] PASS — should filter categories by search query
- [x] PASS — should return empty filteredCategories for unmatched query
- [x] PASS — should clear search and restore all categories
- [x] PASS — should populate searchSuggestions when typing 2+ chars
- [x] PASS — should hide suggestions after clearSearch
- [x] PASS — should refresh category observers after search filters the menu
- [x] PASS — should refresh category observers after search is cleared
- [x] PASS — selectSuggestion sets query and scrolls to menu
- [x] PASS — should mark form invalid when required fields are empty
- [x] PASS — should validate email field format
- [x] PASS — should not submit when form is invalid
- [x] PASS — should submit successfully when form is valid
- [x] PASS — should show error message on reservation submission failure
- [x] PASS — dayName should return day string for day_of_week index
- [x] PASS — scrollTo should close mobile menu
- [x] PASS — navScrolled should be false initially
- [x] PASS — should render nav CTA with white text on wine background
- [x] PASS — should render restaurant details, opening hours, and map as separate visit cards
- [x] PASS — allItems should return flat list of all items across categories
- [x] PASS — menuItemCount should count all items across categories
- [x] PASS — logoUrl should return empty string when not in config
- [x] PASS — logoUrl should resolve a relative configured image URL
- [x] PASS — logoUrl should preserve an absolute configured image URL
- [x] PASS — heroImg should resolve a relative configured image URL
- [x] PASS — heroImg should keep the fallback when no image is configured
- [x] PASS — should have correct current year

### `src/app/core/services/api.service.spec.ts` — 12/12 PASS

- [x] PASS — should be created
- [x] PASS — public GET methods should call the expected endpoints
- [x] PASS — admin GET methods should call the expected endpoints
- [x] PASS — updateConfig should PUT /config with an items wrapper
- [x] PASS — updateHour should PUT the data to /hours/:id
- [x] PASS — category mutations should use the correct verbs, URLs and payloads
- [x] PASS — menu item mutations should use the correct verbs, URLs and payloads
- [x] PASS — uploadItemImage should POST the file as FormData
- [x] PASS — uploadGalleryImage should POST FormData with file, caption and display_order
- [x] PASS — gallery mutations should use the correct verbs, URLs and payloads
- [x] PASS — reservation methods should use the correct verbs, URLs and payloads
- [x] PASS — should propagate HTTP errors to subscribers

### `src/app/core/services/api.config.spec.ts` — 5/5 PASS

- [x] PASS — uses the meta api-url value and removes a trailing slash
- [x] PASS — uses the window override when no meta tag exists
- [x] PASS — prefers the meta tag over the window override
- [x] PASS — uses the localhost backend during local development
- [x] PASS — uses a same-origin API outside local development

### `src/app/core/services/auth.service.spec.ts` — 9/9 PASS

- [x] PASS — should be created
- [x] PASS — login should POST credentials and store the returned token
- [x] PASS — login should not store a token when the request fails
- [x] PASS — logout should remove the token and navigate to the login route
- [x] PASS — getToken should return the stored token or null
- [x] PASS — getToken should remove and ignore a malformed token
- [x] PASS — getToken should remove and ignore an expired token
- [x] PASS — getToken should remove and ignore a token without an expiry
- [x] PASS — isLoggedIn should reflect whether a valid token is stored

### `src/app/admin/config-manager/config-manager.component.spec.ts` — 10/10 PASS

- [x] PASS — should create
- [x] PASS — should load config values on init
- [x] PASS — should expose all configurable fields with labels
- [x] PASS — should render one input per config field
- [x] PASS — should save every field and coerce missing values to an empty string
- [x] PASS — should not save before config has loaded
- [x] PASS — should set the saved flag on a successful save
- [x] PASS — should clear the saved flag after 2.5 seconds
- [x] PASS — should show and then hide the saved message in the UI
- [x] PASS — should navigate to login when signing out from the sidebar

### `src/app/core/guards/auth.guard.spec.ts` — 2/2 PASS

- [x] PASS — should allow activation when the user is logged in
- [x] PASS — should deny activation and redirect to login when the user is not logged in

### `src/app/admin/dashboard/dashboard.component.spec.ts` — 11/11 PASS

- [x] PASS — should create
- [x] PASS — should fetch all aggregations once on init
- [x] PASS — should populate counts and lists from the aggregated API responses
- [x] PASS — should derive pending, confirmed, and cancelled counts from reservations
- [x] PASS — should return the six most recent reservations sorted by descending id
- [x] PASS — should compute barWidth percentages and handle a zero total
- [x] PASS — should expose today as an en-AU long date string
- [x] PASS — should render the five stat cards after data loads
- [x] PASS — should render the empty chart state when all API responses are empty
- [x] PASS — should stop loading and show an error when an API call errors
- [x] PASS — should delegate sign out to AuthService

### `src/app/core/interceptors/auth.interceptor.spec.ts` — 5/5 PASS

- [x] PASS — should add a Bearer Authorization header when a token exists
- [x] PASS — should leave the Authorization header absent when no token exists
- [x] PASS — should logout and rethrow when a request returns 401
- [x] PASS — should not logout when a non-auth request returns 500
- [x] PASS — should not logout when the login request returns 401

### `src/app/admin/hours-manager/hours-manager.component.spec.ts` — 10/10 PASS

- [x] PASS — should create
- [x] PASS — should load business hours on init
- [x] PASS — should expose all seven weekdays
- [x] PASS — should map a business hour to its day name
- [x] PASS — should save an hour and clear the saving index on success
- [x] PASS — should clear the saving index when saving fails
- [x] PASS — should show the saving state while the request is pending
- [x] PASS — should disable time inputs for a closed day
- [x] PASS — should save the updated closed state after the toggle changes
- [x] PASS — should navigate to login when signing out from the sidebar

### `src/app/admin/gallery-manager/gallery-manager.component.spec.ts` — 23/23 PASS

- [x] PASS — should create
- [x] PASS — should load all gallery images on init without an error
- [x] PASS — should set a load error message when fetching images fails
- [x] PASS — should render the load error when no images are loaded
- [x] PASS — should ignore a file selection with no file
- [x] PASS — should upload a selected file with the caption and next display order
- [x] PASS — should use the highest existing display order plus one after a deletion gap
- [x] PASS — should stop uploading and keep the caption when the upload fails
- [x] PASS — should render the uploading status and disable the file input while uploading
- [x] PASS — should toggle image visibility through the API
- [x] PASS — should toggle a hidden image back to visible
- [x] PASS — should not delete an image when confirmation is declined
- [x] PASS — should delete an image after confirmation and reload
- [x] PASS — should not reorder the first image upward
- [x] PASS — should not reorder the last image downward
- [x] PASS — should renumber images when moving an image up
- [x] PASS — should renumber images when moving an image down
- [x] PASS — should create unique display orders when existing orders are duplicated
- [x] PASS — should render inactive styling, visibility labels and order badges
- [x] PASS — should disable reorder buttons at the list boundaries
- [x] PASS — should not prefix absolute image URLs with the API base
- [x] PASS — should render the empty state when there are no images
- [x] PASS — should navigate to login when signing out from the sidebar

### `src/app/admin/login/login.component.spec.ts` — 12/12 PASS

- [x] PASS — should create
- [x] PASS — should start with an invalid empty form
- [x] PASS — should not call login when the form is invalid
- [x] PASS — should call login with the expected credentials when the form is valid
- [x] PASS — should navigate to the dashboard on successful login
- [x] PASS — should set loading and clear error while login is in flight
- [x] PASS — should show an error and reset loading when login fails
- [x] PASS — should render the error message in the template after a failed login
- [x] PASS — should clear a previous error on a new submit
- [x] PASS — should disable the submit button while loading
- [x] PASS — should post credentials, store the access token, and navigate on success
- [x] PASS — should not persist a token when the backend rejects the login

### `src/app/admin/menu-manager/menu-manager.component.spec.ts` — 24/24 PASS

- [x] PASS — should create
- [x] PASS — should load all categories on init and default the new item category to the first
- [x] PASS — should leave the new item category unset when no categories exist
- [x] PASS — should render category chips and per-category item counts
- [x] PASS — should not create a category when the name is blank
- [x] PASS — should create a trimmed category, clear the input and reload
- [x] PASS — should not delete a category when confirmation is declined
- [x] PASS — should delete a category after confirmation and reload
- [x] PASS — should reset the selected category when it is deleted
- [x] PASS — should not add an item without a name
- [x] PASS — should not add an item with a whitespace-only name
- [x] PASS — should not add an item without a category
- [x] PASS — should add a trimmed item, reset the draft and reload
- [x] PASS — should clone the item when editing starts
- [x] PASS — should cancel editing
- [x] PASS — should not save when no item is being edited
- [x] PASS — should update the item without sending its id and reload
- [x] PASS — should delete an item only after confirmation
- [x] PASS — should ignore an image upload event with no file
- [x] PASS — should upload the selected file from the input change event
- [x] PASS — should remove an image only after confirmation
- [x] PASS — should not prefix absolute image URLs with the API base
- [x] PASS — should show edit controls only for the item being edited
- [x] PASS — should navigate to login when signing out from the sidebar

### `src/app/admin/reservations/reservations.component.spec.ts` — 15/15 PASS

- [x] PASS — should create
- [x] PASS — should load reservations on init
- [x] PASS — should return every reservation when the filter is all
- [x] PASS — should filter reservations by pending status
- [x] PASS — should filter reservations by confirmed status
- [x] PASS — should filter reservations by cancelled status
- [x] PASS — should update a reservation status and reload
- [x] PASS — should not delete a reservation when confirmation is declined
- [x] PASS — should delete a reservation after confirmation and reload
- [x] PASS — should render one row per reservation on initial load
- [x] PASS — should apply a filter when a status pill is clicked
- [x] PASS — should render the empty row when no reservations match the filter
- [x] PASS — should call setStatus from the Confirm action button
- [x] PASS — should call delete from the Delete action button after confirmation
- [x] PASS — should navigate to login when signing out from the sidebar

## TDD Defect-Fix Cycles

### Admin edge cases

Red phase first:

- Expanded suite from 156 to 163 tests.
- Initial expanded run: **13 failures**, including dashboard API error state and admin gallery/menu/config edge cases.

Green phase fixes:

- Dashboard: explicit load error state and `loading = false` on API error.
- Gallery: highest existing `display_order + 1` upload order, stable reorder renumbering, absolute image URL handling, visible load error.
- Menu: trimmed category and item names, reset deleted selected category, absolute image URL handling.
- Config: block save before config load completes, nullish-to-empty-string values, visible load error, disabled Save while loading.

Cycle result: **163/163 PASS**.

### Auth hardening

Red phase first:

- Expanded suite from 163 to 169 tests.
- Added JWT expiry/shape tests and interceptor error-path tests.

Green phase fixes:

- `AuthService.getToken()` validates three JWT parts, numeric `exp`, and future expiry; malformed/expired/no-expiry tokens are removed.
- `AuthService.isLoggedIn()` delegates to validated `getToken()`.
- `authInterceptor` skips `Authorization` for `/auth/login`, logs out and rethrows on non-login `401`, and leaves `500` errors to callers.

Cycle result: **169/169 PASS**.

### API base URL and CORS

Red phase first:

- Expanded frontend suite from 169 to 174 tests.
- Added 2 backend tests.
- Frontend compile initially failed with `Module not found: Error: Can't resolve './api.config'`.
- Backend tests initially failed because CORS origins were hardcoded.

Green phase fixes:

- Added `getApiUrl()` and `API_URL` in `src/app/core/services/api.config.ts`.
- `ApiService` now uses `getApiUrl()` instead of hardcoded `http://localhost:8000`.
- Backend now uses `configured_cors_origins()` with `CORS_ALLOW_ORIGINS` and local defaults.

Cycle result: **174/174 frontend PASS**, **2/2 backend PASS**.

### Home configured images and category observers

Red phase first:

- Expanded frontend suite from 174 to 180 tests.
- Initial run: **4 failures** for configured relative image URLs and observer refresh after search/clear.

Green phase fixes:

- Added `scheduleCatObserverRefresh()` with a `setTimeout(..., 0)` refresh after search input, suggestion selection, and clear search.
- `logoUrl` now resolves configured relative image URLs through `resolveImageUrl()`.
- `heroImg` now resolves configured relative image URLs and retains the fallback when unset.

Cycle result: **180/180 PASS**.

## Browser QA Results

- Nav CTA text: `Call to Order`
- Nav CTA text color: `rgb(255, 255, 255)`
- Nav CTA background: `rgb(122, 31, 43)`
- Visit grid children: details card width `568`, hours card width `568`, map iframe width `1160`
- Browser console: no error or warning messages observed.
- Browser QA was run before the final API-config and home-observer changes; local defaults remain `http://localhost:8000`.

## Database Inspection Results

Database inspected: `backend/restaurant.db`

- Tables: `business_hours`, `gallery_images`, `menu_categories`, `menu_items`, `reservations`, `site_config`, `users`
- Indexes: `ix_users_username`, `ix_users_id`, `ix_site_config_key`, `ix_business_hours_id`, `ix_menu_categories_id`, `ix_gallery_images_id`, `ix_reservations_id`, `ix_menu_items_id`
- Row counts: `business_hours=7`, `gallery_images=0`, `menu_categories=5`, `menu_items=6`, `reservations=0`, `site_config=10`, `users=1`
- Finding: no obvious extra index required for the current dataset. No schema or index changes applied.

## Build Results

- `angular.json` production style budget changed from `4kB/8kB` to `24kB/28kB` because `home.component.scss` is intentionally large.
- `npx ng build --configuration development` passed.
- `npx ng build` passed after the budget change.

## Runtime Configuration

- Frontend API base resolution: meta `api-url` > `window.RESTAURANT_API_URL` > local `http://localhost:8000` > same-origin paths.
- Backend CORS allowlist: `CORS_ALLOW_ORIGINS` comma-separated, defaulting to `http://localhost:4200,http://127.0.0.1:4200`.
- `README.md` documents both settings.

## Pending Non-Unit Checks

- Browser QA was not repeated after the final API-config and home-observer changes.
