import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';
import { HomeComponent } from './home.component';
import { ApiService, MenuCategory, BusinessHour } from '../../core/services/api.service';

const MOCK_CATEGORIES: MenuCategory[] = [
  { id: 1, name: 'Pizza', display_order: 0, is_active: true, items: [{ id: 10, name: 'Margherita', price: 15.5, description: 'Classic tomato', category_id: 1, image_url: null, is_available: true, display_order: 0 }] },
  { id: 2, name: 'Pasta', display_order: 1, is_active: true, items: [{ id: 20, name: 'Carbonara', price: 18.0, description: 'Creamy pasta', category_id: 2, image_url: null, is_available: true, display_order: 0 }] },
];

const MOCK_HOURS: BusinessHour[] = [
  { id: 1, day_of_week: 0, open_time: '09:00', close_time: '21:00', is_closed: false },
  { id: 2, day_of_week: 6, open_time: '', close_time: '', is_closed: true },
];

function buildApiSpy(): jasmine.SpyObj<ApiService> {
  const spy = jasmine.createSpyObj<ApiService>('ApiService', [
    'getConfig', 'getCategories', 'getGallery', 'getHours', 'createReservation',
  ]);
  spy.getConfig.and.returnValue(of({ restaurant_name: 'Test Kitchen', phone: '+61 400 000 000' }));
  spy.getCategories.and.returnValue(of(MOCK_CATEGORIES));
  spy.getGallery.and.returnValue(of([]));
  spy.getHours.and.returnValue(of(MOCK_HOURS));
  return spy;
}

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    apiSpy = buildApiSpy();
    await TestBed.configureTestingModule({
      imports: [HomeComponent, CommonModule, ReactiveFormsModule, RouterTestingModule],
      providers: [{ provide: ApiService, useValue: apiSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── CREATION ──────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories on init', () => {
    expect(component.categories.length).toBe(2);
    expect(component.activeCatId).toBe(1);
  });

  it('should load config on init', () => {
    expect(component.name).toBe('Test Kitchen');
    expect(component.phone).toBe('+61 400 000 000');
  });

  // ── STICKY CATEGORY BAR ───────────────────────────────────────────────────
  it('should render cat-sticky-bar when categories exist', () => {
    const bar = fixture.nativeElement.querySelector('.cat-sticky-bar');
    expect(bar).not.toBeNull();
  });

  it('should render correct number of category buttons in sticky bar', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.cat-scroll-track button');
    expect(buttons.length).toBe(2);
  });

  it('should render menu cards for items', () => {
    const cards = fixture.nativeElement.querySelectorAll('.menu-card');
    expect(cards.length).toBe(2); // one per item across all categories
  });

  it('menu card should contain card-name and card-price', () => {
    const card = fixture.nativeElement.querySelector('.menu-card');
    expect(card.querySelector('.card-name')).not.toBeNull();
    expect(card.querySelector('.card-price')).not.toBeNull();
  });

  it('menu card should show an image with fallback when item has no image_url', () => {
    const image = fixture.nativeElement.querySelector('.card-img-wrap img') as HTMLImageElement;
    expect(image).not.toBeNull();
    expect(image.getAttribute('src')).toContain('images.unsplash.com');
  });

  it('menuItemImage should use uploaded image URLs and resolve relative paths', () => {
    const item = { ...MOCK_CATEGORIES[0].items[0] };
    expect(component.menuItemImage(item, 'Pizza')).toContain('images.unsplash.com');
    item.image_url = '/static/uploads/menu/pizza.png';
    expect(component.menuItemImage(item, 'Pizza')).toBe('http://localhost:8000/static/uploads/menu/pizza.png');
    item.image_url = 'https://example.com/pizza.png';
    expect(component.menuItemImage(item, 'Pizza')).toBe('https://example.com/pizza.png');
  });

  it('menu card price should include A$ prefix', () => {
    const price = fixture.nativeElement.querySelector('.card-price');
    expect(price?.textContent).toContain('A$');
  });

  it('menu card should have aria-label with item name and price', () => {
    const card = fixture.nativeElement.querySelector('.menu-card');
    expect(card?.getAttribute('aria-label')).toContain('A$');
  });

  it('should mark first category as active by default', () => {
    const activeBtn = fixture.nativeElement.querySelector('.cat-scroll-track button.active');
    expect(activeBtn?.textContent?.trim()).toBe('Pizza');
  });

  it('should update activeCatId when category tab is clicked', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.cat-scroll-track button') as NodeListOf<HTMLButtonElement>;
    buttons[1].click();
    fixture.detectChanges();
    expect(component.activeCatId).toBe(2);
    const activeBtn = fixture.nativeElement.querySelector('.cat-scroll-track button.active');
    expect(activeBtn?.textContent?.trim()).toBe('Pasta');
  });

  it('should hide cat-sticky-bar when search query is active', () => {
    component.searchQuery = 'pizza';
    fixture.detectChanges();
    const bar = fixture.nativeElement.querySelector('.cat-sticky-bar');
    expect(bar).toBeNull();
  });

  // ── SEARCH ────────────────────────────────────────────────────────────────
  it('should filter categories by search query', () => {
    component.onSearchInput('carb');
    expect(component.filteredCategories.length).toBe(1);
    expect(component.filteredCategories[0].name).toBe('Pasta');
  });

  it('should return empty filteredCategories for unmatched query', () => {
    component.onSearchInput('xyznotfound');
    expect(component.filteredCategories.length).toBe(0);
  });

  it('should clear search and restore all categories', () => {
    component.onSearchInput('pizza');
    component.clearSearch();
    expect(component.searchQuery).toBe('');
    expect(component.filteredCategories.length).toBe(2);
  });

  it('should populate searchSuggestions when typing 2+ chars', () => {
    component.onSearchInput('mar');
    expect(component.searchSuggestions).toContain('Margherita');
  });

  it('should hide suggestions after clearSearch', () => {
    component.onSearchInput('mar');
    component.clearSearch();
    expect(component.showSuggestions).toBeFalse();
    expect(component.searchQuery).toBe('');
  });

  it('should refresh category observers after search filters the menu', fakeAsync(() => {
    const setupSpy = spyOn<any>(component, 'setupCatObserver');

    component.onSearchInput('pizza');
    tick();

    expect(setupSpy).toHaveBeenCalled();
  }));

  it('should refresh category observers after search is cleared', fakeAsync(() => {
    component.onSearchInput('pizza');
    const setupSpy = spyOn<any>(component, 'setupCatObserver');

    component.clearSearch();
    tick();

    expect(setupSpy).toHaveBeenCalled();
  }));

  it('selectSuggestion sets query and scrolls to menu', () => {
    spyOn(document, 'getElementById').and.returnValue(null);
    component.selectSuggestion('Carbonara');
    expect(component.searchQuery).toBe('Carbonara');
    expect(component.showSuggestions).toBeFalse();
  });

  // ── RESERVATION FORM ──────────────────────────────────────────────────────
  it('should mark form invalid when required fields are empty', () => {
    component.form.reset();
    expect(component.form.invalid).toBeTrue();
  });

  it('should validate email field format', () => {
    component.form.patchValue({ email: 'not-an-email' });
    expect(component.form.get('email')!.invalid).toBeTrue();
    component.form.patchValue({ email: 'valid@example.com' });
    expect(component.form.get('email')!.valid).toBeTrue();
  });

  it('should not submit when form is invalid', () => {
    component.form.reset();
    component.onSubmit();
    expect(apiSpy.createReservation).not.toHaveBeenCalled();
  });

  it('should submit successfully when form is valid', fakeAsync(() => {
    apiSpy.createReservation.and.returnValue(of({} as any));
    component.form.patchValue({
      name: 'Alice', email: 'alice@test.com', date: '2027-01-01', time: '19:00', party_size: 2,
    });
    component.onSubmit();
    tick();
    expect(component.submitted).toBeTrue();
  }));

  it('should show error message on reservation submission failure', fakeAsync(() => {
    apiSpy.createReservation.and.returnValue(throwError(() => new Error('network error')));
    component.form.patchValue({
      name: 'Bob', email: 'bob@test.com', date: '2027-01-01', time: '20:00', party_size: 3,
    });
    component.onSubmit();
    tick();
    expect(component.submitError).toBeTruthy();
    expect(component.submitted).toBeFalse();
  }));

  // ── HOURS / UTILS ─────────────────────────────────────────────────────────
  it('dayName should return day string for day_of_week index', () => {
    expect(component.dayName(MOCK_HOURS[0])).toBe('Monday');
    expect(component.dayName(MOCK_HOURS[1])).toBe('Sunday');
  });

  // ── SCROLL / NAV ──────────────────────────────────────────────────────────
  it('scrollTo should close mobile menu', () => {
    component.mobileMenuOpen = true;
    spyOn(document, 'getElementById').and.returnValue(null);
    component.scrollTo('about');
    expect(component.mobileMenuOpen).toBeFalse();
  });

  it('navScrolled should be false initially', () => {
    expect(component.navScrolled).toBeFalse();
  });

  it('should render nav CTA with white text on wine background', () => {
    const cta = fixture.nativeElement.querySelector('.nav-cta') as HTMLElement;
    expect(cta.textContent?.trim()).toBe(component.ctaText);
    const style = getComputedStyle(cta);
    expect(style.color).toBe('rgb(255, 255, 255)');
    expect(style.backgroundColor).toBe('rgb(122, 31, 43)');
  });

  it('should render restaurant details, opening hours, and map as separate visit cards', () => {
    const visitGrid = fixture.nativeElement.querySelector('.visit-grid') as HTMLElement;
    const detailsCard = visitGrid.querySelector('.details-card') as HTMLElement;
    const hoursCard = visitGrid.querySelector('.hours-card') as HTMLElement;
    const mapFrame = visitGrid.querySelector('.map-frame') as HTMLElement;

    expect(visitGrid.children.length).toBe(3);
    expect(detailsCard.textContent).toContain('Restaurant Details');
    expect(detailsCard.textContent).not.toContain('Opening Hours');
    expect(hoursCard.textContent).toContain('Opening Hours');
    expect(hoursCard.querySelector('.hours-list')).not.toBeNull();
    expect(mapFrame.querySelector('iframe')).not.toBeNull();
  });

  // ── COMPUTED PROPERTIES ───────────────────────────────────────────────────
  it('allItems should return flat list of all items across categories', () => {
    expect(component.allItems.length).toBe(2);
  });

  it('menuItemCount should count all items across categories', () => {
    expect(component.menuItemCount).toBe(2);
  });

  it('logoUrl should return empty string when not in config', () => {
    expect(component.logoUrl).toBe('');
  });

  it('logoUrl should resolve a relative configured image URL', () => {
    component.config['logo_url'] = '/static/uploads/logo.png';

    expect(component.logoUrl).toBe('http://localhost:8000/static/uploads/logo.png');
  });

  it('logoUrl should preserve an absolute configured image URL', () => {
    component.config['logo_url'] = 'https://cdn.example.com/logo.png';

    expect(component.logoUrl).toBe('https://cdn.example.com/logo.png');
  });

  it('heroImg should resolve a relative configured image URL', () => {
    component.config['hero_image_url'] = 'static/uploads/hero.jpg';

    expect(component.heroImg).toBe('http://localhost:8000/static/uploads/hero.jpg');
  });

  it('heroImg should keep the fallback when no image is configured', () => {
    expect(component.heroImg).toBe(component.HERO_FALLBACK);
  });

  it('should have correct current year', () => {
    expect(component.year).toBe(new Date().getFullYear());
  });
});
