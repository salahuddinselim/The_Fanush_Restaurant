import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { ApiService, GalleryImage } from '../../core/services/api.service';
import { GalleryManagerComponent } from './gallery-manager.component';

function makeImages(): GalleryImage[] {
  return [
    { id: 1, image_url: '/static/uploads/gallery/a.jpg', caption: 'Dining room', display_order: 2, is_active: true },
    { id: 2, image_url: '/static/uploads/gallery/b.jpg', caption: null, display_order: 1, is_active: false },
  ];
}

function buildApiSpy(): jasmine.SpyObj<ApiService> {
  const spy = jasmine.createSpyObj<ApiService>('ApiService', [
    'getAllGallery',
    'uploadGalleryImage',
    'updateGalleryImage',
    'deleteGalleryImage',
  ]);
  spy.getAllGallery.and.returnValue(of(makeImages()));
  spy.uploadGalleryImage.and.returnValue(of(makeImages()[0]));
  spy.updateGalleryImage.and.returnValue(of(makeImages()[0]));
  spy.deleteGalleryImage.and.returnValue(of({}));
  return spy;
}

describe('GalleryManagerComponent', () => {
  let fixture: ComponentFixture<GalleryManagerComponent>;
  let component: GalleryManagerComponent;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    apiSpy = buildApiSpy();
    await TestBed.configureTestingModule({
      imports: [GalleryManagerComponent, CommonModule, FormsModule, ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: ApiService, useValue: apiSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(GalleryManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all gallery images on init without an error', () => {
    expect(apiSpy.getAllGallery).toHaveBeenCalledTimes(1);
    expect(component.images.length).toBe(2);
    expect(component.loadError).toBe('');
  });

  it('should set a load error message when fetching images fails', () => {
    apiSpy.getAllGallery.and.returnValue(throwError(() => new Error('network error')));
    component.load();
    expect(component.loadError).toBe('Could not load images. Please refresh or log in again.');
  });

  it('should render the load error when no images are loaded', () => {
    component.images = [];
    apiSpy.getAllGallery.and.returnValue(throwError(() => new Error('network error')));
    component.load();
    fixture.detectChanges();
    const error = fixture.nativeElement.querySelector('.load-error') as HTMLElement;
    expect(error).not.toBeNull();
    expect(error.textContent).toContain('Could not load images.');
  });

  it('should ignore a file selection with no file', () => {
    component.onFile({ target: { files: [] } } as unknown as Event);
    expect(apiSpy.uploadGalleryImage).not.toHaveBeenCalled();
    expect(component.uploading).toBeFalse();
  });

  it('should upload a selected file with the caption and next display order', () => {
    component.caption = 'Dessert';
    fixture.detectChanges();
    const file = new File(['bytes'], 'cake.jpg', { type: 'image/jpeg' });
    const input = fixture.nativeElement.querySelector('input.file-input') as HTMLInputElement;
    Object.defineProperty(input, 'files', { configurable: true, value: [file] as unknown as FileList });
    input.dispatchEvent(new Event('change'));
    expect(apiSpy.uploadGalleryImage).toHaveBeenCalledWith(file, 'Dessert', 3);
    expect(apiSpy.getAllGallery).toHaveBeenCalledTimes(2);
    expect(component.uploading).toBeFalse();
    expect(component.caption).toBe('');
  });

  it('should use the highest existing display order plus one after a deletion gap', () => {
    component.images = [{ id: 1, image_url: '/static/uploads/gallery/a.jpg', caption: null, display_order: 7, is_active: true }];
    const file = new File(['bytes'], 'cake.jpg', { type: 'image/jpeg' });
    component.onFile({ target: { files: [file] } } as unknown as Event);
    expect(apiSpy.uploadGalleryImage).toHaveBeenCalledWith(file, '', 8);
  });

  it('should stop uploading and keep the caption when the upload fails', () => {
    apiSpy.uploadGalleryImage.and.returnValue(throwError(() => new Error('upload failed')));
    const file = new File(['bytes'], 'cake.jpg', { type: 'image/jpeg' });
    component.caption = 'Dessert';
    component.onFile({ target: { files: [file] } } as unknown as Event);
    expect(component.uploading).toBeFalse();
    expect(component.caption).toBe('Dessert');
    expect(apiSpy.getAllGallery).toHaveBeenCalledTimes(1);
  });

  it('should render the uploading status and disable the file input while uploading', () => {
    apiSpy.uploadGalleryImage.and.returnValue(of(makeImages()[0]));
    const file = new File(['bytes'], 'cake.jpg', { type: 'image/jpeg' });
    component.onFile({ target: { files: [file] } } as unknown as Event);
    component.uploading = true;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input.file-input') as HTMLInputElement;
    expect(input.disabled).toBeTrue();
    expect(fixture.nativeElement.querySelector('.upload-status').textContent).toContain('Uploading');
  });

  it('should toggle image visibility through the API', () => {
    component.toggle(component.images[0]);
    expect(apiSpy.updateGalleryImage).toHaveBeenCalledWith(1, { is_active: false });
    expect(apiSpy.getAllGallery).toHaveBeenCalledTimes(2);
  });

  it('should toggle a hidden image back to visible', () => {
    component.toggle(component.images[1]);
    expect(apiSpy.updateGalleryImage).toHaveBeenCalledWith(2, { is_active: true });
  });

  it('should not delete an image when confirmation is declined', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.delete(1);
    expect(apiSpy.deleteGalleryImage).not.toHaveBeenCalled();
  });

  it('should delete an image after confirmation and reload', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.delete(1);
    expect(apiSpy.deleteGalleryImage).toHaveBeenCalledWith(1);
    expect(apiSpy.getAllGallery).toHaveBeenCalledTimes(2);
  });

  it('should not reorder the first image upward', () => {
    component.moveUp(0);
    expect(apiSpy.updateGalleryImage).not.toHaveBeenCalled();
  });

  it('should not reorder the last image downward', () => {
    component.moveDown(component.images.length - 1);
    expect(apiSpy.updateGalleryImage).not.toHaveBeenCalled();
  });

  it('should renumber images when moving an image up', () => {
    component.moveUp(1);
    expect(apiSpy.updateGalleryImage.calls.argsFor(0)).toEqual([2, { display_order: 1 }]);
    expect(apiSpy.updateGalleryImage.calls.argsFor(1)).toEqual([1, { display_order: 2 }]);
    expect(apiSpy.getAllGallery).toHaveBeenCalledTimes(2);
  });

  it('should renumber images when moving an image down', () => {
    component.moveDown(0);
    expect(apiSpy.updateGalleryImage.calls.argsFor(0)).toEqual([2, { display_order: 1 }]);
    expect(apiSpy.updateGalleryImage.calls.argsFor(1)).toEqual([1, { display_order: 2 }]);
    expect(apiSpy.getAllGallery).toHaveBeenCalledTimes(2);
  });

  it('should create unique display orders when existing orders are duplicated', () => {
    component.images = [
      { id: 1, image_url: '/a.jpg', caption: null, display_order: 1, is_active: true },
      { id: 2, image_url: '/b.jpg', caption: null, display_order: 1, is_active: true },
    ];
    component.moveUp(1);
    expect(apiSpy.updateGalleryImage.calls.argsFor(0)).toEqual([2, { display_order: 1 }]);
    expect(apiSpy.updateGalleryImage.calls.argsFor(1)).toEqual([1, { display_order: 2 }]);
  });

  it('should render inactive styling, visibility labels and order badges', () => {
    const cards = fixture.nativeElement.querySelectorAll('.gal-admin-card') as NodeListOf<HTMLElement>;
    expect(cards.length).toBe(2);
    expect(cards[0].classList.contains('inactive')).toBeFalse();
    expect(cards[1].classList.contains('inactive')).toBeTrue();
    const labels = fixture.nativeElement.querySelectorAll('.gal-actions .btn.ghost') as NodeListOf<HTMLButtonElement>;
    expect(labels[0].textContent?.trim()).toBe('Hide');
    expect(labels[1].textContent?.trim()).toBe('Show');
    const badges = fixture.nativeElement.querySelectorAll('.gal-order-badge') as NodeListOf<HTMLElement>;
    expect(badges[0].textContent?.trim()).toBe('#1');
  });

  it('should disable reorder buttons at the list boundaries', () => {
    const upButtons = fixture.nativeElement.querySelectorAll('.icon-btn[title="Move up"]') as NodeListOf<HTMLButtonElement>;
    const downButtons = fixture.nativeElement.querySelectorAll('.icon-btn[title="Move down"]') as NodeListOf<HTMLButtonElement>;
    expect(upButtons[0].disabled).toBeTrue();
    expect(downButtons[0].disabled).toBeFalse();
    expect(upButtons[1].disabled).toBeFalse();
    expect(downButtons[1].disabled).toBeTrue();
  });

  it('should not prefix absolute image URLs with the API base', () => {
    component.images = [{ id: 1, image_url: 'https://example.com/gallery.jpg', caption: null, display_order: 0, is_active: true }];
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('.gal-thumb') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('https://example.com/gallery.jpg');
  });

  it('should render the empty state when there are no images', () => {
    apiSpy.getAllGallery.and.returnValue(of([]));
    component.load();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.gal-empty')).not.toBeNull();
  });

  it('should navigate to login when signing out from the sidebar', () => {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
    const signOut = fixture.nativeElement.querySelector('.sidebar-footer a:last-child') as HTMLAnchorElement;
    signOut.click();
    expect(navigateSpy).toHaveBeenCalledWith(['/admin/login']);
  });
});
