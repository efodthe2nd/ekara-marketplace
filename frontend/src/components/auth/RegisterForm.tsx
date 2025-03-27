"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const RegisterForm = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  interface FormData {
    email: string;
    username: string;
    password: string;
    role: "buyer" | "seller";
    firstName: string;
    lastName: string;
    address: string;
    phoneNumber?: string;
    contactMethod?: "email" | "phone" | "both";
    companyName?: string;
    companyDescription?: string;
    website?: string;
  }

  const [formData, setFormData] = useState<FormData>({
    email: "",
    username: "",
    password: "",
    role: "buyer",
    firstName: "",
    lastName: "",
    address: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error on input change
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        return !!(formData.email && formData.username && formData.password);
      case 2:
        return !!(formData.firstName && formData.lastName && formData.address);
      case 3:
        if (formData.role === "buyer") {
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
      setError("Please fill in all required fields.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateStep()) {
      setError("Please complete all required fields before submitting.");
      return;
    }

    try {
      // Update the URL to point to your backend server
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Registration successful:", data);
        router.push(
          `/auth/confirm?email=${encodeURIComponent(formData.email)}`
        );
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-4xl mx-auto my-8">
      <div className="flex flex-col md:flex-row min-h-[600px]">
        {/* Left Panel */}
        <div className="bg-[#111827] p-10 text-white w-full md:w-[400px] flex flex-col">
          <h2 className="text-4xl font-semibold mb-12">Welcome</h2>

          <div className="space-y-6 mb-16">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: "buyer" }))}
              className={`w-full py-4 rounded-xl transition-all ${
                formData.role === "buyer"
                  ? "bg-white text-[#111827]"
                  : "bg-[#1f2937] text-white"
              }`}
            >
              I&apos;m a Buyer
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: "seller" }))}
              className={`w-full py-4 rounded-xl transition-all ${
                formData.role === "seller"
                  ? "bg-white text-[#111827]"
                  : "bg-[#1f2937] text-white"
              }`}
            >
              I&apos;m a Seller
            </button>
          </div>

          <div className="space-y-6 mt-auto">
            {[
              { num: 1, text: "Account Details" },
              { num: 2, text: "Personal Information" },
              {
                num: 3,
                text: formData.role === "seller" ? "Business Details" : "Additional Details",
              },
            ].map((item) => (
              <div key={item.num} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    step >= item.num
                      ? "bg-white text-[#111827]"
                      : "bg-[#1f2937] text-white"
                  }`}
                >
                  {item.num}
                </div>
                <span className="ml-3 text-sm text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 p-8 md:p-16 flex flex-col">
          <h3 className="text-3xl font-semibold text-gray-900 mb-8">
            Create Your Account
          </h3>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6 flex-1">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Email
                  </label>
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
                  <label className="block text-sm text-gray-700 mb-2">
                    Username
                  </label>
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
                <div className="relative">
                  <label className="block text-sm text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900 pr-10"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-800"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 translate-y-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M1.5 12s4.5-7 10.5-7 10.5 7 10.5 7-4.5 7-10.5 7S1.5 12 1.5 12z"
                        />
                        <circle cx="12" cy="12" r="3" fill="currentColor" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 translate-y-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M1.5 12s4.5-7 10.5-7 10.5 7 10.5 7-4.5 7-10.5 7S1.5 12 1.5 12z"
                        />
                        <circle cx="12" cy="12" r="3" fill="currentColor" />
                        <line
                          x1="4"
                          y1="4"
                          x2="20"
                          y2="20"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    )}
                  </button>
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

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900 placeholder-gray-500"
                    placeholder="Enter your first name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900 placeholder-gray-500"
                    placeholder="Enter your last name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900 placeholder-gray-500"
                    placeholder="Enter your address"
                    required
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
                    onClick={handleNextStep}
                    className="w-32 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                {formData.role === "seller" ? (
                  // Seller specific fields
                  <>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        name="companyName"
                        type="text"
                        value={formData.companyName || ""}
                        onChange={handleInputChange}
                        className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900 placeholder-gray-500"
                        placeholder="Enter company name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber || ""}
                        onChange={handleInputChange}
                        className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900 placeholder-gray-500"
                        placeholder="Enter phone number"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Company Description
                      </label>
                      <textarea
                        name="companyDescription"
                        value={formData.companyDescription || ""}
                        onChange={handleInputChange}
                        className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900 placeholder-gray-500 min-h-[120px]"
                        placeholder="Describe your company"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Website (Optional)
                      </label>
                      <input
                        name="website"
                        type="url"
                        value={formData.website || ""}
                        onChange={handleInputChange}
                        className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900 placeholder-gray-500"
                        placeholder="Enter company website"
                      />
                    </div>
                  </>
                ) : (
                  // Buyer specific fields
                  <>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber || ""}
                        onChange={handleInputChange}
                        className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900 placeholder-gray-500"
                        placeholder="Enter phone number"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Preferred Contact Method
                      </label>
                      <select
                        name="contactMethod"
                        value={formData.contactMethod || ""}
                        onChange={handleInputChange}
                        className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900"
                        required
                      >
                        <option value="" disabled>
                          Select preferred contact method
                        </option>
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
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

import Link from "next/link";

export default RegisterForm;
