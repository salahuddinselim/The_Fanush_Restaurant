import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService, Config } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-config-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './config-manager.component.html',
})
export class ConfigManagerComponent implements OnInit {
  fields = [
    { key: 'restaurant_name', label: 'Restaurant Name' },
    { key: 'tagline', label: 'Tagline' },
    { key: 'description', label: 'Description' },
    { key: 'address', label: 'Address' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'location_label', label: 'Location Label' },
    { key: 'cta_text', label: 'CTA Button Text' },
    { key: 'hero_image_url', label: 'Hero Image URL' },
    { key: 'logo_url', label: 'Logo URL' },
  ];
  values: Config = {};
  saved = false;
  loading = true;
  loadError = '';

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit() {
    this.api.getConfig().subscribe({
      next: c => {
        this.values = c;
        this.loading = false;
      },
      error: () => {
        this.loadError = 'Could not load site settings. Please refresh.';
        this.loading = false;
      },
    });
  }

  save() {
    if (this.loading) return;
    const items = this.fields.map(f => ({ key: f.key, value: this.values[f.key] ?? '' }));
    this.api.updateConfig(items).subscribe(() => {
      this.saved = true;
      setTimeout(() => this.saved = false, 2500);
    });
  }
}
