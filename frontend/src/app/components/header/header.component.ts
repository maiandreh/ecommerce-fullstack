import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-content">
        <h1 class="logo">E-Commerce</h1>
        
        <button 
          (click)="openCart()" 
          class="cart-button"
          aria-label="Abrir carrinho de compras">
          🛒 Carrinho ({{ cartItemsCount }})
        </button>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: #2c5aa0;
      color: white;
      padding: 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }

    .cart-button {
      background: rgba(255,255,255,0.2);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s ease;
    }

    .cart-button:hover {
      background: rgba(255,255,255,0.3);
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 10px 15px;
      }

      .logo {
        font-size: 20px;
      }

      .cart-button {
        padding: 8px 12px;
        font-size: 12px;
      }
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() cartToggle = new EventEmitter<void>();
  
  cartItemsCount: number = 0;
  private destroy$ = new Subject<void>();

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.cart$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(cart => {
      this.cartItemsCount = cart.items.reduce((count, item) => count + item.quantity, 0);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openCart(): void {
    this.cartToggle.emit();
  }
}

