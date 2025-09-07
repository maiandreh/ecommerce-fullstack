import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Subject, debounceTime, distinctUntilChanged, takeUntil, switchMap} from 'rxjs';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product, ProductPage } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="product-list-container">
      <div class="search-container">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          (input)="onSearchChange()"
          placeholder="Buscar produtos..."
          class="search-input"
          aria-label="Campo de busca de produtos">
      </div>

      <div class="products-grid" *ngIf="products.length > 0">
        <div class="product-card" *ngFor="let product of products">
          <h3>{{ product.name }}</h3>
          <p class="price">R$ {{ product.price | number:'1.2-2' }}</p>
          <p class="stock" [class.out-of-stock]="product.stock === 0">
            Estoque: {{ product.stock }}
          </p>
          <button
            (click)="addToCart(product)"
            [disabled]="product.stock === 0"
            class="add-to-cart-btn"
            [attr.aria-label]="'Adicionar ' + product.name + ' ao carrinho'">
            {{ product.stock === 0 ? 'Sem estoque' : 'Adicionar ao carrinho' }}
          </button>
        </div>
      </div>

      <div class="no-products" *ngIf="products.length === 0 && !loading">
        Nenhum produto encontrado.
      </div>

      <div class="loading" *ngIf="loading">
        Carregando produtos...
      </div>

      <div class="pagination" *ngIf="productPage && productPage.totalPages > 1">
        <button
          (click)="goToPage(productPage.number - 1)"
          [disabled]="productPage.first"
          class="pagination-btn"
          aria-label="Página anterior">
          Anterior
        </button>

        <span class="page-info">
          Página {{ productPage.number + 1 }} de {{ productPage.totalPages }}
        </span>

        <button
          (click)="goToPage(productPage.number + 1)"
          [disabled]="productPage.last"
          class="pagination-btn"
          aria-label="Próxima página">
          Próxima
        </button>
      </div>
    </div>
  `,
  styles: [`
    .product-list-container {
      padding: 20px;
    }

    .search-container {
      margin-bottom: 20px;
    }

    .search-input {
      width: 100%;
      max-width: 400px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .product-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .product-card h3 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .price {
      font-size: 18px;
      font-weight: bold;
      color: #2c5aa0;
      margin: 5px 0;
    }

    .stock {
      margin: 5px 0;
      color: #666;
    }

    .stock.out-of-stock {
      color: #d32f2f;
      font-weight: bold;
    }

    .add-to-cart-btn {
      width: 100%;
      padding: 10px;
      background: #4caf50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .add-to-cart-btn:hover:not(:disabled) {
      background: #45a049;
    }

    .add-to-cart-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
      margin-top: 20px;
    }

    .pagination-btn {
      padding: 8px 16px;
      background: #2c5aa0;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .pagination-btn:hover:not(:disabled) {
      background: #1e3d72;
    }

    .pagination-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .page-info {
      font-weight: bold;
    }

    .loading, .no-products {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  `]
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  productPage: ProductPage | null = null;
  searchTerm: string = '';
  loading: boolean = false;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.productService.getProducts(term, 0, 10)),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (page) => { this.productPage = page; this.products = page.content; this.loading = false; },
      error: (err) => { /* tratamento */ }
    });

  }

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  loadProducts(search?: string, page: number = 0): void {
    this.loading = true;
    this.productService.getProducts(search, page, 10).subscribe({
      next: (productPage) => {
        this.productPage = productPage;
        this.products = productPage.content;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.loading = false;
      }
    });
  }

  goToPage(page: number): void {
    if (this.productPage && page >= 0 && page < this.productPage.totalPages) {
      this.loadProducts(this.searchTerm, page);
    }
  }

  addToCart(product: Product): void {
    if (product.stock > 0) {
      this.cartService.addToCart(product, 1);
    }
  }
}

