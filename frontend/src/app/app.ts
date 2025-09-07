import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { HeaderComponent } from './components/header/header.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { CartComponent } from './components/cart/cart.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule, 
    RouterOutlet, 
    HttpClientModule,
    HeaderComponent,
    ProductListComponent,
    CartComponent
  ],
  template: `
    <div class="app-container">
      <app-header (cartToggle)="toggleCart()"></app-header>
      
      <main class="main-content">
        <app-product-list></app-product-list>
      </main>
      
      <app-cart #cart></app-cart>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    @media (max-width: 768px) {
      .main-content {
        padding: 10px;
      }
    }
  `]
})
export class App {
  @ViewChild('cart') cartComponent!: CartComponent;

  toggleCart(): void {
    this.cartComponent.toggleCart();
  }
}
