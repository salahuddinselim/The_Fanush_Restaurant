import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '@app/core/services/api.service';
import { AuthService } from '@app/core/services/auth.service';
import { IconComponent } from '@app/shared/icon.component';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './admin-shell.component.html',
})
export class AdminShellComponent implements OnInit, OnDestroy {
  pending = 0;
  dismissed = false;

  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.refresh();
    this.timer = setInterval(() => this.refresh(), 60_000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  refresh(): void {
    const getReservations = (this.api as { getReservations?: () => { subscribe: (o: object) => void } }).getReservations;
    if (typeof getReservations !== 'function') return;
    getReservations.call(this.api).subscribe({
      next: (rows: unknown) => {
        this.pending = Array.isArray(rows)
          ? rows.filter((row: { status?: string }) => row?.status === 'pending').length
          : 0;
      },
      error: () => { this.pending = 0; },
    });
  }

  dismiss(): void {
    this.dismissed = true;
  }
}
