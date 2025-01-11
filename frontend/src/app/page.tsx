// src/app/page.tsx
'use client';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="text-4xl font-bold mb-8">Spareparts Marketplace</h1>
        <div className="space-y-4 w-full max-w-md">
          <a 
            href="/auth/login" 
            className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Login
          </a>
          <a 
            href="/auth/register" 
            className="block w-full text-center py-2 px-4 border border-gray-300 rounded hover:bg-gray-50"
          >
            Register
          </a>
        </div>
      </div>
    </main>
  );
}