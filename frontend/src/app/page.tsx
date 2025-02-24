'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { Particles } from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { Engine } from 'tsparticles-engine';
import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const loginRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (loginRef.current && !loginRef.current.contains(event.target as Node)) {
        setIsLoginOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!loading) {  // Only check after auth state is loaded
      if (user) {
        router.push('/dashboard');
      } else {
        setIsLoading(false);
      }
    }
  }, [user, loading, router]);

  if (isLoading || loading) {
    return <LoadingSpinner />; // Or your loading component
  }

  return (
    <main className="relative min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Particle Field */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        className="absolute inset-0"
        options={{
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "repulse",
              },
              onClick: {
                enable: true,
                mode: "push",
              },
              resize: true,
            },
            modes: {
              repulse: {
                distance: 100,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: { value: "#ffffff" },
            links: { color: "#ffffff", distance: 150, enable: true, opacity: 0.5, width: 1 },
            move: { enable: true, speed: 2, direction: "none", outModes: { default: "bounce" } },
            number: { value: 50, density: { enable: true, area: 800 } },
            opacity: { value: 0.5 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 5 } },
          },
          detectRetina: true,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-8">Spareparts Marketplace</h1>
        <div className="space-y-4 w-full max-w-md">
          {/* Login Button and Dropdown */}
          <div className="relative" ref={loginRef}>
            <button
              onClick={() => setIsLoginOpen(!isLoginOpen)}
              className="w-full text-center py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Login
            </button>
            
            {/* Login Form Dropdown */}
            {isLoginOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl p-6 transform origin-top transition-transform">
                <LoginForm onSuccess={() => setIsLoginOpen(false)} />
              </div>
            )}
          </div>
          
          <Link
            href="/auth/register"
            className="block w-full text-center py-2 px-4 border border-gray-300 rounded hover:bg-gray-50 hover:text-black"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}