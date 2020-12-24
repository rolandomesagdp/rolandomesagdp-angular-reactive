import { BehaviorSubject, combineLatest, EMPTY, merge, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, concatMap, filter, map, scan, shareReplay, tap } from 'rxjs/operators';

import { Product } from './product';
import { ProductService } from './product.service';
import { ProductCategoryService } from '../product-categories/product-category.service'
import { ProductCategory } from '../product-categories/product-category';
import { ProductsListEvnets } from './products-list-events';

export class ProductListViewModel {

  events: ProductsListEvnets = new ProductsListEvnets();

  private filteredProducts$: Observable<Product[]> = this.events.selectedCategoryEvent$.pipe(
    concatMap(categoryId => {
      return this.productService.getProducts(categoryId);
    })
  );

  private categories$: Observable<ProductCategory[]> = this.productCategoryService.getProductCategories().pipe(
    tap(categories => console.log(categories)),
    shareReplay(1)
  );

  private filteredProductsWithCategory$: Observable<Product[]> = combineLatest([
    this.filteredProducts$,
    this.categories$
  ]).pipe(
    map(([filteredProducts, categories]) => {
      return filteredProducts.map(product => {
        const category = categories.find(x => x.id === product.categoryId);
        product.category = category.name;
        return product;
      })
    })
  );

  private productsWithEdit$: Observable<Product[]> = combineLatest([
    this.filteredProductsWithCategory$,
    this.events.productEditedEvent$
  ]).pipe(
    map(([filteredProducts, editedProduct]) => {
      if(editedProduct){
        let productIndex = filteredProducts.findIndex(x => x.id === editedProduct.id);
        filteredProducts[productIndex] = editedProduct;
        return filteredProducts;
      }
      else {
        return filteredProducts;
      }
    })
  );

  private productsCrud$: Observable<Product[]> = combineLatest([
    this.productsWithEdit$,
    this.events.productCreatedEvent$
  ]).pipe(
    map(([products, newProduct]) => {
      return newProduct ? [...products, newProduct] : products;
    })
  )

  vm$ = combineLatest(
    this.productsCrud$,
    this.categories$
  ).pipe(
    map(([products, categories]) => {
      return {
        products,
        categories
      }
    })
  )

  constructor(private productService: ProductService, private productCategoryService: ProductCategoryService) { }
}