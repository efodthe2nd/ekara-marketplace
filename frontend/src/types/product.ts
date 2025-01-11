// src/types/product.ts
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number | string;
  manufacturer: string;
  images: string[];
  category: string;
  compatibility: string;
  stock: number;
}

export interface ProductResponse {
  products: Product[];
  total: number;
}