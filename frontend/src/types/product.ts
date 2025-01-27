// src/types/product.ts
export interface Seller {
  id: number;
  companyName: string;
  companyDescription: string;
  website: string;
  rating: number;
  numReviews: number;
}

interface Category {
  id: number;
  name: string;
  level: number;
  parentId: number | null;
  slug: string;
  count: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;  // Keeping as string to match backend
  manufacturer: string;
  images: string[];
  category: string;
  categoryId?: number;
  categoryRelation?: Category;
  compatibility: string;
  dimensions: string;
  weight: string;
  warranty: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
  seller?: {
    id?: number;
    companyName?: string;
  };
}

export interface ProductResponse {
  products: Product[];
  total: number;
  isSearch?: boolean;
}