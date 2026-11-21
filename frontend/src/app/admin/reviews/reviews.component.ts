import { AdminShellComponent } from '@app/shared/admin-shell.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Review } from '../../core/services/api.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [AdminShellComponent, CommonModule],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.scss',
})
export class ReviewsComponent implements OnInit {
  reviews: Review[] = [];
  loading = true;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getReviews().subscribe({
      next: (r) => { this.reviews = r; this.loading = false; },
      error: () => { this.error = 'Could not load reviews.'; this.loading = false; },
    });
  }

  delete(id: number) {
    this.api.deleteReview(id).subscribe({
      next: () => { this.reviews = this.reviews.filter(r => r.id !== id); },
      error: () => alert('Could not delete review.'),
    });
  }

  starsArray(n: number): number[] { return Array(Math.max(0, n)); }

  get avgRating(): number {
    if (!this.reviews.length) return 0;
    return this.reviews.reduce((s, r) => s + r.rating, 0) / this.reviews.length;
  }
}
