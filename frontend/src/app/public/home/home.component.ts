import { Component, OnInit, AfterViewInit, OnDestroy, inject, HostListener, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_URL, ApiService, Config, MenuCategory, MenuItem, GalleryImage, BusinessHour, Review } from '../../core/services/api.service';
import { MENU_IMAGES, DEFAULT_MENU_IMAGE } from './menu-images';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);
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
  bookingReference = '';
  reviews: Review[] = [];
  reviewSubmitted = false;
  reviewError = '';
  reviewSubmitting = false;
  year = new Date().getFullYear();
  readonly minDate = new Date().toISOString().split('T')[0];
  navScrolled = false;
  searchQuery = '';
  searchSuggestions: string[] = [];
  showSuggestions = false;
  selectedMenuItem: MenuItem | null = null;
  selectedGalleryImage: GalleryImage | null = null;
  lightboxIndex = 0;
  menuImageLoaded: Record<number, boolean> = {};

  readonly partySizes = [1, 2, 3, 4, 5, 6, 7, 8];
  readonly timeSlots = [
    '11:30', '12:00', '12:30', '13:00', '13:30',
    '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
  ];

  private readonly MENU_IMAGES = MENU_IMAGES;
  private readonly DEFAULT_MENU_IMAGE = DEFAULT_MENU_IMAGE;

  readonly HERO_FALLBACK = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1920&q=85';
  readonly ABOUT_IMGS = [
    'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=600&q=80',
  ];

  readonly DEFAULT_GALLERY: GalleryImage[] = [
    { id: 101, image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', caption: 'Cozy Dining Room & Candlelit Tables', is_active: true, display_order: 1 },
    { id: 102, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', caption: 'Handcrafted Pizza in Wood-Fired Oven', is_active: true, display_order: 2 },
    { id: 103, image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80', caption: 'Fresh Daily Pasta & Braised Ragù', is_active: true, display_order: 3 },
    { id: 104, image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80', caption: 'Selected Italian & Australian Cellar Wines', is_active: true, display_order: 4 },
    { id: 105, image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', caption: 'Chargrilled Steaks & Cutlets', is_active: true, display_order: 5 },
    { id: 106, image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80', caption: 'Housemade Tiramisu & Fresh Espresso', is_active: true, display_order: 6 },
  ];

  readonly DEFAULT_REVIEWS: Review[] = [
    { id: 201, name: 'Marco Bellini', rating: 5, comment: 'Authentic handmade pasta just like in Emilia-Romagna. The beef ragù is slow-cooked for 6 hours — unbelievable flavour!', created_at: '2026-11-10T12:00:00Z' },
    { id: 202, name: 'Sarah Jenkins', rating: 5, comment: 'Our Friday family tradition. Crispy pizza crust, generous pasta bowls, and the staff treats you like family.', created_at: '2026-11-14T18:30:00Z' },
    { id: 203, name: 'David & Michelle Tan', rating: 5, comment: 'Fair prices, generous portions, and the house tiramisu is an absolute masterpiece. Best Italian in Gosnells!', created_at: '2026-11-18T19:15:00Z' },
  ];

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    date: ['', Validators.required],
    time: ['', Validators.required],
    party_size: [2, [Validators.required, Validators.min(1)]],
    notes: [''],
  });

  reviewForm = this.fb.group({
    name: ['', Validators.required],
    rating: [5],
    comment: [''],
  });

  ngOnInit() {
    const homeRequest = typeof this.api.getPageHome === 'function'
      ? this.api.getPageHome()
      : forkJoin({
          config: this.api.getConfig().pipe(catchError(() => of({} as Config))),
          categories: this.api.getCategories().pipe(catchError(() => of([] as MenuCategory[]))),
          gallery: this.api.getGallery().pipe(catchError(() => of([] as GalleryImage[]))),
          hours: this.api.getHours().pipe(catchError(() => of([] as BusinessHour[]))),
          reviews: of([] as Review[]),
        });

    homeRequest.pipe(
      catchError(() =>
        forkJoin({
          config: this.api.getConfig().pipe(catchError(() => of({} as Config))),
          categories: this.api.getCategories().pipe(catchError(() => of([] as MenuCategory[]))),
          gallery: this.api.getGallery().pipe(catchError(() => of([] as GalleryImage[]))),
          hours: this.api.getHours().pipe(catchError(() => of([] as BusinessHour[]))),
          reviews: this.api.getReviews().pipe(catchError(() => of([] as Review[]))),
        })
      )
    ).subscribe((data: any) => {
      const config    = data.config    ?? {};
      const categories = data.categories ?? [];
      const gallery   = data.gallery   ?? [];
      const hours     = data.hours     ?? [];
      const reviews   = data.reviews   ?? [];

      this.config = config;
      this.categories = categories.length ? categories : [];
      if (this.categories.length) this.activeCatId = this.categories[0].id;
      this.gallery = gallery.length ? gallery : this.DEFAULT_GALLERY;
      this.hours = hours;
      this.reviews = reviews.length ? reviews : this.DEFAULT_REVIEWS;
      // 250ms gives Angular two CD cycles to render *ngFor items into DOM.
      setTimeout(() => {
        this.setupCatObserver();
        document.querySelectorAll('.reveal:not(.revealed), .reveal-left:not(.revealed), .reveal-right:not(.revealed), .reveal-scale:not(.revealed)')
          .forEach(el => this.observer?.observe(el));
        // Fix cached-image race: if the browser already loaded an image before
        // the (load) event listener was attached, the event never fires.
        document.querySelectorAll<HTMLImageElement>('.card-img-wrap img').forEach(img => {
          if (img.complete && img.naturalWidth > 0) {
            const id = Number((img.closest('[data-item-id]') as HTMLElement)?.dataset['itemId']);
            if (id) this.menuImageLoaded[id] = true;
          }
        });
      }, 250);
    });
  }

  private scrollHandler = () => { this.navScrolled = window.scrollY > 60; };

  ngAfterViewInit() {
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    this.observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          this.observer?.unobserve(e.target);
        }
      }),
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
  get parkingInfo() { return this.config['parking_info'] || ''; }

  get directionsUrl() {
    const dest = encodeURIComponent(this.address);
    return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
  }

  get mapEmbedUrl(): SafeResourceUrl {
    // OpenStreetMap embed — no API key needed, works reliably
    // Coordinates for 2310 Albany Hwy, Gosnells WA 6110
    const lat = -32.0781, lon = 115.9942;
    const bbox = `${lon - 0.008},${lat - 0.006},${lon + 0.008},${lat + 0.006}`;
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  dayName(h: BusinessHour) { return DAYS[h.day_of_week]; }

  isToday(h: BusinessHour): boolean {
    const day = (new Date().getDay() + 6) % 7; // Monday = 0
    return h.day_of_week === day;
  }

  get openStatus(): { isOpen: boolean; label: string; detail: string } {
    if (!this.hours.length) return { isOpen: true, label: 'Open Today', detail: 'Serving fresh lunch & dinner' };
    const now = new Date();
    const day = (now.getDay() + 6) % 7;
    const todayHour = this.hours.find(h => h.day_of_week === day);
    if (!todayHour || todayHour.is_closed || !todayHour.open_time || !todayHour.close_time) {
      return { isOpen: false, label: 'Closed Today', detail: 'Reopens tomorrow' };
    }
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = todayHour.open_time.split(':').map(Number);
    const [closeH, closeM] = todayHour.close_time.split(':').map(Number);
    const openMins = openH * 60 + openM;
    const closeMins = closeH * 60 + closeM;

    if (currentMins >= openMins && currentMins < closeMins) {
      return { isOpen: true, label: 'Open Now', detail: `Kitchen open until ${todayHour.close_time}` };
    } else if (currentMins < openMins) {
      return { isOpen: false, label: 'Opening Today', detail: `Doors open at ${todayHour.open_time}` };
    } else {
      return { isOpen: false, label: 'Closed for the night', detail: 'See you tomorrow' };
    }
  }

  get displayGallery(): GalleryImage[] {
    const active = this.gallery.filter(g => g.is_active);
    return active.length ? active : this.DEFAULT_GALLERY;
  }

  get displayReviews(): Review[] {
    return this.reviews.length ? this.reviews : this.DEFAULT_REVIEWS;
  }

  get averageRating(): number {
    const revs = this.displayReviews;
    if (!revs.length) return 5.0;
    const sum = revs.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / revs.length) * 10) / 10;
  }

  ratingCount(star: number): number {
    return this.displayReviews.filter(r => r.rating === star).length;
  }

  ratingPercent(star: number): number {
    const total = this.displayReviews.length;
    if (!total) return 0;
    return Math.round((this.ratingCount(star) / total) * 100);
  }

  getItemTags(item: MenuItem): { label: string; icon: string; cssClass: string }[] {
    const tags: { label: string; icon: string; cssClass: string }[] = [];
    const n = item.name.toLowerCase();
    const d = (item.description || '').toLowerCase();
    if (n.includes('margherita') || n.includes('arrabbiata') || d.includes('tomato') || d.includes('basil')) {
      tags.push({ label: 'Vegetarian', icon: 'lucide:leaf', cssClass: 'badge-veg' });
    }
    if (n.includes('arrabbiata') || n.includes('pepperoni') || d.includes('chilli') || d.includes('spicy')) {
      tags.push({ label: 'Spicy', icon: 'lucide:flame', cssClass: 'badge-spicy' });
    }
    if (n.includes('bolognese') || n.includes('parmigiana') || n.includes('carbonara')) {
      tags.push({ label: "Chef's Special", icon: 'lucide:award', cssClass: 'badge-chef' });
    }
    if (n.includes('wine')) {
      tags.push({ label: 'Cellar Pick', icon: 'lucide:wine', cssClass: 'badge-wine' });
    }
    return tags;
  }

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.mobileMenuOpen = false;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollToCat(cat: MenuCategory) {
    this.activeCatId = cat.id;
    document.getElementById('cat-' + cat.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      const btn = document.querySelector(`.cat-scroll-track button.active`) as HTMLElement;
      btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 50);
  }

  getCategoryIcon(categoryName: string): string {
    const key = categoryName.toLowerCase();
    if (key.includes('pizza'))  return 'lucide:pizza';
    if (key.includes('pasta'))  return 'lucide:utensils-crossed';
    if (key.includes('burger')) return 'lucide:sandwich';
    if (key.includes('salad'))  return 'lucide:salad';
    if (key.includes('drink') || key.includes('juice') || key.includes('smoothie')) return 'lucide:glass-water';
    if (key.includes('coffee')) return 'lucide:coffee';
    if (key.includes('dessert') || key.includes('cake')) return 'lucide:cake';
    if (key.includes('chicken') || key.includes('grill') || key.includes('bbq') || key.includes('steak')) return 'lucide:flame';
    return 'lucide:utensils';
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

  resolveImageUrl(url: string): string {
    if (/^https?:\/\//i.test(url) || url.startsWith('//') || url.startsWith('data:')) return url;
    return url.startsWith('/') ? `${API_URL}${url}` : `${API_URL}/${url}`;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.selectedMenuItem) this.closeMenuItem();
    if (this.selectedGalleryImage) this.closeLightbox();
  }

  openMenuItem(item: MenuItem) {
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

  openLightbox(img: GalleryImage, index: number) {
    this.selectedGalleryImage = img;
    this.lightboxIndex = index;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.selectedGalleryImage = null;
    document.body.style.overflow = '';
  }

  prevLightbox() {
    const list = this.displayGallery;
    this.lightboxIndex = (this.lightboxIndex - 1 + list.length) % list.length;
    this.selectedGalleryImage = list[this.lightboxIndex];
  }

  nextLightbox() {
    const list = this.displayGallery;
    this.lightboxIndex = (this.lightboxIndex + 1) % list.length;
    this.selectedGalleryImage = list[this.lightboxIndex];
  }

  setPartySize(size: number) {
    this.form.patchValue({ party_size: size });
  }

  setTimeSlot(time: string) {
    this.form.patchValue({ time });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.submitError = '';
    this.api.createReservation(this.form.value).subscribe({
      next: () => {
        this.submitted = true;
        this.submitting = false;
        this.bookingReference = 'FAN-' + Math.floor(1000 + Math.random() * 9000);
      },
      error: () => {
        this.submitError = 'Something went wrong. Please call us directly on ' + this.phone;
        this.submitting = false;
      },
    });
  }

  setRating(n: number) { this.reviewForm.patchValue({ rating: n }); }

  starsArray(n: number): number[] { return Array(Math.max(0, n)); }

  submitReview() {
    const { name, rating, comment } = this.reviewForm.value;
    if (!name || !rating) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    this.reviewSubmitting = true;
    this.reviewError = '';
    this.api.createReview({ name: name!, rating: rating!, comment: comment || undefined }).subscribe({
      next: (r) => {
        this.reviews = [r, ...this.reviews];
        this.reviewSubmitted = true;
        this.reviewSubmitting = false;
      },
      error: () => {
        this.reviewError = 'Could not post review. Please try again.';
        this.reviewSubmitting = false;
      },
    });
  }
}
