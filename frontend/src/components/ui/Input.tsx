// src/components/ui/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = ({ label, error, ...props }: InputProps) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        {...props}
        className={`mt-1 block w-full rounded-md shadow-sm
          ${error ? 'border-red-300' : 'border-gray-300'}
          focus:ring-blue-500 focus:border-blue-500`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// src/components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary';
}

export const Button = ({ 
  children, 
  isLoading, 
  variant = 'primary', 
  ...props 
}: ButtonProps) => {
  return (
    <button
      {...props}
      disabled={isLoading}
      className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium
        ${variant === 'primary' 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};