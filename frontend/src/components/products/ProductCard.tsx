"use client";

import Image from "next/image";
import { Product } from "@/types/product";
import ProductModal from "./ProductModal";
import { useState } from "react";

export function ProductCard({ product: initialProduct }: { product: Product }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [product, setProduct] = useState(initialProduct);

  // Updated image URL handling with backwards compatibility
  const getImageUrl = (imageName: string) => {
    // If it's already a Base64 string, return as is
    if (imageName.startsWith("data:image")) {
      return imageName;
    }

    // If it's a full URL (from Vercel Blob), return as is
    if (imageName.startsWith("http://") || imageName.startsWith("https://")) {
      return imageName;
    }

    // Handle legacy image paths
    return `http://localhost:3000/${imageName}`;
  };

  // Get the first image or use a placeholder
  const imageSrc =
    product.images && product.images.length > 0
      ? getImageUrl(product.images[0])
      : "/placeholder-image.jpg";

  const handleProductUpdate = (updatedProduct: Product) => {
    // Update the local state with the new product data
    setProduct(updatedProduct);
  };

  return (
    <>
      <div
        className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="aspect-w-3 aspect-h-2 w-full h-48 relative">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="rounded-t-xl"
            quality={75}
          />
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute top-2 right-2">
              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Low Stock
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="mb-2">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
              {product.categoryRelation?.name || "Uncategorized"}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {product.name}
          </h3>

          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">
              ${parseFloat(product.price.toString()).toFixed(2)}
            </span>
            <div className="flex items-center">
              {product.stock > 0 ? (
                <span className="text-sm font-medium text-green-600">
                  {product.stock > 10 ? "In Stock" : `${product.stock} left`}
                </span>
              ) : (
                <span className="text-sm font-medium text-red-600">
                  Out of Stock
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ProductModal
          product={product}
          onClose={() => setIsModalOpen(false)}
          onProductUpdate={handleProductUpdate}
          //onUpdate={(newProduct: Product) => setUpdatedProduct(newProduct)}
        />
      )}
    </>
  );
}
