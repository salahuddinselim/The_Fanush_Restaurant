import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService, API_URL } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function expectRequest(method: string, url: string): void {
    const req = httpMock.expectOne(request => request.url === url && request.method === method);
    expect(req).toBeTruthy();
    req.flush({});
  }

  function expectBodyRequest(method: string, url: string, body: unknown): void {
    const req = httpMock.expectOne(request => request.url === url && request.method === method);
    expect(req).toBeTruthy();
    expect(req.request.body).toEqual(body);
    req.flush({});
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('public GET methods should call the expected endpoints', () => {
    service.getConfig().subscribe();
    service.getHours().subscribe();
    service.getCategories().subscribe();
    service.getGallery().subscribe();

    expectRequest('GET', `${API_URL}/config`);
    expectRequest('GET', `${API_URL}/hours`);
    expectRequest('GET', `${API_URL}/menu/categories`);
    expectRequest('GET', `${API_URL}/gallery`);
  });

  it('admin GET methods should call the expected endpoints', () => {
    service.getAllCategories().subscribe();
    service.getItems().subscribe();
    service.getAllGallery().subscribe();
    service.getReservations().subscribe();

    expectRequest('GET', `${API_URL}/menu/categories/all`);
    expectRequest('GET', `${API_URL}/menu/items`);
    expectRequest('GET', `${API_URL}/gallery/all`);
    expectRequest('GET', `${API_URL}/reservations`);
  });

  it('updateConfig should PUT /config with an items wrapper', () => {
    service.updateConfig([{ key: 'phone', value: '123' }]).subscribe();
    expectBodyRequest('PUT', `${API_URL}/config`, { items: [{ key: 'phone', value: '123' }] });
  });

  it('updateHour should PUT the data to /hours/:id', () => {
    service.updateHour(4, { open_time: '10:00' }).subscribe();
    expectBodyRequest('PUT', `${API_URL}/hours/4`, { open_time: '10:00' });
  });

  it('category mutations should use the correct verbs, URLs and payloads', () => {
    service.createCategory({ name: 'Pizza' }).subscribe();
    service.updateCategory(2, { name: 'Pasta' }).subscribe();
    service.deleteCategory(2).subscribe();

    expectBodyRequest('POST', `${API_URL}/menu/categories`, { name: 'Pizza' });
    expectBodyRequest('PUT', `${API_URL}/menu/categories/2`, { name: 'Pasta' });
    expectRequest('DELETE', `${API_URL}/menu/categories/2`);
  });

  it('menu item mutations should use the correct verbs, URLs and payloads', () => {
    service.createItem({ name: 'Margherita' }).subscribe();
    service.updateItem(5, { price: 16 }).subscribe();
    service.deleteItem(5).subscribe();
    service.removeItemImage(5).subscribe();

    expectBodyRequest('POST', `${API_URL}/menu/items`, { name: 'Margherita' });
    expectBodyRequest('PUT', `${API_URL}/menu/items/5`, { price: 16 });
    expectRequest('DELETE', `${API_URL}/menu/items/5`);
    expectRequest('DELETE', `${API_URL}/menu/items/5/image`);
  });

  it('uploadItemImage should POST the file as FormData', () => {
    const file = new File(['data'], 'dish.png', { type: 'image/png' });
    service.uploadItemImage(7, file).subscribe();

    const req = httpMock.expectOne(`${API_URL}/menu/items/7/image`);
    expect(req.request.method).toBe('POST');
    const body = req.request.body as FormData;
    expect(body instanceof FormData).toBeTrue();
    expect(body.get('file')).toBe(file);
    req.flush({});
  });

  it('uploadGalleryImage should POST FormData with file, caption and display_order', () => {
    const file = new File(['data'], 'hall.jpg', { type: 'image/jpeg' });
    service.uploadGalleryImage(file, 'Dining room', 3).subscribe();

    const req = httpMock.expectOne(`${API_URL}/gallery`);
    expect(req.request.method).toBe('POST');
    const body = req.request.body as FormData;
    expect(body instanceof FormData).toBeTrue();
    expect(body.get('file')).toBe(file);
    expect(body.get('caption')).toBe('Dining room');
    expect(body.get('display_order')).toBe('3');
    req.flush({});
  });

  it('gallery mutations should use the correct verbs, URLs and payloads', () => {
    service.updateGalleryImage(8, { caption: 'Patio' }).subscribe();
    service.deleteGalleryImage(8).subscribe();

    expectBodyRequest('PUT', `${API_URL}/gallery/8`, { caption: 'Patio' });
    expectRequest('DELETE', `${API_URL}/gallery/8`);
  });

  it('reservation methods should use the correct verbs, URLs and payloads', () => {
    service.createReservation({ name: 'Alice' }).subscribe();
    service.updateReservation(9, 'confirmed').subscribe();
    service.deleteReservation(9).subscribe();

    expectBodyRequest('POST', `${API_URL}/reservations`, { name: 'Alice' });
    expectBodyRequest('PUT', `${API_URL}/reservations/9`, { status: 'confirmed' });
    expectRequest('DELETE', `${API_URL}/reservations/9`);
  });

  it('should propagate HTTP errors to subscribers', () => {
    const onError = jasmine.createSpy('onError');
    service.getConfig().subscribe({ error: onError });

    httpMock.expectOne(`${API_URL}/config`).flush('boom', { status: 500, statusText: 'Server Error' });
    expect(onError).toHaveBeenCalled();
    expect(onError.calls.mostRecent().args[0].status).toBe(500);
  });
});
