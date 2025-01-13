// src/components/auth/RegisterForm.tsx
'use client';

import React, { useState } from 'react';
import { User, Mail, Lock, Building2, MapPin } from 'lucide-react';

interface FormData {
  email: string;
  username: string;
  password: string;
  role: 'buyer' | 'seller';
  firstName?: string;
  lastName?: string;
  address?: string;
  companyName?: string;
  companyDescription?: string;
  website?: string;
}

const RegisterForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    password: '',
    role: 'buyer'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (selectedRole: 'buyer' | 'seller') => {
    setFormData(prev => ({ ...prev, role: selectedRole }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    // Handle form submission here
    console.log(formData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-7xl w-full mx-auto">
      <div className="flex flex-col md:flex-row">
        {/* Left Panel */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white md:w-2/5">
          <h2 className="text-2xl font-bold mb-6">Welcome!</h2>
          
          <div className="space-y-4 mb-8">
            <button 
              onClick={() => handleRoleChange('buyer')}
              className={`w-full p-4 rounded-lg transition-all ${
                formData.role === 'buyer' 
                  ? 'bg-white text-blue-600' 
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5" />
                <span>I&apos;m a Buyer</span>
              </div>
            </button>
            <button 
              onClick={() => handleRoleChange('seller')}
              className={`w-full p-4 rounded-lg transition-all ${
                formData.role === 'seller' 
                  ? 'bg-white text-blue-600' 
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Building2 className="h-5 w-5" />
                <span>I&apos;m a Seller</span>
              </div>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= i ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
                }`}>
                  {i}
                </div>
                <span className="ml-3 text-sm">
                  {i === 1 ? 'Account Details' : 
                   i === 2 ? 'Personal Information' :
                   formData.role === 'seller' ? 'Business Details' : 'Additional Details'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="p-8 md:w-2/3">
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <Mail className="h-5 w-5 text-black-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                </div>
              </>
            )}

            {step === 3 && formData.role === 'seller' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Description</label>
                  <textarea
                    name="companyDescription"
                    value={formData.companyDescription || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Website (Optional)</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </>
            )}

            <div className="flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 ml-auto"
              >
                {step === 3 ? 'Create Account' : 'Next'}
              </button>
            </div>
          </form>

          {step === 1 && (
            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/auth/login" className="text-blue-600 hover:text-blue-500">
                Sign in
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;