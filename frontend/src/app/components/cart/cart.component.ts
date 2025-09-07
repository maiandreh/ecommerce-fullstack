import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { Cart, CartItem } from '../../models/cart.model';
import { OrderRequest, OrderResponse, StockError } from '../../models/order.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cart-container" [class.cart-open]="isOpen">
      <div class="cart-header">
        <h3>Carrinho de Compras</h3>
        <button (click)="toggleCart()" class="close-btn" aria-label="Fechar carrinho">×</button>
      </div>

      <div class="cart-content">
        <div *ngIf="cart.items.length === 0" class="empty-cart">
          Seu carrinho está vazio
        </div>

        <div *ngIf="cart.items.length > 0">
          <div class="cart-item" *ngFor="let item of cart.items">
            <div class="item-info">
              <h4>{{ item.product.name }}</h4>
              <p class="item-price">R$ {{ item.product.price | number:'1.2-2' }}</p>
            </div>

            <div class="quantity-controls">
              <button
                (click)="decreaseQuantity(item)"
                class="quantity-btn"
                [attr.aria-label]="'Diminuir quantidade de ' + item.product.name">
                -
              </button>
              <span class="quantity">{{ item.quantity }}</span>
              <button
                (click)="increaseQuantity(item)"
                class="quantity-btn"
                [attr.aria-label]="'Aumentar quantidade de ' + item.product.name">
                +
              </button>
            </div>

            <div class="item-total">
              R$ {{ (item.product.price * item.quantity) | number:'1.2-2' }}
            </div>

            <button
              (click)="removeItem(item)"
              class="remove-btn"
              [attr.aria-label]="'Remover ' + item.product.name + ' do carrinho'">
              🗑️
            </button>
          </div>

          <div class="cart-total">
            <strong>Total: R$ {{ cart.total | number:'1.2-2' }}</strong>
          </div>

          <button
            (click)="checkout()"
            class="checkout-btn"
            [disabled]="isProcessingOrder"
            aria-label="Finalizar pedido">
            {{ isProcessingOrder ? 'Processando...' : 'Finalizar Pedido' }}
          </button>
        </div>
      </div>

      <!-- Mensagens de sucesso/erro -->
      <div *ngIf="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div *ngIf="stockErrors.length > 0" class="stock-errors">
        <h4>Itens indisponíveis:</h4>
        <ul>
          <li *ngFor="let error of stockErrors">
            Produto ID {{ error.productId }}: apenas {{ error.available }} disponível(is)
          </li>
        </ul>
      </div>
    </div>

    <div class="cart-overlay" [class.overlay-visible]="isOpen" (click)="closeCart()"></div>
  `,
  styles: [`
    .cart-container {
      position: fixed;
      top: 0;
      right: -400px;
      width: 400px;
      height: 100vh;
      background: white;
      box-shadow: -2px 0 10px rgba(0,0,0,0.1);
      transition: right 0.3s ease;
      z-index: 1000;
      display: flex;
      flex-direction: column;
    }

    .cart-container.cart-open {
      right: 0;
    }

    .cart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #eee;
      background: #f8f9fa;
    }

    .cart-header h3 {
      margin: 0;
      color: #333;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
    }

    .cart-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }

    .empty-cart {
      text-align: center;
      color: #666;
      padding: 40px 20px;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 1fr auto auto auto;
      gap: 10px;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #eee;
    }

    .item-info h4 {
      margin: 0 0 5px 0;
      font-size: 14px;
      color: #333;
    }

    .item-price {
      margin: 0;
      color: #666;
      font-size: 12px;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .quantity-btn {
      width: 30px;
      height: 30px;
      border: 1px solid #ddd;
      background: white;
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .quantity-btn:hover {
      background: #f5f5f5;
    }

    .quantity {
      min-width: 20px;
      text-align: center;
      font-weight: bold;
    }

    .item-total {
      font-weight: bold;
      color: #2c5aa0;
      font-size: 14px;
    }

    .remove-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 5px;
    }

    .remove-btn:hover {
      background: #f5f5f5;
      border-radius: 4px;
    }

    .cart-total {
      margin: 20px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 4px;
      text-align: center;
      font-size: 18px;
    }

    .checkout-btn {
      width: 100%;
      padding: 15px;
      background: #4caf50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
    }

    .checkout-btn:hover:not(:disabled) {
      background: #45a049;
    }

    .checkout-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .cart-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.5);
      z-index: 999;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .cart-overlay.overlay-visible {
      opacity: 1;
      visibility: visible;
    }

    .success-message {
      background: #d4edda;
      color: #155724;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
      border: 1px solid #c3e6cb;
    }

    .error-message {
      background: #f8d7da;
      color: #721c24;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
      border: 1px solid #f5c6cb;
    }

    .stock-errors {
      background: #fff3cd;
      color: #856404;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
      border: 1px solid #ffeaa7;
    }

    .stock-errors h4 {
      margin: 0 0 10px 0;
    }

    .stock-errors ul {
      margin: 0;
      padding-left: 20px;
    }

    @media (max-width: 480px) {
      .cart-container {
        width: 100vw;
        right: -100vw;
      }
    }
  `]
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart = { items: [], total: 0 };
  isOpen: boolean = false;
  isProcessingOrder: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  stockErrors: StockError[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(cart => {
      this.cart = cart;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleCart(): void {
    this.isOpen = !this.isOpen;
    this.clearMessages();
  }

  closeCart(): void {
    this.isOpen = false;
    this.clearMessages();
  }

  increaseQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.product.id, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.product.id, item.quantity - 1);
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.product.id);
  }

  checkout(): void {
    if (this.cart.items.length === 0) {
      return;
    }

    this.isProcessingOrder = true;
    this.clearMessages();

    const orderRequest: OrderRequest = {
      items: this.cart.items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    this.orderService.createOrder(orderRequest).subscribe({
      next: (response: OrderResponse) => {
        this.successMessage = `Pedido #${response.id} criado com sucesso!`;
        this.cartService.clearCart();
        this.isProcessingOrder = false;

        setTimeout(() => {
          this.closeCart();
        }, 3000);
      },
      error: (error) => {
        this.isProcessingOrder = false;

        if (error.status === 409) {
          this.stockErrors = error.error?.details ?? [];
          this.errorMessage = error.error?.message || 'Estoque insuficiente';
        } else {
          this.errorMessage = 'Erro ao processar pedido. Tente novamente.';
        }
      }
    });
  }


  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.stockErrors = [];
  }
}

