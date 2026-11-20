# Accessibility Report

**Date:** 2026-11-18  
**Target:** WCAG 2.2 AA

## Findings

| ID | Severity | Issue |
|---|---|---|
| A-001 | INFO | `<html lang="en">` present — PASS |
| A-002 | INFO | Menu item cards use `article` with `tabindex="0"` — PASS |
| A-003 | HIGH | Modal (menu item detail) lacks focus trap |
| A-004 | MEDIUM | Search suggestions dropdown lacks `role="listbox"` / `aria-expanded` |
| A-005 | LOW | Emoji category icons lack `aria-hidden="true"` |
| A-006 | MEDIUM | Mobile nav toggle button — check `aria-label` and `aria-expanded` |
| A-007 | LOW | Hero section `<h1>` title pulled from config — ensure it always renders |
| A-008 | INFO | Color contrast on overlay text should be verified against hero image |

### A-003 Fix: Focus Trap in Modal
When `selectedMenuItem` is set, trap focus within the modal container. Use Angular CDK `FocusTrap`:
```typescript
import { A11yModule } from '@angular/cdk/a11y';
// In template: <div cdkTrapFocus [cdkTrapFocusAutoCapture]="true">
```

### A-004 Fix: Search Suggestions
```html
<input [attr.aria-expanded]="showSuggestions" aria-autocomplete="list" aria-controls="search-suggestions">
<ul id="search-suggestions" role="listbox">
  <li *ngFor="let s of searchSuggestions" role="option">{{s}}</li>
</ul>
```
