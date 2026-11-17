import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ApiService, Reservation } from '../../core/services/api.service';
import { ReservationsComponent } from './reservations.component';

function makeReservations(): Reservation[] {
  return [
    { id: 1, name: 'Alice', email: 'alice@test.com', phone: '0400 000 001', date: '2027-01-01', time: '19:00', party_size: 2, notes: null, status: 'pending', created_at: '2026-11-01T10:00:00Z' },
    { id: 2, name: 'Bob', email: 'bob@test.com', phone: null, date: '2027-01-02', time: '20:00', party_size: 4, notes: 'Window seat', status: 'confirmed', created_at: '2026-11-02T10:00:00Z' },
    { id: 3, name: 'Cara', email: 'cara@test.com', phone: '0400 000 003', date: '2027-01-03', time: '18:30', party_size: 1, notes: null, status: 'cancelled', created_at: '2026-11-03T10:00:00Z' },
  ];
}

function buildApiSpy(): jasmine.SpyObj<ApiService> {
  const spy = jasmine.createSpyObj<ApiService>('ApiService', [
    'getReservations',
    'updateReservation',
    'deleteReservation',
  ]);
  spy.getReservations.and.returnValue(of(makeReservations()));
  spy.updateReservation.and.returnValue(of(makeReservations()[0]));
  spy.deleteReservation.and.returnValue(of({}));
  return spy;
}

describe('ReservationsComponent', () => {
  let fixture: ComponentFixture<ReservationsComponent>;
  let component: ReservationsComponent;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    apiSpy = buildApiSpy();
    await TestBed.configureTestingModule({
      imports: [ReservationsComponent, CommonModule, FormsModule, ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: ApiService, useValue: apiSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load reservations on init', () => {
    expect(apiSpy.getReservations).toHaveBeenCalledTimes(1);
    expect(component.reservations.length).toBe(3);
  });

  it('should return every reservation when the filter is all', () => {
    component.filter = 'all';
    expect(component.filtered.length).toBe(3);
  });

  it('should filter reservations by pending status', () => {
    component.filter = 'pending';
    expect(component.filtered.map(r => r.id)).toEqual([1]);
  });

  it('should filter reservations by confirmed status', () => {
    component.filter = 'confirmed';
    expect(component.filtered.map(r => r.id)).toEqual([2]);
  });

  it('should filter reservations by cancelled status', () => {
    component.filter = 'cancelled';
    expect(component.filtered.map(r => r.id)).toEqual([3]);
  });

  it('should update a reservation status and reload', () => {
    component.setStatus(1, 'confirmed');
    expect(apiSpy.updateReservation).toHaveBeenCalledWith(1, 'confirmed');
    expect(apiSpy.getReservations).toHaveBeenCalledTimes(2);
  });

  it('should not delete a reservation when confirmation is declined', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.delete(1);
    expect(apiSpy.deleteReservation).not.toHaveBeenCalled();
  });

  it('should delete a reservation after confirmation and reload', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.delete(1);
    expect(apiSpy.deleteReservation).toHaveBeenCalledWith(1);
    expect(apiSpy.getReservations).toHaveBeenCalledTimes(2);
  });

  it('should render one row per reservation on initial load', () => {
    const rows = fixture.nativeElement.querySelectorAll('.data-table tbody tr') as NodeListOf<HTMLElement>;
    expect(rows.length).toBe(3);
    expect(rows[0].textContent).toContain('Alice');
  });

  it('should apply a filter when a status pill is clicked', () => {
    const pendingPill = fixture.nativeElement.querySelector('.res-pill.pending') as HTMLElement;
    pendingPill.click();
    fixture.detectChanges();
    expect(component.filter).toBe('pending');
    expect(pendingPill.classList.contains('active')).toBeTrue();
    expect(fixture.nativeElement.querySelectorAll('.data-table tbody tr').length).toBe(1);
  });

  it('should render the empty row when no reservations match the filter', () => {
    component.filter = 'all';
    component.reservations = [];
    fixture.detectChanges();
    const emptyRow = fixture.nativeElement.querySelector('.data-table tbody .empty-row') as HTMLElement;
    expect(emptyRow.textContent).toContain('No reservations found.');
  });

  it('should call setStatus from the Confirm action button', () => {
    const confirmButton = fixture.nativeElement.querySelector('.data-table tbody tr .btn.gold') as HTMLButtonElement;
    confirmButton.click();
    expect(apiSpy.updateReservation).toHaveBeenCalledWith(1, 'confirmed');
  });

  it('should call delete from the Delete action button after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const deleteButton = fixture.nativeElement.querySelector('.data-table tbody tr .btn.danger') as HTMLButtonElement;
    deleteButton.click();
    expect(apiSpy.deleteReservation).toHaveBeenCalledWith(1);
  });

  it('should navigate to login when signing out from the sidebar', () => {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
    const signOut = fixture.nativeElement.querySelector('.sidebar-footer a:last-child') as HTMLAnchorElement;
    signOut.click();
    expect(navigateSpy).toHaveBeenCalledWith(['/admin/login']);
  });
});
