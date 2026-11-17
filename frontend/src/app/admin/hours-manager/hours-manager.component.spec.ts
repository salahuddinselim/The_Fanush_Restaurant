import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, throwError } from 'rxjs';
import { ApiService, BusinessHour } from '../../core/services/api.service';
import { HoursManagerComponent } from './hours-manager.component';

function makeHours(): BusinessHour[] {
  return [
    { id: 1, day_of_week: 0, open_time: '09:00', close_time: '21:00', is_closed: false },
    { id: 2, day_of_week: 6, open_time: null, close_time: null, is_closed: true },
  ];
}

function buildApiSpy(): jasmine.SpyObj<ApiService> {
  const spy = jasmine.createSpyObj<ApiService>('ApiService', ['getHours', 'updateHour']);
  spy.getHours.and.returnValue(of(makeHours()));
  spy.updateHour.and.returnValue(of(makeHours()[0]));
  return spy;
}

describe('HoursManagerComponent', () => {
  let fixture: ComponentFixture<HoursManagerComponent>;
  let component: HoursManagerComponent;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    apiSpy = buildApiSpy();
    await TestBed.configureTestingModule({
      imports: [HoursManagerComponent, CommonModule, FormsModule, ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: ApiService, useValue: apiSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(HoursManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load business hours on init', () => {
    expect(apiSpy.getHours).toHaveBeenCalledTimes(1);
    expect(component.hours.length).toBe(2);
    expect(component.saving).toBe(-1);
  });

  it('should expose all seven weekdays', () => {
    expect(component.days).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
  });

  it('should map a business hour to its day name', () => {
    expect(component.dayName(component.hours[0])).toBe('Monday');
    expect(component.dayName(component.hours[1])).toBe('Sunday');
  });

  it('should save an hour and clear the saving index on success', () => {
    component.save(component.hours[0], 0);
    expect(apiSpy.updateHour).toHaveBeenCalledWith(1, { open_time: '09:00', close_time: '21:00', is_closed: false });
    expect(component.saving).toBe(-1);
  });

  it('should clear the saving index when saving fails', () => {
    apiSpy.updateHour.and.returnValue(throwError(() => new Error('network error')));
    component.save(component.hours[0], 1);
    expect(component.saving).toBe(-1);
  });

  it('should show the saving state while the request is pending', () => {
    const pending = new Subject<BusinessHour>();
    apiSpy.updateHour.and.returnValue(pending.asObservable());
    component.save(component.hours[0], 0);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.data-table button.btn.gold') as HTMLButtonElement;
    expect(component.saving).toBe(0);
    expect(button.disabled).toBeTrue();
    expect(button.textContent).toContain('Saving');
    pending.next(component.hours[0]);
    expect(component.saving).toBe(-1);
  });

  it('should disable time inputs for a closed day', () => {
    const inputs = fixture.nativeElement.querySelectorAll('.time-input') as NodeListOf<HTMLInputElement>;
    expect(inputs.length).toBe(4);
    expect(inputs[0].disabled).toBeFalse();
    expect(inputs[1].disabled).toBeFalse();
    expect(inputs[2].disabled).toBeTrue();
    expect(inputs[3].disabled).toBeTrue();
  });

  it('should save the updated closed state after the toggle changes', () => {
    const checkbox = fixture.nativeElement.querySelector('.toggle-input') as HTMLInputElement;
    checkbox.click();
    fixture.detectChanges();
    expect(component.hours[0].is_closed).toBeTrue();
    const saveButton = fixture.nativeElement.querySelector('.data-table button.btn.gold') as HTMLButtonElement;
    saveButton.click();
    expect(apiSpy.updateHour).toHaveBeenCalledWith(1, { open_time: '09:00', close_time: '21:00', is_closed: true });
  });

  it('should navigate to login when signing out from the sidebar', () => {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
    const signOut = fixture.nativeElement.querySelector('.sidebar-footer a:last-child') as HTMLAnchorElement;
    signOut.click();
    expect(navigateSpy).toHaveBeenCalledWith(['/admin/login']);
  });
});
