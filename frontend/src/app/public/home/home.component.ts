import { Component, OnInit, AfterViewInit, OnDestroy, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { API_URL, ApiService, Config, MenuCategory, MenuItem, GalleryImage, BusinessHour } from '../../core/services/api.service';
import { MENU_IMAGES, DEFAULT_MENU_IMAGE } from './menu-images';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private observer?: IntersectionObserver;
  private catObserver?: IntersectionObserver;

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
  navScrolled = false;
  searchQuery = '';
  searchSuggestions: string[] = [];
  showSuggestions = false;
  selectedMenuItem: MenuCategory['items'][number] | null = null;
  menuImageLoaded: Record<number, boolean> = {};

  private readonly MENU_IMAGES = MENU_IMAGES;
  private readonly DEFAULT_MENU_IMAGE = DEFAULT_MENU_IMAGE;

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
    forkJoin({
      config: this.api.getConfig(),
      categories: this.api.getCategories(),
      gallery: this.api.getGallery(),
      hours: this.api.getHours(),
    }).subscribe(({ config, categories, gallery, hours }) => {
      this.config = config;
      this.categories = categories;
      if (categories.length) this.activeCatId = categories[0].id;
      this.gallery = gallery;
      this.hours = hours;
      setTimeout(() => this.setupCatObserver(), 100);
    });
  }

  private scrollHandler = () => { this.navScrolled = window.scrollY > 60; };

  ngAfterViewInit() {
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    this.observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); this.observer?.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
      .forEach(el => this.observer!.observe(el));
  }

  private scheduleCatObserverRefresh() {
    setTimeout(() => this.setupCatObserver(), 0);
  }

  private setupCatObserver() {
    this.catObserver?.disconnect();
    this.catObserver = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const id = parseInt(e.target.id.replace('cat-', ''), 10);
            if (!isNaN(id)) this.activeCatId = id;
          }
        });
      },
      { threshold: 0.25, rootMargin: '-80px 0px -60% 0px' }
    );
    this.categories.forEach(cat => {
      const el = document.getElementById('cat-' + cat.id);
      if (el) this.catObserver!.observe(el);
    });
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.scrollHandler);
    this.observer?.disconnect();
    this.catObserver?.disconnect();
  }

  get allItems() {
    return this.categories.flatMap(c => c.items);
  }

  get filteredCategories() {
    if (!this.searchQuery.trim()) return this.categories;
    const q = this.searchQuery.toLowerCase();
    return this.categories.map(c => ({
      ...c, items: c.items.filter(i => i.name.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q))
    })).filter(c => c.items.length > 0);
  }

  onSearchInput(value: string) {
    this.searchQuery = value;
    if (value.trim().length > 1) {
      this.searchSuggestions = this.allItems
        .filter(i => i.name.toLowerCase().includes(value.toLowerCase()))
        .map(i => i.name).slice(0, 6);
      this.showSuggestions = this.searchSuggestions.length > 0;
    } else {
      this.searchSuggestions = [];
      this.showSuggestions = false;
    }
    this.scheduleCatObserverRefresh();
  }

  selectSuggestion(name: string) {
    this.searchQuery = name;
    this.showSuggestions = false;
    this.scrollTo('menu');
    this.scheduleCatObserverRefresh();
  }

  clearSearch() {
    this.searchQuery = '';
    this.showSuggestions = false;
    this.searchSuggestions = [];
    this.scheduleCatObserverRefresh();
  }

  hideSearchSuggestions() {
    setTimeout(() => { this.showSuggestions = false; }, 200);
  }

  get logoUrl() {
    const url = this.config['logo_url'];
    return url ? this.resolveImageUrl(url) : '';
  }
  get name() { return this.config['restaurant_name'] || 'The Fanus Restaurant'; }
  get tagline() { return this.config['tagline'] || 'Honest Italian cooking, made fresh every day.'; }
  get description() { return this.config['description'] || 'Pasta, pizza, burgers and grill classics served in the heart of Gosnells.'; }
  get address() { return this.config['address'] || '2310 Albany Hwy, Gosnells WA 6110'; }
  get phone() { return this.config['phone'] || '+61 411 074 381'; }
  get email() { return this.config['email'] || ''; }
  get heroImg() {
    const url = this.config['hero_image_url'];
    return url ? this.resolveImageUrl(url) : this.HERO_FALLBACK;
  }
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
    // Scroll the active tab button into view in the sticky bar
    setTimeout(() => {
      const btn = document.querySelector(`.cat-scroll-track button.active`) as HTMLElement;
      btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 50);
  }

  getCategoryIcon(categoryName: string) {
    const key = categoryName.toLowerCase();
    if (key.includes('pizza')) return '🍕';
    if (key.includes('pasta')) return '🍝';
    if (key.includes('burger')) return '🍔';
    if (key.includes('salad')) return '🥗';
    if (key.includes('drink') || key.includes('juice') || key.includes('smoothie')) return '🥤';
    if (key.includes('coffee')) return '☕';
    if (key.includes('dessert') || key.includes('cake')) return '🍰';
    if (key.includes('breakfast')) return '🍳';
    if (key.includes('chicken')) return '🍗';
    return '🍽️';
  }

  onMenuImageLoad(itemId: number) {
    this.menuImageLoaded[itemId] = true;
  }

  onMenuImageError(itemId: number) {
    this.menuImageLoaded[itemId] = false;
  }

  get menuItemCount() {
    return this.categories.reduce((total, cat) => total + cat.items.length, 0);
  }

  menuItemImage(item: MenuItem, categoryName = ''): string {
    if (item.image_url) return this.resolveImageUrl(item.image_url);

    const name = item.name.toLowerCase();
    const category = categoryName.toLowerCase();
    for (const key of Object.keys(this.MENU_IMAGES)) {
      if (name.includes(key) || category.includes(key)) return this.MENU_IMAGES[key];
    }
    return this.DEFAULT_MENU_IMAGE;
  }

  private resolveImageUrl(url: string): string {
    if (/^https?:\/\//i.test(url) || url.startsWith('//') || url.startsWith('data:')) return url;
    return url.startsWith('/') ? `${API_URL}${url}` : `${API_URL}/${url}`;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.selectedMenuItem) this.closeMenuItem();
  }

  openMenuItem(item: MenuCategory['items'][number]) {
    this.selectedMenuItem = item;
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      (document.querySelector('.item-modal-close') as HTMLElement)?.focus();
    }, 50);
  }

  closeMenuItem() {
    this.selectedMenuItem = null;
    document.body.style.overflow = '';
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
