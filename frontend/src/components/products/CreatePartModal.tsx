"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import { CategoryAutocomplete, Category } from "../common/CategoryAutocomplete";
import { Product } from "@/types/product"; 





interface SellPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  product?: Product;
  mode?: 'create' | 'edit';
}

// Image validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILES = 5;

const SellPartModal = ({ isOpen, onClose, onSuccess, product, mode = 'create' }: SellPartModalProps) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    manufacturer: product?.manufacturer || "",
    category: product?.categoryRelation?.name || "",
    compatibility: product?.compatibility || "",
    dimensions: product?.dimensions || "",
    weight: product?.weight?.toString() || "",
    warranty: product?.warranty || "",
    stock: product?.stock?.toString() || "",
    condition: product?.condition || "new",
  });

  // Initialize selected category if editing
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    product?.categoryRelation ? {
      id: product.categoryRelation.id,
      name: product.categoryRelation.name,
      level: 0 // Add a default level if not available
    } : null
  );

  // Image handling states
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
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

  useEffect(() => {
    // Always set initial state, even if product is undefined
    const initialImages = product?.images ?? [];
    if (initialImages.length > 0) {
      const imageUrls = initialImages.map(img => getImageUrl(img));
      setPreviews(imageUrls);
  
      // Fetch image files
      const fetchImages = async () => {
        try {
          const imageFiles = await Promise.all(
            initialImages.map(async (img) => {
              const response = await fetch(getImageUrl(img));
              const blob = await response.blob();
              return new File([blob], img.split('/').pop() || 'image', { type: blob.type });
            })
          );
          setImages(imageFiles);
        } catch (error) {
          console.error('Error fetching images:', error);
        }
      };
  
      fetchImages();
    }
  }, [product]); 

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageError("");

    if (files.length > MAX_FILES) {
      setImageError(`Maximum ${MAX_FILES} images allowed`);
      return;
    }

    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    files.forEach((file) => {
      const error = validateImage(file);
      if (error) {
        setImageError(error);
        return;
      }

      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    });

    if (validFiles.length > 0) {
      setImages(validFiles);
      setPreviews(validPreviews);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    setImages(newImages);
    setPreviews(newPreviews);
    URL.revokeObjectURL(previews[index]);
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
  
    try {
      const formDataToSend = new FormData();
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        manufacturer: formData.manufacturer.trim(),
        category: selectedCategory?.name || "",
        categoryId: selectedCategory?.id,
        compatibility: formData.compatibility.trim(),
        dimensions: formData.dimensions.trim(),
        weight: Number(formData.weight),
        warranty: formData.warranty.trim(),
        stock: Number(formData.stock),
        condition: formData.condition || "new",
      };
  
      formDataToSend.append("productData", JSON.stringify(productData));
      images.forEach((image) => {
        formDataToSend.append("images", image);
      });
  
      const url = mode === 'create' 
        ? "http://localhost:3000/api/products"
        : `http://localhost:3000/api/products/${product?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';
  
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      });
  
      if (!response.ok) {
        throw new Error(mode === 'create' ? "Failed to create product" : "Failed to update product");
      }
  
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(mode === 'create' ? "Error creating product:" : "Error updating product:", error);
      setError(
        error instanceof Error ? error.message : `Failed to ${mode} product`
      );
    } finally {
      setIsLoading(false);
    }
    
  };

  useEffect(() => {
    if (product?.images) {
      setPreviews(product.images.map(img => getImageUrl(img)));
    }
  }, [product]);

  if (!isOpen) return null;

  const getImageUrl = (imageName: string) => {
    if (imageName.startsWith("data:image")) {
      return imageName;
    }
    if (imageName.startsWith("http://") || imageName.startsWith("https://")) {
      return imageName;
    }
    return imageName.startsWith("/") ? imageName : `/uploads/${imageName}`;
  };

  

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
            if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
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
                Product Images ({images.length}/{MAX_FILES})
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

              {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  {previews.map((preview, index) => (
                    <div key={preview} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-24 w-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

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
  ) : (
    (mode === 'create' ? "Create Part" : "Update Part")
  )}
</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellPartModal;