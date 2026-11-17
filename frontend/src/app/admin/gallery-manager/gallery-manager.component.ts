import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService, GalleryImage } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-gallery-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './gallery-manager.component.html',
  styleUrl: './gallery-manager.component.scss',
})
export class GalleryManagerComponent implements OnInit {
  images: GalleryImage[] = [];
  caption = '';
  uploading = false;
  apiBase = 'http://localhost:8000';
  loadError = '';

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loadError = '';
    this.api.getAllGallery().subscribe({
      next: imgs => this.images = imgs,
      error: err => this.loadError = 'Could not load images. Please refresh or log in again.',
    });
  }

  resolveImageUrl(url: string | null): string {
    if (!url) return '';
    if (/^(https?:)?\/\//i.test(url)) return url;
    return this.apiBase + (url.startsWith('/') ? '' : '/') + url;
  }

  onFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const nextOrder = this.images.reduce((max, img) => Math.max(max, img.display_order || 0), 0) + 1;
    this.uploading = true;
    this.api.uploadGalleryImage(file, this.caption, nextOrder)
      .subscribe({ next: () => { this.load(); this.uploading = false; this.caption = ''; }, error: () => this.uploading = false });
  }

  toggle(img: GalleryImage) {
    this.api.updateGalleryImage(img.id, { is_active: !img.is_active }).subscribe(() => this.load());
  }

  delete(id: number) {
    if (!confirm('Delete this image? This cannot be undone.')) return;
    this.api.deleteGalleryImage(id).subscribe(() => this.load());
  }

  moveUp(i: number) {
    this.move(i, i - 1);
  }

  moveDown(i: number) {
    this.move(i, i + 1);
  }

  private move(from: number, to: number) {
    if (from === to || from < 0 || from >= this.images.length || to < 0 || to >= this.images.length) return;
    const reordered = [...this.images];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    const start = Math.min(from, to);
    const end = Math.max(from, to);
    const updates = reordered.slice(start, end + 1).map((img, index) =>
      this.api.updateGalleryImage(img.id, { display_order: start + index + 1 })
    );
    forkJoin(updates).subscribe({
      next: () => this.load(),
      error: () => this.loadError = 'Could not reorder images. Please refresh.',
    });
  }
}
