import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cart, CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>({ items: [], total: 0 });
  public cart$ = this.cartSubject.asObservable();

  constructor() { }

  addToCart(product: Product, quantity: number = 1): void {
    const currentCart = this.cartSubject.value;
    const existingItemIndex = currentCart.items.findIndex(item => item.product.id === product.id);

    if (existingItemIndex >= 0) {
      currentCart.items[existingItemIndex].quantity += quantity;
    } else {
      currentCart.items.push({ product, quantity });
    }

    this.updateCartTotal(currentCart);
    this.cartSubject.next(currentCart);
  }

  removeFromCart(productId: number): void {
    const currentCart = this.cartSubject.value;
    currentCart.items = currentCart.items.filter(item => item.product.id !== productId);
    this.updateCartTotal(currentCart);
    this.cartSubject.next(currentCart);
  }

  updateQuantity(productId: number, quantity: number): void {
    const currentCart = this.cartSubject.value;
    const itemIndex = currentCart.items.findIndex(item => item.product.id === productId);

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        currentCart.items[itemIndex].quantity = quantity;
        this.updateCartTotal(currentCart);
        this.cartSubject.next(currentCart);
      }
    }
  }

  clearCart(): void {
    this.cartSubject.next({ items: [], total: 0 });
  }

  private updateCartTotal(cart: Cart): void {
    cart.total = cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }

  getCartItemsCount(): number {
    return this.cartSubject.value.items.reduce((count, item) => count + item.quantity, 0);
  }
}

