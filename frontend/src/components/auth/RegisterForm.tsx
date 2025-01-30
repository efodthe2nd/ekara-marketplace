'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const RegisterForm = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  
  interface FormData {
    email: string;
    username: string;
    password: string;
    role: 'buyer' | 'seller';
    firstName: string;
    lastName: string;
    address: string;
    phoneNumber?: string;
    contactMethod?: 'email' | 'phone' | 'both';
    companyName?: string;
    companyDescription?: string;
    website?: string;
  }

  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    password: '',
    role: 'buyer',
    firstName: '',
    lastName: '',
    address: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error on input change
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        return !!(formData.email && formData.username && formData.password);
      case 2:
        return !!(formData.firstName && formData.lastName && formData.address);
      case 3:
        if (formData.role === 'buyer') {
          return !!(formData.phoneNumber && formData.contactMethod);
        }
        return !!(formData.companyName && formData.companyDescription);
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    } else {
      setError('Please fill in all required fields.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!validateStep()) {
      setError('Please complete all required fields before submitting.');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        router.push(`/auth/confirm?email=${encodeURIComponent(formData.email)}`);
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-4xl mx-auto">
      <div className="flex h-[600px]">
        <div className="bg-[#111827] p-10 text-white w-[400px]">
          <h2 className="text-4xl font-semibold mb-12">Welcome</h2>
          <div className="space-y-6 mb-16">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'buyer' }))}
              className={`w-full py-4 rounded-xl transition-all ${formData.role === 'buyer' ? 'bg-white text-[#111827]' : 'bg-[#1f2937] text-white'}`}
            >
              I&apos;m a Buyer
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'seller' }))}
              className={`w-full py-4 rounded-xl transition-all ${formData.role === 'seller' ? 'bg-white text-[#111827]' : 'bg-[#1f2937] text-white'}`}
            >
              I&apos;m a Seller
            </button>
          </div>
        </div>

        <div className="flex-1 p-16">
          <h3 className="text-3xl font-semibold text-gray-900 mb-8">Create Your Account</h3>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Username</label>
                  <input
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900"
                    placeholder="Choose a username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Password</label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900"
                    placeholder="Create a password"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              </>
            )}
          </form>
          <p className="mt-6 text-center text-gray-600">
            Already have an account? <Link href="/auth/login" className="text-blue-600 hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
