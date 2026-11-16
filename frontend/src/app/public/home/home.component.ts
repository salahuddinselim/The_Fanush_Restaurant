import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService, Config, MenuCategory, GalleryImage, BusinessHour } from '../../core/services/api.service';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  config: Config = {};
  categories: MenuCategory[] = [];
  gallery: GalleryImage[] = [];
  hours: BusinessHour[] = [];
  activeCatId = 0;
  mobileMenuOpen = false;
  submitted = false;
  submitError = '';
  submitting = false;
  year = new Date().getFullYear();

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    date: ['', Validators.required],
    time: ['', Validators.required],
    party_size: [2, [Validators.required, Validators.min(1)]],
    notes: [''],
  });

  readonly HERO_FALLBACK = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1920&q=85';
  readonly ABOUT_IMGS = [
    'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=600&q=80',
  ];

  ngOnInit() {
    this.api.getConfig().subscribe(c => this.config = c);
    this.api.getCategories().subscribe(c => {
      this.categories = c;
      if (c.length) this.activeCatId = c[0].id;
    });
    this.api.getGallery().subscribe(g => this.gallery = g);
    this.api.getHours().subscribe(h => this.hours = h);
  }

  get logoUrl() { return this.config['logo_url'] || ''; }
  get name() { return this.config['restaurant_name'] || 'The Fanus Restaurant'; }
  get tagline() { return this.config['tagline'] || 'Honest Italian cooking, made fresh every day.'; }
  get description() { return this.config['description'] || 'Pasta, pizza, burgers and grill classics served in the heart of Gosnells.'; }
  get address() { return this.config['address'] || '2310 Albany Hwy, Gosnells WA 6110'; }
  get phone() { return this.config['phone'] || '+61 411 074 381'; }
  get email() { return this.config['email'] || ''; }
  get heroImg() { return this.config['hero_image_url'] || this.HERO_FALLBACK; }
  get locationLabel() { return this.config['location_label'] || 'Gosnells · Western Australia'; }
  get ctaText() { return this.config['cta_text'] || 'Call to Order'; }

  dayName(h: BusinessHour) { return DAYS[h.day_of_week]; }

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.mobileMenuOpen = false;
  }

  scrollToCat(cat: MenuCategory) {
    this.activeCatId = cat.id;
    document.getElementById('cat-' + cat.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.submitError = '';
    this.api.createReservation(this.form.value).subscribe({
      next: () => { this.submitted = true; this.submitting = false; },
      error: () => { this.submitError = 'Something went wrong. Please call us directly.'; this.submitting = false; },
    });
  }
}
