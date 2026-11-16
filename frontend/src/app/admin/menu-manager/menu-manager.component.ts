import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService, MenuCategory, MenuItem } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-menu-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './menu-manager.component.html',
  styleUrl: './menu-manager.component.scss',
})
export class MenuManagerComponent implements OnInit {
  categories: MenuCategory[] = [];
  newCatName = '';
  newItem: Partial<MenuItem> & { category_id: number } = { category_id: 0, name: '', price: 0, description: '', display_order: 0 };
  editingItem: MenuItem | null = null;
  apiBase = 'http://localhost:8000';

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit() { this.load(); }
  load() { this.api.getAllCategories().subscribe(c => { this.categories = c; if (c.length && !this.newItem.category_id) this.newItem.category_id = c[0].id; }); }

  addCategory() {
    if (!this.newCatName.trim()) return;
    this.api.createCategory({ name: this.newCatName, display_order: this.categories.length + 1 }).subscribe(() => { this.newCatName = ''; this.load(); });
  }

  deleteCategory(id: number) {
    if (!confirm('Delete category and all its items?')) return;
    this.api.deleteCategory(id).subscribe(() => this.load());
  }

  addItem() {
    if (!this.newItem.name || !this.newItem.category_id) return;
    this.api.createItem(this.newItem).subscribe(() => { this.newItem = { category_id: this.categories[0]?.id || 0, name: '', price: 0, description: '', display_order: 0 }; this.load(); });
  }

  startEdit(item: MenuItem) { this.editingItem = { ...item }; }
  cancelEdit() { this.editingItem = null; }

  saveEdit() {
    if (!this.editingItem) return;
    const { id, ...data } = this.editingItem;
    this.api.updateItem(id, data).subscribe(() => { this.editingItem = null; this.load(); });
  }

  deleteItem(id: number) {
    if (!confirm('Delete this item?')) return;
    this.api.deleteItem(id).subscribe(() => this.load());
  }

  uploadImage(itemId: number, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.api.uploadItemImage(itemId, file).subscribe(() => this.load());
  }

  removeImage(itemId: number) {
    if (!confirm('Remove photo from this item?')) return;
    this.api.removeItemImage(itemId).subscribe(() => this.load());
  }
}
