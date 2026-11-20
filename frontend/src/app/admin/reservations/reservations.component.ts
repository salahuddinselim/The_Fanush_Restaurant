import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService, Reservation } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './reservations.component.html',
})
export class ReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  filter: 'all' | 'pending' | 'confirmed' | 'cancelled' = 'all';

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit() { this.load(); }
  load() { this.api.getReservations().subscribe(r => this.reservations = r); }

  get filtered() {
    if (this.filter === 'all') return this.reservations;
    return this.reservations.filter(r => r.status === this.filter);
  }

  setStatus(id: number, status: string) {
    this.api.updateReservation(id, status).subscribe(() => this.load());
  }

  delete(id: number) {
    if (!confirm('Delete this reservation?')) return;
    this.api.deleteReservation(id).subscribe(() => this.load());
  }
}
