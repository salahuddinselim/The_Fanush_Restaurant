# Graph Report - restaurant-site  (2026-11-20)

## Corpus Check
- 105 files · ~163,796 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 922 nodes · 1849 edges · 67 communities (55 shown, 12 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 100 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `71f56610`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- t
- ref.js
- HomeComponent
- AuthService
- MenuManagerComponent
- H
- schemas.py
- app/auth.py
- api.service.ts
- ie
- User
- Project Constitution Memory
- fn
- GalleryManagerComponent
- Dn
- markdown_sections.py
- dashboard.component.spec.ts
- devDependencies
- dependencies
- Unit Test Results (180/180 Pass)
- DashboardComponent
- F
- common.ps1
- gallery.py
- ReservationsComponent
- Ji
- BusinessHour
- package.json
- Security Audit Report
- co
- models.py
- create_reservation
- options
- ApiService
- create_review
- scripts
- development
- login
- Home Hero Section Screenshot
- production
- frontend
- create-new-feature.ps1
- angular.json
- zone.js
- karma-coverage
- K
- update_config
- update_hour
- architect
- us
- The Fanus Restaurant Site README
- add_security_headers
- CorsConfigTests
- u
- oc
- oo
- @angular/compiler-cli
- api.config.ts
- fs
- Frontend Angular README
- karma-jasmine

## God Nodes (most connected - your core abstractions)
1. `HomeComponent` - 63 edges
2. `ApiService` - 53 edges
3. `AuthService` - 30 edges
4. `t()` - 24 edges
5. `User` - 22 edges
6. `fn()` - 22 edges
7. `H()` - 22 edges
8. `config()` - 21 edges
9. `F()` - 19 edges
10. `n()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `speckit-plan Skill` --references--> `Plan Template`  [INFERRED]
  restaurant-site/.claude/skills/speckit-plan/SKILL.md → restaurant-site/.specify/templates/plan-template.md
- `Security Audit Report` --references--> `Functional QA Report`  [INFERRED]
  restaurant-site/security-audit/04-security-audit-report.md → restaurant-site/security-audit/03-functional-qa-report.md
- `Admin Login Form Screenshot` --semantically_similar_to--> `Admin Dashboard Stats Screenshot`  [INFERRED] [semantically similar]
  restaurant-site/docs/screenshots/admin-login-form.jpeg → restaurant-site/docs/screenshots/admin-dashboard-stats.jpeg
- `Home Hero Section Screenshot` --semantically_similar_to--> `Home About Section Screenshot`  [INFERRED] [semantically similar]
  restaurant-site/docs/screenshots/home-hero.png → restaurant-site/docs/screenshots/home-about.jpeg
- `Home Hero Section Screenshot` --semantically_similar_to--> `Home Menu Section Screenshot`  [INFERRED] [semantically similar]
  restaurant-site/docs/screenshots/home-hero.png → restaurant-site/docs/screenshots/home-menu.jpeg

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Admin Panel Components (share sidebar navigation layout)** — frontend_src_app_admin_config_manager_config_manager_component_template, frontend_src_app_admin_dashboard_dashboard_component_template, frontend_src_app_admin_gallery_manager_gallery_manager_component_template, frontend_src_app_admin_hours_manager_hours_manager_component_template, frontend_src_app_admin_menu_manager_menu_manager_component_template, frontend_src_app_admin_reservations_reservations_component_template, frontend_src_app_admin_reviews_reviews_component_template, fanus_cms_admin_sidebar_nav [EXTRACTED 1.00]
- **Restaurant Site Tech Stack** — restaurant_site_readme_md_restaurant_site, restaurant_site_backend_requirements_txt_python_deps, fastapi_backend_concept, angular_frontend_concept [EXTRACTED 1.00]
- **Security Audit Pipeline (inventory → plan → qa → audit → register → remediation → regression → final)** — restaurant_site_security_audit_01_application_inventory_inventory, restaurant_site_security_audit_02_test_plan_test_plan, restaurant_site_security_audit_03_functional_qa_report_functional_qa, restaurant_site_security_audit_04_security_audit_report_security_audit, restaurant_site_security_audit_09_vulnerability_register_vuln_register, restaurant_site_security_audit_10_remediation_plan_remediation, restaurant_site_security_audit_11_regression_test_report_regression, restaurant_site_security_audit_12_final_security_assessment_final_assessment [EXTRACTED 1.00]
- **All Spec-Kit Skills v1.4.4** — _claude_skills_speckit_analyze_skill_speckit_analyze, _claude_skills_speckit_checklist_skill_speckit_checklist, _claude_skills_speckit_clarify_skill_speckit_clarify, _claude_skills_speckit_constitution_skill_speckit_constitution, _claude_skills_speckit_converge_skill_speckit_converge, _claude_skills_speckit_implement_skill_speckit_implement, _claude_skills_speckit_plan_skill_speckit_plan, _claude_skills_speckit_specify_skill_speckit_specify, _claude_skills_speckit_tasks_skill_speckit_tasks [EXTRACTED 1.00]
- **Skills Consuming Constitution** — _claude_skills_speckit_analyze_skill_speckit_analyze, _claude_skills_speckit_clarify_skill_speckit_clarify, _claude_skills_speckit_checklist_skill_speckit_checklist, _claude_skills_speckit_converge_skill_speckit_converge, _claude_skills_speckit_implement_skill_speckit_implement, _claude_skills_speckit_plan_skill_speckit_plan, _claude_skills_speckit_specify_skill_speckit_specify, _claude_skills_speckit_tasks_skill_speckit_tasks, _specify_memory_constitution_md_constitution [EXTRACTED 1.00]
- **Spec-Kit Core SDD Pipeline** — _claude_skills_speckit_specify_skill_speckit_specify, _claude_skills_speckit_clarify_skill_speckit_clarify, _claude_skills_speckit_plan_skill_speckit_plan, _claude_skills_speckit_tasks_skill_speckit_tasks, _claude_skills_speckit_implement_skill_speckit_implement, _claude_skills_speckit_converge_skill_speckit_converge [EXTRACTED 1.00]

## Communities (67 total, 12 thin omitted)

### Community 0 - "t"
Cohesion: 0.10
Nodes (39): ao(), ca(), i(), n(), commit(), Do(), Ee(), ft() (+31 more)

### Community 1 - "ref.js"
Cohesion: 0.04
Nodes (61): ac(), Ar, as(), At, Be, bs, dt, $e() (+53 more)

### Community 2 - "HomeComponent"
Cohesion: 0.05
Nodes (4): Review, HomeComponent, Component, HostListener

### Community 3 - "AuthService"
Cohesion: 0.09
Nodes (14): LoginComponent, TOKEN_RESPONSE, TokenResponse, Component, AppComponent, Component, appConfig, routes (+6 more)

### Community 5 - "H"
Cohesion: 0.08
Nodes (20): action(), clone(), config(), create(), createIfNotExists(), createOrReplace(), Ct(), dataRequest() (+12 more)

### Community 6 - "schemas.py"
Cohesion: 0.14
Nodes (25): BusinessHourBase, BusinessHourOut, BusinessHourUpdate, ConfigBulkUpdate, ConfigItem, GalleryImageOut, GalleryImageUpdate, LoginRequest (+17 more)

### Community 7 - "app/auth.py"
Cohesion: 0.20
Nodes (12): create_access_token(), decode_token(), get_current_user(), hash_password(), Session, _require_secret(), verify_password(), get_db() (+4 more)

### Community 8 - "api.service.ts"
Cohesion: 0.17
Nodes (6): ConfigManagerComponent, buildApiSpy(), makeConfig(), Component, Config, ReviewCreate

### Community 9 - "ie"
Cohesion: 0.11
Nodes (36): a(), bn(), cn(), de(), Et(), Fe(), gn(), hn() (+28 more)

### Community 10 - "User"
Cohesion: 0.21
Nodes (20): User, me(), get, create_category(), create_item(), delete_category(), delete_item(), get_all_categories() (+12 more)

### Community 11 - "Project Constitution Memory"
Cohesion: 0.19
Nodes (20): speckit-analyze Skill, speckit-checklist Skill, speckit-clarify Skill, speckit-constitution Skill, speckit-converge Skill, speckit-implement Skill, speckit-plan Skill, speckit-specify Skill (+12 more)

### Community 12 - "fn"
Cohesion: 0.12
Nodes (9): dr(), fn(), gt(), i(), b(), ks(), Ui(), Yr() (+1 more)

### Community 13 - "GalleryManagerComponent"
Cohesion: 0.15
Nodes (5): GalleryManagerComponent, buildApiSpy(), makeImages(), Component, GalleryImage

### Community 14 - "Dn"
Cohesion: 0.22
Nodes (3): Dn, patch(), xt()

### Community 15 - "markdown_sections.py"
Cohesion: 0.16
Nodes (15): field_validator, _anchor(), _link_labels(), _main(), Bounded Markdown section replacement, also shipped with standalone helpers., Replace one ATX section body without rewriting any surrounding text., A section selector did not identify exactly one eligible heading., Validate opt-in selector metadata without silently changing strategies. (+7 more)

### Community 16 - "dashboard.component.spec.ts"
Cohesion: 0.10
Nodes (12): MOCK_CATEGORIES, MOCK_GALLERY, MOCK_RESERVATIONS, buildApiSpy(), makeCategories(), MenuCategory, MenuItem, DAYS (+4 more)

### Community 17 - "devDependencies"
Cohesion: 0.12
Nodes (17): @angular/cli, @angular-devkit/build-angular, devDependencies, @angular/cli, @angular-devkit/build-angular, jasmine-core, karma, karma-chrome-launcher (+9 more)

### Community 18 - "dependencies"
Cohesion: 0.11
Nodes (19): @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/platform-browser-dynamic, @angular/router, dependencies (+11 more)

### Community 19 - "Unit Test Results (180/180 Pass)"
Cohesion: 0.18
Nodes (17): Fanus CMS Admin Sidebar Navigation, Fanus Restaurant (LocalBusiness Entity), robots.txt (Fanus Restaurant), Config Manager Admin Component (HTML), Dashboard Admin Component (HTML), Gallery Manager Admin Component (HTML), Hours Manager Admin Component (HTML), Login Admin Component (HTML) (+9 more)

### Community 21 - "F"
Cohesion: 0.18
Nodes (15): aa(), Cs(), Da(), F(), Fa(), ga(), La(), ln() (+7 more)

### Community 22 - "common.ps1"
Cohesion: 0.21
Nodes (13): Find-SpecifyRoot(), Format-SpecKitCommand(), Get-CurrentBranch(), Get-FeaturePathsEnv(), Get-InvokeSeparator(), Get-NormalizedPriority(), Get-Python3Command(), Get-RepoRoot() (+5 more)

### Community 23 - "gallery.py"
Cohesion: 0.18
Nodes (14): delete_image(), get_gallery(), get_gallery_admin(), delete, get, post, put, Session (+6 more)

### Community 24 - "ReservationsComponent"
Cohesion: 0.18
Nodes (5): ReservationsComponent, buildApiSpy(), makeReservations(), Component, Reservation

### Community 25 - "Ji"
Cohesion: 0.16
Nodes (13): abort(), bo(), fetch(), getAllResponseHeaders(), Ji(), b(), x(), n() (+5 more)

### Community 26 - "BusinessHour"
Cohesion: 0.17
Nodes (6): DAYS, HoursManagerComponent, buildApiSpy(), makeHours(), Component, BusinessHour

### Community 27 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 28 - "Security Audit Report"
Cohesion: 0.20
Nodes (12): File Upload Validation Design (Extension + Magic Byte + Size), JWT localStorage Accepted Risk, Application Inventory, Security Test Plan, Functional QA Report, Security Audit Report, API Security Report, Database Security Report (+4 more)

### Community 30 - "models.py"
Cohesion: 0.33
Nodes (10): Base, BusinessHour, GalleryImage, MenuCategory, MenuItem, Reservation, Review, RevokedToken (+2 more)

### Community 31 - "create_reservation"
Cohesion: 0.18
Nodes (11): create_reservation(), delete_reservation(), list_reservations(), delete, get, limit, post, put (+3 more)

### Community 32 - "options"
Cohesion: 0.20
Nodes (14): options, assets, browser, index, inlineStyleLanguage, outputPath, polyfills, scripts (+6 more)

### Community 33 - "ApiService"
Cohesion: 0.11
Nodes (4): ReviewsComponent, Component, ApiService, Injectable

### Community 34 - "create_review"
Cohesion: 0.20
Nodes (10): create_review(), delete_review(), get_reviews(), delete, get, limit, post, Request (+2 more)

### Community 35 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, ng, start, test, watch

### Community 36 - "development"
Cohesion: 0.22
Nodes (9): serve, development, buildTarget, extractLicenses, optimization, sourceMap, builder, configurations (+1 more)

### Community 37 - "login"
Cohesion: 0.32
Nodes (8): _check_lockout(), login(), logout(), limit, post, Request, Response, Session

### Community 38 - "Home Hero Section Screenshot"
Cohesion: 0.29
Nodes (8): Menu Item Upload Photo (Thesis Defense Portrait), Admin Dashboard Stats Screenshot, Admin Login Form Screenshot, Home About Section Screenshot, Home Hero Section Screenshot, Home Menu Section Screenshot, Home Reservation Form Screenshot, Home Visit / Find Us Section Screenshot

### Community 39 - "production"
Cohesion: 0.22
Nodes (9): build, builder, configurations, defaultConfiguration, production, budgets, buildTarget, optimization (+1 more)

### Community 40 - "frontend"
Cohesion: 0.25
Nodes (8): prefix, projectType, root, schematics, sourceRoot, frontend, style, @schematics/angular:component

### Community 41 - "create-new-feature.ps1"
Cohesion: 0.39
Nodes (4): ConvertTo-AsciiLower(), ConvertTo-CleanBranchName(), ConvertTo-UnicodeWords(), Get-BranchName()

### Community 42 - "angular.json"
Cohesion: 0.29
Nodes (6): cli, analytics, newProjectRoot, projects, $schema, version

### Community 45 - "K"
Cohesion: 0.18
Nodes (12): An(), constructor(), ei(), eo(), fo(), getDataUrl(), go, K() (+4 more)

### Community 46 - "update_config"
Cohesion: 0.40
Nodes (5): get_config(), get, put, Session, update_config()

### Community 47 - "update_hour"
Cohesion: 0.40
Nodes (5): get_hours(), get, put, Session, update_hour()

### Community 48 - "architect"
Cohesion: 0.40
Nodes (5): extract-i18n, test, builder, architect, builder

### Community 49 - "us"
Cohesion: 0.29
Nodes (6): ds(), ls(), Tr(), us(), a(), c()

### Community 50 - "The Fanus Restaurant Site README"
Cohesion: 0.67
Nodes (4): Angular 17 Frontend Application, FastAPI Backend Application, Backend Python Dependencies, The Fanus Restaurant Site README

### Community 51 - "add_security_headers"
Cohesion: 0.50
Nodes (4): add_security_headers(), Request, Response, middleware

### Community 53 - "u"
Cohesion: 0.24
Nodes (17): Fr(), lr(), oa(), b(), c(), d(), h(), l() (+9 more)

### Community 58 - "api.config.ts"
Cohesion: 0.40
Nodes (3): API_URL, getApiUrl(), Window

## Knowledge Gaps
- **102 isolated node(s):** `Li`, `dt`, `ur`, `Jr`, `Vi` (+97 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `HomeComponent` connect `HomeComponent` to `dashboard.component.spec.ts`, `api.service.ts`, `BusinessHour`, `GalleryManagerComponent`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `ApiService` connect `ApiService` to `AuthService`, `MenuManagerComponent`, `api.service.ts`, `GalleryManagerComponent`, `dashboard.component.spec.ts`, `DashboardComponent`, `ReservationsComponent`, `BusinessHour`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `fn()` connect `fn` to `t`, `ref.js`, `Dn`, `u`, `F`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `t()` (e.g. with `qa()` and `o()`) actually correct?**
  _`t()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Li`, `dt`, `ur` to the rest of the system?**
  _102 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `t` be split into smaller, more focused modules?**
  _Cohesion score 0.1048780487804878 - nodes in this community are weakly interconnected._
- **Should `ref.js` be split into smaller, more focused modules?**
  _Cohesion score 0.03639240506329114 - nodes in this community are weakly interconnected._