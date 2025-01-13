'use client';

import { useState } from 'react';

const RegisterForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    role: 'buyer',
  });

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-7xl mx-auto">
      <div className="flex h-[600px]">
        {/* Left Panel */}
        <div className="bg-[#111827] p-10 text-white w-[400px]">
          <h2 className="text-4xl font-semibold mb-12">Welcome</h2>

          <div className="space-y-6 mb-16">
            <button
              onClick={() => setFormData((prev) => ({ ...prev, role: 'buyer' }))}
              className={`w-full py-4 rounded-xl transition-all ${
                formData.role === 'buyer'
                  ? 'bg-white text-[#111827]'
                  : 'bg-[#1f2937] text-white'
              }`}
            >
              I&apos;m a Buyer
            </button>

            <button
              onClick={() => setFormData((prev) => ({ ...prev, role: 'seller' }))}
              className={`w-full py-4 rounded-xl transition-all ${
                formData.role === 'seller'
                  ? 'bg-white text-[#111827]'
                  : 'bg-[#1f2937] text-white'
              }`}
            >
              I&apos;m a Seller
            </button>
          </div>

          {/* Progress Steps */}
          <div className="space-y-6">
  {[
    { num: 1, text: 'Account Details' },
    { num: 2, text: 'Personal Information' },
    { num: 3, text: formData.role === 'seller' ? 'Business Details' : 'Additional Details' }, // Dynamic text based on role
  ].map((item) => (
    <div key={item.num} className="flex items-center">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          step >= item.num
            ? 'bg-white text-[#111827]'
            : 'bg-[#1f2937] text-white'
        }`}
      >
        {item.num}
      </div>
      <span className="ml-3 text-sm">{item.text}</span>
    </div>
  ))}
</div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 p-16">
          <h3 className="text-3xl font-semibold text-gray-900 mb-8">
            Create Your Account
          </h3>

          <form className="space-y-8">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900"
                    placeholder="Choose a username"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900"
                    placeholder="Create a password"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>

                <p className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <a href="/auth/login" className="text-blue-600 hover:text-blue-700">
                    Sign in
                  </a>
                </p>
              </>
            )}
            {step === 2 && (
  <>
    <div>
      <label className="block text-sm text-gray-700 mb-2">First Name</label>
      <input
        type="text"
        className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900 placeholder-gray-500"
        placeholder="Enter your first name"
      />
    </div>

    <div>
      <label className="block text-sm text-gray-700 mb-2">Last Name</label>
      <input
        type="text"
        className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900 placeholder-gray-500"
        placeholder="Enter your last name"
      />
    </div>

    <div>
      <label className="block text-sm text-gray-700 mb-2">Address</label>
      <input
        type="text"
        className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900 placeholder-gray-500"
        placeholder="Enter your address"
      />
    </div>

    <div className="flex justify-between">
      <button
        type="button"
        onClick={() => setStep(1)}
        className="px-6 text-gray-700 hover:text-gray-900"
      >
        Back
      </button>
      <button
        type="button"
        onClick={() => setStep(3)}
        className="w-32 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors"
      >
        Next
      </button>
    </div>
  </>
)}
{step === 3 && (
  <>
    {formData.role === 'seller' ? (
      // Seller specific fields
      <>
        <div>
          <label className="block text-sm text-gray-700 mb-2">Company Name</label>
          <input
            type="text"
            className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900 placeholder-gray-500"
            placeholder="Enter company name"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">Company Description</label>
          <textarea
            className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900 placeholder-gray-500 min-h-[120px]"
            placeholder="Describe your company"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">Website (Optional)</label>
          <input
            type="url"
            className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900 placeholder-gray-500"
            placeholder="Enter company website"
          />
        </div>
      </>
    ) : (
      // Buyer specific fields
      <>
        <div>
          <label className="block text-sm text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900 placeholder-gray-500"
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">Preferred Contact Method</label>
          <select
            className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900"
          >
            <option value="">Select preferred contact method</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="both">Both</option>
          </select>
        </div>
      </>
    )}

    <div className="flex justify-between">
      <button
        type="button"
        onClick={() => setStep(2)}
        className="px-6 text-gray-700 hover:text-gray-900"
      >
        Back
      </button>
      <button
        type="submit"
        className="w-32 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors"
      >
        Submit
      </button>
    </div>
  </>
)}
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
