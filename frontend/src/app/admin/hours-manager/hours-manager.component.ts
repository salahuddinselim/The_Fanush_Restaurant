import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService, BusinessHour } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

@Component({
  selector: 'app-hours-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './hours-manager.component.html',
  styleUrl: './hours-manager.component.scss',
})
export class HoursManagerComponent implements OnInit {
  hours: BusinessHour[] = [];
  days = DAYS;
  saving = -1;

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit() { this.api.getHours().subscribe(h => this.hours = h); }

  dayName(h: BusinessHour) { return DAYS[h.day_of_week]; }

  save(h: BusinessHour, i: number) {
    this.saving = i;
    this.api.updateHour(h.id, { open_time: h.open_time, close_time: h.close_time, is_closed: h.is_closed })
      .subscribe({ next: () => this.saving = -1, error: () => this.saving = -1 });
  }
}
