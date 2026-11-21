import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent } from './icon.component';

describe('IconComponent', () => {
  let fixture: ComponentFixture<IconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [IconComponent] }).compileComponents();
    fixture = TestBed.createComponent(IconComponent);
  });

  it('should resolve a plain icon name to a local sprite symbol', () => {
    fixture.componentInstance.name = 'flame';
    fixture.detectChanges();
    expect(fixture.componentInstance.iconName).toBe('flame');
    expect(fixture.nativeElement.querySelector('use').getAttribute('href')).toBe('#i-flame');
  });

  it('should strip the legacy lucide prefix', () => {
    fixture.componentInstance.name = 'lucide:calendar-check';
    fixture.detectChanges();
    expect(fixture.componentInstance.iconName).toBe('calendar-check');
    expect(fixture.nativeElement.querySelector('use').getAttribute('href')).toBe('#i-calendar-check');
  });

  it('should fall back safely for unknown or unsafe names', () => {
    fixture.componentInstance.name = 'javascript:alert(1)';
    fixture.detectChanges();
    expect(fixture.componentInstance.iconName).toBe('dots');
    expect(fixture.nativeElement.querySelector('use').getAttribute('href')).toBe('#i-dots');
  });

  it('should apply the requested size to the svg', () => {
    fixture.componentInstance.name = 'star';
    fixture.componentInstance.width = 24;
    fixture.componentInstance.height = 24;
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('24');
    expect(svg.getAttribute('height')).toBe('24');
  });
});
