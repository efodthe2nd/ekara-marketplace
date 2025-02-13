"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import { CategoryAutocomplete, Category } from "../common/CategoryAutocomplete";
import { Product } from "@/types/product";
import Image from "next/image";


interface SellPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedProduct: Product) => void;
  product?: Product;
  mode?: "create" | "edit";
}

interface ImageState {
  existingImages: string[];  // URLs of images already on the server
  newImages: File[];         // New image files to upload
  previews: string[];       // Combined preview URLs
}

// Image validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILES = 5;

const SellPartModal = ({
  isOpen,
  onClose,

  onSuccess,
  product,
  mode = "create",
}: SellPartModalProps) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    manufacturer: product?.manufacturer || "",
    category: product?.categoryRelation?.name || "",
    compatibility: product?.compatibility || "",
    dimensions: product?.dimensions || "",
    weight: product?.weight || "",
    warranty: product?.warranty || "",
    stock: product?.stock || "",
    condition: product?.condition || "new",
  });

  const [imageState, setImageState] = useState<ImageState>({
    existingImages: [],
    newImages: [],
    previews: []
  });

  // Initialize selected category if editing
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    product?.categoryRelation
      ? {
          id: product.categoryRelation.id,
          name: product.categoryRelation.name,
          level: 0, // Add a default level if not available
        }
      : null
  );

  // Image handling states
  const [uploadProgress] = useState(0);
  const [imageError, setImageError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateImage = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "Invalid file type. Only JPG, PNG and WebP allowed.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File too large. Maximum size is 5MB.";
    }
    return null;
  };

  const getImageUrl = (imageName: string) => {
    if (!imageName) return '';
    if (imageName.startsWith("data:image")) {
      return imageName;
    }
    if (imageName.startsWith("http://") || imageName.startsWith("https://")) {
      return imageName;
    }
    return imageName.startsWith("/") ? imageName : `/uploads/${imageName}`;
  };

  // Initialize image state when product changes
  useEffect(() => {
    if (product?.images) {
      setImageState({
        existingImages: product.images,
        newImages: [],
        previews: product.images.map(img => getImageUrl(img))
      });
    } else {
      setImageState({
        existingImages: [],
        newImages: [],
        previews: []
      });
    }
  }, [product]);

  

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageError("");

    if (files.length + imageState.existingImages.length > MAX_FILES) {
      setImageError(`Maximum ${MAX_FILES} images allowed`);
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    files.forEach((file) => {
      const error = validateImage(file);
      if (error) {
        setImageError(error);
        return;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    if (validFiles.length > 0) {
      setImageState(prev => ({
        ...prev,
        newImages: [...prev.newImages, ...validFiles],
        previews: [...prev.previews, ...newPreviews]
      }));
    }
  };

  const removeImage = async (index: number) => {
    try {
      const totalExisting = imageState.existingImages.length;
      
      if (index < totalExisting) {
        // It's an existing image - need to delete from server first
        const imageToDelete = imageState.existingImages[index];
        console.log('Attempting to delete image:', imageToDelete);
      console.log('Full URL:', `http://localhost:3000/api/products/${product?.id}/images/${encodeURIComponent(imageToDelete)}`);
        
        const response = await fetch(
          `http://localhost:3000/api/products/${product?.id}/images/${encodeURIComponent(imageToDelete)}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem("token")}`,
            }
          }
        );
  
        if (!response.ok) {
          throw new Error('Failed to delete image from server');
        }
  
        // Only update local state if server delete was successful
        setImageState(prev => {
          const newState = { ...prev };
          newState.existingImages = prev.existingImages.filter((_, i) => i !== index);
          newState.previews = [
            ...newState.existingImages.map(img => getImageUrl(img)),
            ...newState.newImages.map(file => URL.createObjectURL(file))
          ];
          return newState;
        });
      } else {
        // It's a new image that hasn't been uploaded yet
        setImageState(prev => {
          const newState = { ...prev };
          const newIndex = index - totalExisting;
          URL.revokeObjectURL(prev.previews[index]); // Clean up preview URL
          newState.newImages = prev.newImages.filter((_, i) => i !== newIndex);
          newState.previews = [
            ...newState.existingImages.map(img => getImageUrl(img)),
            ...newState.newImages.map(file => URL.createObjectURL(file))
          ];
          return newState;
        });
      }
    } catch (error) {
      console.error('Error removing image:', error);
      // Show error to user
      setError('Failed to delete image. Please try again.');
    }
  };

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
  
    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        manufacturer: formData.manufacturer.trim(),
        categoryId: selectedCategory?.id,
        compatibility: formData.compatibility.trim(),
        dimensions: formData.dimensions.trim(),
        weight: Number(formData.weight),
        warranty: formData.warranty.trim(),
        stock: Number(formData.stock),
        condition: formData.condition || "new",
        //images: imageState.existingImages // Include existing images in product data
      };
  
      if (mode === "create") {
        // Create logic
        const formDataToSend = new FormData();
        formDataToSend.append('productData', JSON.stringify(productData));
        
        if (imageState.newImages.length > 0) {
          imageState.newImages.forEach((image) => {
            formDataToSend.append('images', image);
          });
        }
  
        const response = await fetch("http://localhost:3000/api/products", {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
          },
          body: formDataToSend
        });
  
        if (!response.ok) {
          throw new Error("Failed to create product");
        }
  
        const createdProduct = await response.json();
        onSuccess?.(createdProduct);
        onClose();
      } else {
        // Update logic
        if (!product?.id) {
          throw new Error("Product ID is required for updates");
        }
  
        // First update the product data
        const updateResponse = await fetch(
          `http://localhost:3000/api/products/${product.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(productData)
          }
        );
  
        if (!updateResponse.ok) {
          throw new Error(`Failed to update product: ${updateResponse.status}`);
        }
  
        let updatedProduct = await updateResponse.json();
  
        // Only upload new images if there are any
        if (imageState.newImages.length > 0) {
          const imageFormData = new FormData();
          imageState.newImages.forEach((image) => {
            imageFormData.append('images', image);
          });
  
          const imageUploadResponse = await fetch(
            `http://localhost:3000/api/products/${product.id}/images`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
              },
              body: imageFormData
            }
          );
  
          if (!imageUploadResponse.ok) {
            throw new Error("Failed to upload images");
          }
  
          updatedProduct = await imageUploadResponse.json();
        }
  
        onSuccess?.(updatedProduct);
        onClose();
      }
    } catch (error) {
      console.error(`Complete ${mode} Error:`, error);
      setError(
        error instanceof Error ? error.message : `Failed to ${mode} product`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect(() => {
  //   // Reset images when product changes
  //   setImages([]);
  //   setPreviews([]);

    // Always set initial state, even if product is undefined
    // const initialImages = product?.images ?? [];
    // if (initialImages.length > 0) {
    //   // Use unique image URLs to prevent duplicate keys
    //   const uniqueImageUrls = [...new Set(initialImages.map(getImageUrl))];
    //   setPreviews(uniqueImageUrls);

      // Fetch image files
  //     const fetchImages = async () => {
  //       try {
  //         const imageFiles = await Promise.all(
  //           uniqueImageUrls.map(async (imageUrl) => {
  //             const response = await fetch(imageUrl);
  //             const blob = await response.blob();
  //             return new File([blob], imageUrl.split("/").pop() || "image", {
  //               type: blob.type,
  //             });
  //           })
  //         );
  //         setImages(imageFiles);
  //       } catch (error) {
  //         console.error("Error fetching images:", error);
  //       }
  //     };

  //     fetchImages();
  //   }
  // }, [product]);

  // useEffect(() => {
  //   if (product?.images) {
  //     setPreviews(product.images.map((img) => getImageUrl(img)));
  //   }
  // }, [product]);

  if (!isOpen) return null;
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Sell Part</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">{error}</div>
        )}

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              (e.target as HTMLElement).tagName !== "TEXTAREA"
            ) {
              e.preventDefault();
            }
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) =>
                  setFormData({ ...formData, manufacturer: e.target.value })
                }
                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              {/* <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              /> */}
              <CategoryAutocomplete
                onSelect={(category) => setSelectedCategory(category)}
                initialValue={formData.category}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Compatibility
              </label>
              <input
                type="text"
                value={formData.compatibility}
                onChange={(e) =>
                  setFormData({ ...formData, compatibility: e.target.value })
                }
                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dimensions
              </label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) =>
                  setFormData({ ...formData, dimensions: e.target.value })
                }
                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Weight
              </label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Warranty
              </label>
              <input
                type="text"
                value={formData.warranty}
                onChange={(e) =>
                  setFormData({ ...formData, warranty: e.target.value })
                }
                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Stock
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Condition
              </label>
              <select
                value={formData.condition}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value })
                }
                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>

            {/* Image Upload Section */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Product Images ({imageState.previews.length}/{MAX_FILES})
              </label>

              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="images"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload images</span>
                      <input
                        id="images"
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WebP up to 5MB
                  </p>
                </div>
              </div>

              {imageError && (
                <p className="mt-2 text-sm text-red-600">{imageError}</p>
              )}

{imageState.previews.map((preview, index) => (
  <div key={`${preview}-${index}`} className="relative inline-block">
    {preview.startsWith('data:') ? (
      // For local previews (not yet uploaded)
      <img 
        src={preview} 
        alt={`Preview ${index + 1}`} 
        className="h-24 w-24 object-cover rounded"
      />
    ) : (
      // For uploaded images (Vercel Blob URLs)
      <Image 
        src={preview} 
        alt={`Preview ${index + 1}`} 
        width={96}
        height={96}
        loading="lazy"
        className="object-cover rounded"
      />
    )}
    <button
      type="button"
      onClick={() => removeImage(index)}
      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm"
    >
      <X className="h-3 w-3" />
    </button>
  </div>
))}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : mode === "create" ? (
                "Create Part"
              ) : (
                "Update Part"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellPartModal;
