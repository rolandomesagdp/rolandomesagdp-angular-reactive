import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, combineLatest, EMPTY, merge, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, concatMap, filter, map, scan, shareReplay, tap } from 'rxjs/operators';

import { Product } from './product';
import { ProductCategoryService } from '../product-categories/product-category.service'
import { ProductCategory } from '../product-categories/product-category';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';

  private selectedCategorySubject$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  selectedCategoryEvent$: Observable<number> = this.selectedCategorySubject$.asObservable();

  private productEditedSubject$: BehaviorSubject<Product> = new BehaviorSubject<Product>(null);
  productEditedEvent$: Observable<Product> = this.productEditedSubject$.asObservable();

  private productCreatedSubject$: BehaviorSubject<Product> = new BehaviorSubject<Product>(null);
  productCreatedEvent$: Observable<Product> = this.productCreatedSubject$.asObservable();

  private products$: Observable<Product[]> = this.getProducts(0);

  private filteredProducts$: Observable<Product[]> = this.selectedCategoryEvent$.pipe(
    concatMap(categoryId => {
      return this.getProducts(categoryId);
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
    this.productEditedEvent$
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
    this.productCreatedEvent$
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

  constructor(private http: HttpClient, private productCategoryService: ProductCategoryService) { }

  getProducts(categoryId: number): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl)
    .pipe(
      map(products => {
        if(categoryId)
          return products.filter(x => x.categoryId === categoryId);
        else
          return products;
      })
    );
  }
}