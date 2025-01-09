// src/app/page.tsx
import { Providers } from './providers';

export default function Home() {
  return (
    <Providers>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Spareparts Marketplace
          </h1>
          <div className="space-y-4">
            <a 
              href="/auth/login"
              className="block w-full text-center bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Login
            </a>
            <a 
              href="/auth/register"
              className="block w-full text-center border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50"
            >
              Register
            </a>
          </div>
        </div>
      </div>
    </Providers>
  );
}