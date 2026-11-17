import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { ApiService, Config } from '../../core/services/api.service';
import { ConfigManagerComponent } from './config-manager.component';

function makeConfig(): Config {
  return {
    restaurant_name: 'Test Kitchen',
    tagline: 'Eat well',
    description: 'A family restaurant',
    address: '1 Main Street',
    phone: '+61 400 000 000',
    email: 'hello@test.com',
    location_label: 'Downtown',
    cta_text: 'Book a table',
    hero_image_url: '/static/hero.jpg',
    logo_url: null,
  };
}

function buildApiSpy(): jasmine.SpyObj<ApiService> {
  const spy = jasmine.createSpyObj<ApiService>('ApiService', ['getConfig', 'updateConfig']);
  spy.getConfig.and.returnValue(of(makeConfig()));
  spy.updateConfig.and.returnValue(of({}));
  return spy;
}

describe('ConfigManagerComponent', () => {
  let fixture: ComponentFixture<ConfigManagerComponent>;
  let component: ConfigManagerComponent;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    apiSpy = buildApiSpy();
    await TestBed.configureTestingModule({
      imports: [ConfigManagerComponent, CommonModule, FormsModule, ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: ApiService, useValue: apiSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load config values on init', () => {
    expect(apiSpy.getConfig).toHaveBeenCalledTimes(1);
    expect(component.values['restaurant_name']).toBe('Test Kitchen');
    expect(component.values['phone']).toBe('+61 400 000 000');
  });

  it('should expose all configurable fields with labels', () => {
    expect(component.fields.length).toBe(10);
    expect(component.fields[0]).toEqual({ key: 'restaurant_name', label: 'Restaurant Name' });
    expect(component.fields.map(f => f.key)).toContain('logo_url');
  });

  it('should render one input per config field', () => {
    const inputs = fixture.nativeElement.querySelectorAll('.settings-grid input[type="text"]') as NodeListOf<HTMLInputElement>;
    expect(inputs.length).toBe(10);
    expect(inputs[0].value).toBe('Test Kitchen');
  });

  it('should save every field and coerce missing values to an empty string', () => {
    component.save();
    expect(apiSpy.updateConfig).toHaveBeenCalledTimes(1);
    const items = apiSpy.updateConfig.calls.mostRecent().args[0];
    expect(items.length).toBe(10);
    expect(items).toContain({ key: 'restaurant_name', value: 'Test Kitchen' });
    expect(items).toContain({ key: 'logo_url', value: '' });
  });

  it('should not save before config has loaded', () => {
    const pending = new Subject<Config>();
    apiSpy.getConfig.and.returnValue(pending.asObservable());
    const pendingFixture = TestBed.createComponent(ConfigManagerComponent);
    pendingFixture.detectChanges();

    pendingFixture.componentInstance.save();

    expect(apiSpy.updateConfig).not.toHaveBeenCalled();
  });

  it('should set the saved flag on a successful save', () => {
    expect(component.saved).toBeFalse();
    component.save();
    expect(component.saved).toBeTrue();
  });

  it('should clear the saved flag after 2.5 seconds', fakeAsync(() => {
    component.save();
    expect(component.saved).toBeTrue();
    tick(2500);
    expect(component.saved).toBeFalse();
  }));

  it('should show and then hide the saved message in the UI', fakeAsync(() => {
    const saveButton = fixture.nativeElement.querySelector('.admin-card .btn.gold') as HTMLButtonElement;
    saveButton.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.inline-success')).not.toBeNull();
    tick(2500);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.inline-success')).toBeNull();
  }));

  it('should navigate to login when signing out from the sidebar', () => {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
    const signOut = fixture.nativeElement.querySelector('.sidebar-footer a:last-child') as HTMLAnchorElement;
    signOut.click();
    expect(navigateSpy).toHaveBeenCalledWith(['/admin/login']);
  });
});
