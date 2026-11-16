import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
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

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() { this.api.getAllGallery().subscribe(imgs => this.images = imgs); }

  onFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading = true;
    this.api.uploadGalleryImage(file, this.caption, this.images.length)
      .subscribe({ next: () => { this.load(); this.uploading = false; this.caption = ''; }, error: () => this.uploading = false });
  }

  toggle(img: GalleryImage) {
    this.api.updateGalleryImage(img.id, { is_active: !img.is_active }).subscribe(() => this.load());
  }

  delete(id: number) {
    if (!confirm('Delete this image?')) return;
    this.api.deleteGalleryImage(id).subscribe(() => this.load());
  }
}
