export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  active: boolean;
}

export interface ProductPage {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

