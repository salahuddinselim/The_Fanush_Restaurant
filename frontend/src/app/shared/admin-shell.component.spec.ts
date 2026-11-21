import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { ApiService } from '@app/core/services/api.service';
import { AdminShellComponent } from './admin-shell.component';

describe('AdminShellComponent', () => {
  let fixture: ComponentFixture<AdminShellComponent>;
  let component: AdminShellComponent;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj<ApiService>('ApiService', ['getReservations']);
    apiSpy.getReservations.and.returnValue(of([
      { id: 1, status: 'pending' },
      { id: 2, status: 'pending' },
      { id: 3, status: 'confirmed' },
    ] as any));

    await TestBed.configureTestingModule({
      imports: [AdminShellComponent, RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: ApiService, useValue: apiSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show a notification with the pending count on every admin page', () => {
    const notice = fixture.nativeElement.querySelector('.admin-notice') as HTMLElement;
    expect(notice).not.toBeNull();
    expect(notice.textContent).toContain('2 pending reservations');
    expect(notice.querySelector('a[href="/admin/reservations"]')).not.toBeNull();
  });

  it('should show a sidebar badge matching the pending count', () => {
    const badge = fixture.nativeElement.querySelector('.admin-sidebar .badge-count') as HTMLElement | null;
    expect(badge?.textContent?.trim()).toBe('2');
  });

  it('should not show a notice when there are no pending reservations', () => {
    apiSpy.getReservations.and.returnValue(of([{ id: 1, status: 'confirmed' }] as any));
    component.refresh();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.admin-notice')).toBeNull();
    expect(fixture.nativeElement.querySelector('.badge-count')).toBeNull();
  });

  it('should hide the notice when dismissed', () => {
    (fixture.nativeElement.querySelector('.notice-close') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.admin-notice')).toBeNull();
    expect(component.dismissed).toBeTrue();
  });

  it('should tolerate API failures without breaking the page', () => {
    apiSpy.getReservations.and.returnValue(throwError(() => new Error('offline')));
    expect(() => component.refresh()).not.toThrow();
    expect(component.pending).toBe(0);
  });

  it('should expose the projected page content inside the admin main area', () => {
    expect(fixture.nativeElement.querySelector('main.admin-main')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.admin-sidebar').length).toBe(1);
  });
});
