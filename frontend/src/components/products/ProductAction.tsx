import React from 'react';
import { Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProductActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  showDelete?: boolean;
}

const ProductActions: React.FC<ProductActionsProps> = ({ onDelete, showDelete = false }) => {
  return (
    <div className="flex items-center space-x-2">
      {/* <button 
        onClick={onEdit}
        className="p-1 rounded hover:bg-gray-100"
        aria-label="Edit product"
      >
        <Edit size={18} />
      </button> */}
      
      {showDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button 
              className="p-1 rounded hover:bg-gray-100" 
              aria-label="Delete product"
            >
              <Trash size={18} />
            </button>
          </AlertDialogTrigger>
          
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this product? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default ProductActions;