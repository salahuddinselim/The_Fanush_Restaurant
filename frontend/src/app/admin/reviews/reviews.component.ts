import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'; // reviews
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService, Review } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.scss',
})
export class ReviewsComponent implements OnInit {
  reviews: Review[] = [];
  loading = true;
  error = '';

  constructor(public auth: AuthService, private api: ApiService) {}

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
