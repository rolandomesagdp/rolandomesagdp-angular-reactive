import { Component, OnInit } from '@angular/core';

import { ProductCategory } from '../product-categories/product-category';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { Product } from './product';
import { ProductListViewModel } from './products-list-view-model'
import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';
  viewModel: ProductListViewModel = new ProductListViewModel(this.productService, this.productCategoryService);

  constructor(public productService: ProductService, private productCategoryService: ProductCategoryService) { }

  onCategorySelected(categoryId: string): void {
    this.viewModel.events.onSelectedCategory(+categoryId);
  }

  onEdit(product: Product): void {
    this.viewModel.events.onProductEdited(product);
  }

  onAdd(): void {
    const product: Product = {
      id: 11,
      productName: "Screwdriver",
      productCode: 'TBX-0050',
      description: 'Some Description',
      price: 11.55,
      categoryId: 3,
      category: "Toolbox",
      quantityInStock: 6,
      supplierIds: [7, 8]
    };

    this.viewModel.events.onProductCreated(product);
  }
}
