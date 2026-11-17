import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ApiService, MenuCategory, MenuItem } from '../../core/services/api.service';
import { MenuManagerComponent } from './menu-manager.component';

function makeCategories(): MenuCategory[] {
  return [
    {
      id: 1,
      name: 'Pizza',
      display_order: 1,
      is_active: true,
      items: [
        { id: 10, category_id: 1, name: 'Margherita', description: 'Classic tomato', price: 15.5, image_url: '/uploads/pizza.png', is_available: true, display_order: 0 },
        { id: 11, category_id: 1, name: 'Quattro', description: null, price: 18, image_url: null, is_available: true, display_order: 1 },
      ],
    },
    { id: 2, name: 'Pasta', display_order: 2, is_active: true, items: [] },
  ];
}

function buildApiSpy(): jasmine.SpyObj<ApiService> {
  const spy = jasmine.createSpyObj<ApiService>('ApiService', [
    'getAllCategories',
    'createCategory',
    'deleteCategory',
    'createItem',
    'updateItem',
    'deleteItem',
    'uploadItemImage',
    'removeItemImage',
  ]);
  spy.getAllCategories.and.returnValue(of(makeCategories()));
  spy.createCategory.and.returnValue(of(makeCategories()[0]));
  spy.deleteCategory.and.returnValue(of({}));
  spy.createItem.and.returnValue(of(makeCategories()[0].items[0]));
  spy.updateItem.and.returnValue(of(makeCategories()[0].items[0]));
  spy.deleteItem.and.returnValue(of({}));
  spy.uploadItemImage.and.returnValue(of({}));
  spy.removeItemImage.and.returnValue(of({}));
  return spy;
}

