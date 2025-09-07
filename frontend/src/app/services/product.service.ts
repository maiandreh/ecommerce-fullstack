import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductPage } from '../models/product.model';
import { environment } from '../../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiBaseUrl}/api/v1/products`;

  constructor(private http: HttpClient) { }

  getProducts(search?: string, page: number = 0, size: number = 10): Observable<ProductPage> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<ProductPage>(this.apiUrl, { params });
  }
}

