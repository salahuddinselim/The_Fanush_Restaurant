import { ChangeDetectionStrategy, Component, Input, numberAttribute } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="width"
      [attr.height]="height"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <use [attr.href]="'#i-' + iconName"></use>
    </svg>
  `,
  styles: [':host { display: inline-flex; align-items: center; justify-content: center; line-height: 0; flex-shrink: 0; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  @Input() name = '';
  @Input({ transform: numberAttribute }) width = 20;
  @Input({ transform: numberAttribute }) height = 20;

  get iconName(): string {
    const value = this.name.replace(/^lucide:/, '').trim();
    return /^[a-z0-9-]+$/i.test(value) ? value : 'dots';
  }
}
