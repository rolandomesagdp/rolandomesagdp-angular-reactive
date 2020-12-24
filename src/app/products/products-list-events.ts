import { BehaviorSubject, Observable } from 'rxjs';

import { Product } from './product';

export class ProductsListEvnets {
  private selectedCategorySubject$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  selectedCategoryEvent$: Observable<number> = this.selectedCategorySubject$.asObservable();

  private productEditedSubject$: BehaviorSubject<Product> = new BehaviorSubject<Product>(null);
  productEditedEvent$: Observable<Product> = this.productEditedSubject$.asObservable();

  private productCreatedSubject$: BehaviorSubject<Product> = new BehaviorSubject<Product>(null);
  productCreatedEvent$: Observable<Product> = this.productCreatedSubject$.asObservable();

  onProductCreated(product: Product): void {
    this.productCreatedSubject$.next(product);
  }

  onProductEdited(product: Product): void {
    product.productName = `${product.productName} edited`;
    product.productCode = `${product.productCode} edited`;
    this.productEditedSubject$.next(product);
  }

  onSelectedCategory(categoryId: number): void {
    this.selectedCategorySubject$.next(categoryId);
  }
}