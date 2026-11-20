import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService, Reservation } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  reservations: Reservation[] = [];
  totalMenuItems = 0;
  totalCategories = 0;
  totalGallery = 0;
  loading = true;
  loadError = '';

  constructor(public auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    forkJoin({
      reservations: this.api.getReservations(),
      categories: this.api.getAllCategories(),
      gallery: this.api.getAllGallery(),
    }).subscribe({
      next: ({ reservations, categories, gallery }) => {
        this.reservations = reservations;
        this.totalCategories = categories.length;
        this.totalMenuItems = categories.reduce((s, c) => s + (c.items?.length || 0), 0);
        this.totalGallery = gallery.length;
        this.loadError = '';
        this.loading = false;
      },
      error: () => {
        this.loadError = 'Could not load dashboard data. Please refresh.';
        this.loading = false;
      },
    });
  }

  get pending() { return this.reservations.filter(r => r.status === 'pending').length; }
  get confirmed() { return this.reservations.filter(r => r.status === 'confirmed').length; }
  get cancelled() { return this.reservations.filter(r => r.status === 'cancelled').length; }
  get recentReservations() { return [...this.reservations].sort((a, b) => b.id - a.id).slice(0, 6); }

  barWidth(n: number, total: number) {
    return total === 0 ? 0 : Math.round((n / total) * 100);
  }

  get today() {
    return new Date().toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}
