"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Product } from "@/types/product";
import Image from "next/image";
import SellPartModal from "@/components/products/CreatePartModal";
import {
  X,
  Pencil,
  Package,
  Truck,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onUpdate: (newProduct: Product) => void;

}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { user } = useAuth();
  const router = useRouter();
  const isProductOwner = user?.id === product.seller?.user?.id;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);

  const getImageUrl = (imageName: string) => {
    if (imageName.startsWith("data:image")) {
      return imageName;
    }
    if (imageName.startsWith("http://") || imageName.startsWith("https://")) {
      return imageName;
    }
    return imageName.startsWith("/") ? imageName : `/uploads/${imageName}`;
  };

  const nextImage = () => {
    if (product.images && product.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const previousImage = () => {
    if (product.images && product.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const imageSrc =
    product.images && product.images.length > 0
      ? getImageUrl(product.images[currentImageIndex])
      : "/placeholder-image.jpg";

  const handleBuyNow = () => {
    if (!user) {
      router.push("/auth/login");
    } else {
      router.push(`/order/${product.id}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-white rounded-full p-1 hover:bg-gray-100 transition-colors z-50"
      >
        <X className="h-6 w-6" />
      </button>

      {isProductOwner && (
        <button
          onClick={handleEditClick}
          className="absolute top-4 right-14 text-gray-500 hover:text-gray-700 bg-white rounded-full p-1 hover:bg-gray-100 transition-colors z-50 group"
        >
          <Pencil className="h-6 w-6" />
          <span className="absolute hidden group-hover:block right-full mr-2 bg-gray-800 text-white text-sm px-2 py-1 rounded whitespace-nowrap">
            Edit Product
          </span>
        </button>
      )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-white rounded-full p-1 hover:bg-gray-100 transition-colors z-50"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Left Side - Image */}
          <div className="relative w-full h-full min-h-[500px] bg-gray-100">
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="w-full h-full"
            />

            {product.images && product.images.length > 1 && (
              <>
                {/* Previous Button */}
                <button
                  onClick={previousImage}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-r transition-colors"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>

                {/* Next Button */}
                <button
                  onClick={nextImage}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-l transition-colors"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/30 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {product.images.length}
                </div>
              </>
            )}
          </div>

          {/* Right Side - Product Details */}
          <div className="p-8">
            <div className="mb-4">
              <span
                className={`text-sm font-medium px-2.5 py-0.5 rounded-full transition-all ${
                  product.categoryRelation?.name
                    ? "bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
                onClick={() => {
                  if (product.categoryRelation?.name) {
                    // Redirect to the category page if category exists
                    const categoryName = product.categoryRelation.name
                      .toLowerCase()
                      .replace(" ", "-");
                    router.push(`/categories/${categoryName}`);
                  }
                }}
              >
                {product.categoryRelation?.name || "Uncategorized"}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {product.name}
            </h2>

            <div className="flex items-center justify-between mb-6">
              <span className="text-3xl font-bold text-gray-900">
                ${parseFloat(product.price.toString()).toFixed(2)}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock > 10
                    ? "bg-green-100 text-green-800"
                    : product.stock > 0
                      ? "bg-orange-100 text-orange-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {product.stock > 10
                  ? "In Stock"
                  : product.stock > 0
                    ? `Only ${product.stock} left`
                    : "Out of Stock"}
              </span>
            </div>

            <p className="text-gray-600 mb-6">{product.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-1">
                <span className="text-sm text-gray-500">Manufacturer</span>
                <p
                  className="font-medium text-gray-900 cursor-pointer hover:underline"
                  onClick={() =>
                    router.push(
                      `/manufacturer?manufacturer=${product.manufacturer}` // Remove 'products/'
                    )
                  }
                >
                  {product.manufacturer}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-gray-500">Compatibility</span>
                <p className="font-medium text-gray-900">
                  {product.compatibility}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-gray-500">Dimensions</span>
                <p className="font-medium text-gray-900">
                  {product.dimensions}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-gray-500">Weight</span>
                <p className="font-medium text-gray-900">{product.weight} kg</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="h-5 w-5 text-blue-600" />
                <span>Free shipping on orders over $100</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>{product.warranty} warranty included</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package className="h-5 w-5 text-blue-600" />
                <span className="cursor-pointer hover:cyan-600 transition-colors hover:underline"
                onClick={() =>
                  router.push(
                    `/manufacturer?manufacturer=${product.manufacturer}` // Remove 'products/'
                  )
                }>Genuine {product.manufacturer} parts</span>
              </div>
            </div>

            {product.seller?.companyName && (
              <div
                className="border-t border-gray-200 pt-4 mb-6 cursor-pointer group"
                onClick={() => {
                  if (product.seller?.user?.id) {
                    console.log(
                      "Navigating to seller profile:",
                      product.seller.user.id
                    );
                    router.push(`/profile/${product.seller.user.id}`);
                  } else {
                    console.log("Seller data:", product.seller);
                    console.error("Seller user ID is missing");
                  }
                }}
              >
                <span className="text-sm text-gray-500">Sold by</span>
                <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                  {product.seller.companyName}
                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </div>
            )}

            <button
              onClick={handleBuyNow}
              className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20"
            >
              {user ? "Contact Seller" : "Login to Contact Seller"}
            </button>
          </div>
        </div>
      </div>
      {showEditModal && (
        <SellPartModal
          isOpen={true}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            // You might want to refresh the product data here
            onClose();
          }}
          product={product}
          mode="edit"
        />
      )}
    </div>
  );
};

export default ProductModal;
