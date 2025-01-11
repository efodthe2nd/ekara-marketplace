// src/components/products/ProductCard.tsx
'use client';
import Image from 'next/image';
import { Product } from '@/types/product';
import ProductModal from './ProductModal';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Robust image URL handling
  const getImageUrl = (imageName: string) => {
    // If it's already a full URL, return as is
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
      return imageName;
    }

    // Ensure the image starts with a slash
    return imageName.startsWith('/') 
      ? imageName 
      : `/uploads/${imageName}`;
  };

  // Get the first image or use a placeholder
  const imageSrc = product.images && product.images.length > 0 
    ? getImageUrl(product.images[0])
    : '/placeholder-image.jpg';

  return (
    <>
      <div 
        className="border rounded-lg overflow-hidden shadow-lg cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="w-full h-48 relative">
          <Image 
            src={imageSrc}
            alt={product.name}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-gray-600">{product.category}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xl font-bold">${parseFloat(product.price).toFixed(2)}</span>
            <span className="text-sm text-gray-500">
              {product.stock} in stock
            </span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ProductModal 
          product={product} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
}