describe('MenuManagerComponent', () => {
  let fixture: ComponentFixture<MenuManagerComponent>;
  let component: MenuManagerComponent;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    apiSpy = buildApiSpy();
    await TestBed.configureTestingModule({
      imports: [MenuManagerComponent, CommonModule, FormsModule, ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: ApiService, useValue: apiSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all categories on init and default the new item category to the first', () => {
    expect(apiSpy.getAllCategories).toHaveBeenCalledTimes(1);
    expect(component.categories.length).toBe(2);
    expect(component.newItem.category_id).toBe(1);
  });

  it('should leave the new item category unset when no categories exist', () => {
    apiSpy.getAllCategories.and.returnValue(of([]));
    const emptyFixture = TestBed.createComponent(MenuManagerComponent);
    emptyFixture.detectChanges();
    expect(emptyFixture.componentInstance.categories).toEqual([]);
    expect(emptyFixture.componentInstance.newItem.category_id).toBe(0);
  });

  it('should render category chips and per-category item counts', () => {
    const chips = fixture.nativeElement.querySelectorAll('.cat-chip') as NodeListOf<HTMLElement>;
    expect(chips.length).toBe(2);
    expect(chips[0].textContent).toContain('Pizza');
    const counts = fixture.nativeElement.querySelectorAll('.item-count') as NodeListOf<HTMLElement>;
    expect(counts[0].textContent?.trim()).toBe('2 items');
    expect(counts[1].textContent?.trim()).toBe('0 items');
  });

  it('should not create a category when the name is blank', () => {
    component.newCatName = '   ';
    component.addCategory();
    expect(apiSpy.createCategory).not.toHaveBeenCalled();
  });

  it('should create a trimmed category, clear the input and reload', () => {
    component.newCatName = '  Burgers  ';
    component.addCategory();
    expect(apiSpy.createCategory).toHaveBeenCalledWith({ name: 'Burgers', display_order: 3 });
    expect(component.newCatName).toBe('');
    expect(apiSpy.getAllCategories).toHaveBeenCalledTimes(2);
  });

  it('should not delete a category when confirmation is declined', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deleteCategory(2);
    expect(apiSpy.deleteCategory).not.toHaveBeenCalled();
  });

  it('should delete a category after confirmation and reload', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteCategory(2);
    expect(apiSpy.deleteCategory).toHaveBeenCalledWith(2);
    expect(apiSpy.getAllCategories).toHaveBeenCalledTimes(2);
  });

  it('should reset the selected category when it is deleted', () => {
    component.newItem.category_id = 2;
    apiSpy.getAllCategories.and.returnValue(of(makeCategories().slice(0, 1)));
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteCategory(2);
    expect(component.newItem.category_id).toBe(1);
  });

  it('should not add an item without a name', () => {
    component.newItem.name = '';
    component.addItem();
    expect(apiSpy.createItem).not.toHaveBeenCalled();
  });

  it('should not add an item with a whitespace-only name', () => {
    component.newItem.name = '   ';
    component.addItem();
    expect(apiSpy.createItem).not.toHaveBeenCalled();
  });

  it('should not add an item without a category', () => {
    component.newItem.category_id = 0;
    component.newItem.name = 'Gnocchi';
    component.addItem();
    expect(apiSpy.createItem).not.toHaveBeenCalled();
  });

  it('should add a trimmed item, reset the draft and reload', () => {
    const draft: Partial<MenuItem> & { category_id: number } = {
      category_id: 2,
      name: '  Gnocchi  ',
      price: 17.5,
      description: 'Potato dumplings',
      display_order: 4,
    };
    component.newItem = draft;
    component.addItem();
    expect(apiSpy.createItem).toHaveBeenCalledWith(jasmine.objectContaining({ name: 'Gnocchi' }));
    expect(component.newItem).toEqual({ category_id: 1, name: '', price: 0, description: '', display_order: 0 });
    expect(apiSpy.getAllCategories).toHaveBeenCalledTimes(2);
  });

  it('should clone the item when editing starts', () => {
    const item = component.categories[0].items[0];
    component.startEdit(item);
    expect(component.editingItem).toEqual(item);
    expect(component.editingItem).not.toBe(item);
  });

  it('should cancel editing', () => {
    component.startEdit(component.categories[0].items[0]);
    component.cancelEdit();
    expect(component.editingItem).toBeNull();
  });

  it('should not save when no item is being edited', () => {
    component.saveEdit();
    expect(apiSpy.updateItem).not.toHaveBeenCalled();
  });

  it('should update the item without sending its id and reload', () => {
    component.startEdit(component.categories[0].items[0]);
    component.editingItem!.name = 'Updated Margherita';
    component.saveEdit();
    expect(apiSpy.updateItem).toHaveBeenCalledWith(10, jasmine.objectContaining({ name: 'Updated Margherita' }));
    const payload = apiSpy.updateItem.calls.mostRecent().args[1] as Record<string, unknown>;
    expect(payload['id']).toBeUndefined();
    expect(component.editingItem).toBeNull();
    expect(apiSpy.getAllCategories).toHaveBeenCalledTimes(2);
  });

  it('should delete an item only after confirmation', () => {
    const confirmSpy = spyOn(window, 'confirm').and.returnValue(false);
    component.deleteItem(10);
    expect(apiSpy.deleteItem).not.toHaveBeenCalled();

    confirmSpy.and.returnValue(true);
    component.deleteItem(10);
    expect(apiSpy.deleteItem).toHaveBeenCalledWith(10);
    expect(apiSpy.getAllCategories).toHaveBeenCalledTimes(2);
  });

  it('should ignore an image upload event with no file', () => {
    component.uploadImage(10, { target: { files: [] } } as unknown as Event);
    expect(apiSpy.uploadItemImage).not.toHaveBeenCalled();
  });

  it('should upload the selected file from the input change event', () => {
    const file = new File(['bytes'], 'pizza.png', { type: 'image/png' });
    const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { configurable: true, value: [file] as unknown as FileList });
    input.dispatchEvent(new Event('change'));
    expect(apiSpy.uploadItemImage).toHaveBeenCalledWith(10, file);
    expect(apiSpy.getAllCategories).toHaveBeenCalledTimes(2);
  });

  it('should remove an image only after confirmation', () => {
    const confirmSpy = spyOn(window, 'confirm').and.returnValue(false);
    component.removeImage(10);
    expect(apiSpy.removeItemImage).not.toHaveBeenCalled();

    confirmSpy.and.returnValue(true);
    component.removeImage(10);
    expect(apiSpy.removeItemImage).toHaveBeenCalledWith(10);
    expect(apiSpy.getAllCategories).toHaveBeenCalledTimes(2);
  });

  it('should not prefix absolute image URLs with the API base', () => {
    const categories = makeCategories();
    categories[0].items[0].image_url = 'https://example.com/dish.png';
    apiSpy.getAllCategories.and.returnValue(of(categories));
    component.load();
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('.item-thumb') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('https://example.com/dish.png');
  });

  it('should show edit controls only for the item being edited', () => {
    expect(fixture.nativeElement.querySelectorAll('.edit-row').length).toBe(0);
    component.startEdit(component.categories[0].items[0]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.edit-row').length).toBe(1);
    const cancelButton = fixture.nativeElement.querySelector('.edit-row .btn.ghost') as HTMLButtonElement;
    cancelButton.click();
    expect(component.editingItem).toBeNull();
  });

  it('should navigate to login when signing out from the sidebar', () => {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
    const signOut = fixture.nativeElement.querySelector('.sidebar-footer a:last-child') as HTMLAnchorElement;
    signOut.click();
    expect(navigateSpy).toHaveBeenCalledWith(['/admin/login']);
  });
});
