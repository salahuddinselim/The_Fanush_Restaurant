import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export const API_URL = 'http://localhost:8000';

export interface Config { [key: string]: string | null }
export interface BusinessHour { id: number; day_of_week: number; open_time: string | null; close_time: string | null; is_closed: boolean }
export interface MenuCategory { id: number; name: string; display_order: number; is_active: boolean; items: MenuItem[] }
export interface MenuItem { id: number; category_id: number; name: string; description: string | null; price: number; image_url: string | null; is_available: boolean; display_order: number }
export interface GalleryImage { id: number; image_url: string; caption: string | null; display_order: number; is_active: boolean }
export interface Reservation { id: number; name: string; email: string; phone: string | null; date: string; time: string; party_size: number; notes: string | null; status: string; created_at: string }

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // Config
  getConfig(): Observable<Config> { return this.http.get<Config>(`${API_URL}/config`); }
  updateConfig(items: { key: string; value: string }[]): Observable<any> { return this.http.put(`${API_URL}/config`, { items }); }

  // Hours
  getHours(): Observable<BusinessHour[]> { return this.http.get<BusinessHour[]>(`${API_URL}/hours`); }
  updateHour(id: number, data: Partial<BusinessHour>): Observable<BusinessHour> { return this.http.put<BusinessHour>(`${API_URL}/hours/${id}`, data); }

  // Menu
  getCategories(): Observable<MenuCategory[]> { return this.http.get<MenuCategory[]>(`${API_URL}/menu/categories`); }
  getAllCategories(): Observable<MenuCategory[]> { return this.http.get<MenuCategory[]>(`${API_URL}/menu/categories/all`); }
  createCategory(data: any): Observable<MenuCategory> { return this.http.post<MenuCategory>(`${API_URL}/menu/categories`, data); }
  updateCategory(id: number, data: any): Observable<MenuCategory> { return this.http.put<MenuCategory>(`${API_URL}/menu/categories/${id}`, data); }
  deleteCategory(id: number): Observable<any> { return this.http.delete(`${API_URL}/menu/categories/${id}`); }
  getItems(): Observable<MenuItem[]> { return this.http.get<MenuItem[]>(`${API_URL}/menu/items`); }
  createItem(data: any): Observable<MenuItem> { return this.http.post<MenuItem>(`${API_URL}/menu/items`, data); }
  updateItem(id: number, data: any): Observable<MenuItem> { return this.http.put<MenuItem>(`${API_URL}/menu/items/${id}`, data); }
  deleteItem(id: number): Observable<any> { return this.http.delete(`${API_URL}/menu/items/${id}`); }
  uploadItemImage(id: number, file: File): Observable<any> {
    const fd = new FormData(); fd.append('file', file);
    return this.http.post(`${API_URL}/menu/items/${id}/image`, fd);
  }

  // Gallery
  getGallery(): Observable<GalleryImage[]> { return this.http.get<GalleryImage[]>(`${API_URL}/gallery`); }
  getAllGallery(): Observable<GalleryImage[]> { return this.http.get<GalleryImage[]>(`${API_URL}/gallery/all`); }
  uploadGalleryImage(file: File, caption: string, order: number): Observable<GalleryImage> {
    const fd = new FormData(); fd.append('file', file); fd.append('caption', caption); fd.append('display_order', String(order));
    return this.http.post<GalleryImage>(`${API_URL}/gallery`, fd);
  }
  updateGalleryImage(id: number, data: any): Observable<GalleryImage> { return this.http.put<GalleryImage>(`${API_URL}/gallery/${id}`, data); }
  deleteGalleryImage(id: number): Observable<any> { return this.http.delete(`${API_URL}/gallery/${id}`); }

  // Reservations
  createReservation(data: any): Observable<Reservation> { return this.http.post<Reservation>(`${API_URL}/reservations`, data); }
  getReservations(): Observable<Reservation[]> { return this.http.get<Reservation[]>(`${API_URL}/reservations`); }
  updateReservation(id: number, status: string): Observable<Reservation> { return this.http.put<Reservation>(`${API_URL}/reservations/${id}`, { status }); }
  deleteReservation(id: number): Observable<any> { return this.http.delete(`${API_URL}/reservations/${id}`); }
}
