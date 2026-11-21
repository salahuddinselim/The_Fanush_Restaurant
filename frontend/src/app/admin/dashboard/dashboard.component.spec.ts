import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { ApiService, GalleryImage, MenuCategory, MenuItem, Reservation } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

function menuItem(id: number, categoryId: number): MenuItem {
  return {
    id,
    category_id: categoryId,
    name: `Item ${id}`,
    description: null,
    price: 10,
    image_url: null,
    is_available: true,
    display_order: 0,
  };
}

const MOCK_RESERVATIONS: Reservation[] = [
  { id: 1, name: 'Alice', email: 'alice@test.com', phone: null, date: '2027-01-01', time: '18:00', party_size: 2, notes: null, status: 'confirmed', created_at: '2026-12-01T10:00:00Z' },
  { id: 2, name: 'Bob', email: 'bob@test.com', phone: null, date: '2027-01-02', time: '19:00', party_size: 3, notes: null, status: 'pending', created_at: '2026-12-02T10:00:00Z' },
  { id: 3, name: 'Cara', email: 'cara@test.com', phone: null, date: '2027-01-03', time: '20:00', party_size: 4, notes: null, status: 'pending', created_at: '2026-12-03T10:00:00Z' },
  { id: 4, name: 'Dan', email: 'dan@test.com', phone: null, date: '2027-01-04', time: '21:00', party_size: 1, notes: null, status: 'cancelled', created_at: '2026-12-04T10:00:00Z' },
];

const MOCK_CATEGORIES: MenuCategory[] = [
  { id: 1, name: 'Pizza', display_order: 0, is_active: true, items: [menuItem(10, 1), menuItem(11, 1)] },
  { id: 2, name: 'Pasta', display_order: 1, is_active: true, items: [menuItem(20, 2)] },
];

const MOCK_GALLERY: GalleryImage[] = [
  { id: 1, image_url: '/static/uploads/gallery/a.jpg', caption: 'A', display_order: 0, is_active: true },
  { id: 2, image_url: '/static/uploads/gallery/b.jpg', caption: 'B', display_order: 1, is_active: true },
];

function buildApiSpy(): jasmine.SpyObj<ApiService> {
  const spy = jasmine.createSpyObj<ApiService>('ApiService', [
    'getReservations', 'getAllCategories', 'getAllGallery',
  ]);
  spy.getReservations.and.returnValue(of(MOCK_RESERVATIONS));
  spy.getAllCategories.and.returnValue(of(MOCK_CATEGORIES));
  spy.getAllGallery.and.returnValue(of(MOCK_GALLERY));
  return spy;
}

function buildAuthSpy(): jasmine.SpyObj<AuthService> {
  return jasmine.createSpyObj<AuthService>('AuthService', ['logout', 'isLoggedIn', 'getToken']);
}

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;
  let apiSpy: jasmine.SpyObj<ApiService>;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    apiSpy = buildApiSpy();
    authSpy = buildAuthSpy();
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, RouterTestingModule],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: AuthService, useValue: authSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch all aggregations once on init', () => {
    fixture.detectChanges();
    expect(apiSpy.getReservations).toHaveBeenCalledTimes(2);
    expect(apiSpy.getAllCategories).toHaveBeenCalledTimes(1);
    expect(apiSpy.getAllGallery).toHaveBeenCalledTimes(1);
  });

  it('should populate counts and lists from the aggregated API responses', () => {
    fixture.detectChanges();
    expect(component.reservations.length).toBe(4);
    expect(component.totalCategories).toBe(2);
    expect(component.totalMenuItems).toBe(3);
    expect(component.totalGallery).toBe(2);
    expect(component.loading).toBeFalse();
  });

  it('should derive pending, confirmed, and cancelled counts from reservations', () => {
    fixture.detectChanges();
    expect(component.pending).toBe(2);
    expect(component.confirmed).toBe(1);
    expect(component.cancelled).toBe(1);
  });

  it('should return the six most recent reservations sorted by descending id', () => {
    const many: Reservation[] = Array.from({ length: 8 }, (_, i) => ({
      ...MOCK_RESERVATIONS[0],
      id: i + 1,
    }));
    apiSpy.getReservations.and.returnValue(of(many));
    fixture.detectChanges();
    expect(component.recentReservations.length).toBe(6);
    expect(component.recentReservations.map(r => r.id)).toEqual([8, 7, 6, 5, 4, 3]);
  });

  it('should compute barWidth percentages and handle a zero total', () => {
    expect(component.barWidth(1, 4)).toBe(25);
    expect(component.barWidth(1, 3)).toBe(33);
    expect(component.barWidth(5, 5)).toBe(100);
    expect(component.barWidth(1, 0)).toBe(0);
  });

  it('should expose today as an en-AU long date string', () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    };
    expect(component.today).toBe(new Date().toLocaleDateString('en-AU', options));
  });

  it('should render the five stat cards after data loads', () => {
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('.stat-card');
    expect(cards.length).toBe(5);
  });

  it('should render the empty chart state when all API responses are empty', () => {
    apiSpy.getReservations.and.returnValue(of([]));
    apiSpy.getAllCategories.and.returnValue(of([]));
    apiSpy.getAllGallery.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component.loading).toBeFalse();
    expect(component.reservations.length).toBe(0);
    expect(component.totalCategories).toBe(0);
    expect(component.totalMenuItems).toBe(0);
    expect(component.totalGallery).toBe(0);
    const empty = fixture.nativeElement.querySelector('.chart-empty') as HTMLElement;
    expect(empty).not.toBeNull();
    expect(empty.textContent).toContain('No reservations yet');
  });

  it('should stop loading and show an error when an API call errors', () => {
    apiSpy.getReservations.and.returnValue(throwError(() => new Error('network error')));
    fixture.detectChanges();
    expect(component.loading).toBeFalse();
    expect(component.reservations.length).toBe(0);
    expect(component.totalMenuItems).toBe(0);
    expect(component.totalCategories).toBe(0);
    expect(component.totalGallery).toBe(0);
    const error = fixture.nativeElement.querySelector('.dash-error') as HTMLElement;
    expect(error).not.toBeNull();
    expect(error.textContent).toContain('Could not load dashboard data.');
  });

  it('should delegate sign out to AuthService', () => {
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll('.sidebar-footer a') as NodeListOf<HTMLAnchorElement>;
    links[1].click();
    expect(authSpy.logout).toHaveBeenCalledTimes(1);
  });
});
