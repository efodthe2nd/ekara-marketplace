'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import * as THREE from 'three';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const requestRef = useRef<number | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  // Auth redirection
  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        setIsLoading(false);
      }
    }
  }, [user, loading, router]);

  // Plasma shader setup
  useEffect(() => {
    if (!canvasRef.current || isLoading) return;

    const container = canvasRef.current;
    
    // Initialize THREE.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); // Perfect square for proper centering
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x000000, 1);
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Create a full-screen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    
    // Create shader material
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uScale: { value: 1.15 },
        uResolution: { value: new THREE.Vector2(width, height) }
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uResolution;
        uniform float uScale; // Scale control
        
        vec2 centerUV(vec2 uv, vec2 resolution) {
          // Perfectly center and scale the coordinates
          vec2 centered = ((2.0 * uv - resolution) / min(resolution.x, resolution.y));
          centered.x -= 0.4;
          centered.y -= 0.3;
          return centered *uScale;
        }
        
        void main() {
          vec2 p = centerUV(gl_FragCoord.xy, uResolution);
          float time = uTime * 0.5;
          
          float z = 0.0;
          z += 4.0 - 4.0 * abs(0.7 - dot(p, p));
          
          vec2 f = p * z;
          vec4 color = vec4(0.0);
          
          for (float i = 1.0; i <= 8.0; i++) {
            f += cos(f.yx * i + vec2(0.0, i) + time) / i * 0.7;
            color += (sin(f) + 1.0).xyyx * abs(f.x - f.y) / i;
          }
          
          color = tanh(7.0 * exp(z - 4.0 - p.y * vec4(-1.0, 1.0, 2.0, 0.0)) / color);
          gl_FragColor = color;
        }
      `
    });
    
    // Create and add mesh to scene
    const quad = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(quad);
    
    // Animation loop
    const animate = () => {
      shaderMaterial.uniforms.uTime.value += 0.01;
      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    // Handle window resizing
    const handleResize = () => {
      if (!canvasRef.current || !rendererRef.current) return;
      
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      
      rendererRef.current.setSize(width, height);
      shaderMaterial.uniforms.uResolution.value.set(width, height);
      
      // Adjust scale based on aspect ratio to ensure the effect is fully visible
      const aspectRatio = width / height;
      if (aspectRatio > 1) {
        // Wider screen - ensure vertical visibility
        shaderMaterial.uniforms.uScale.value = 0.75;
      } else {
        // Taller screen - ensure horizontal visibility
        shaderMaterial.uniforms.uScale.value = 0.75 * aspectRatio;
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && container) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      
      geometry.dispose();
      shaderMaterial.dispose();
    };
  }, [isLoading]);

  if (isLoading || loading) {
    return <LoadingSpinner />;
  }

  return (
    <main 
      ref={containerRef}
      className="relative min-h-screen bg-black text-white overflow-hidden flex flex-col items-center mx-auto justify-center"
    >
      {/* THREE.js canvas container */}
      <div 
        ref={canvasRef} 
        className="absolute inset-0 z-0 flex items-center justify-center"
      />
      
      {/* Full-page semi-transparent overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 z-10" />
      
      {/* New content overlay */}
      <div className="relative z-20 text-center px-4 max-w-screen-md mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Quality Spare Parts Marketplace
        </h1>
        <p className="text-xl md:text-2xl mb-6">
          Find the exact parts you need at competitive prices
        </p>
        <Link
            href="/dashboard"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Explore
          </Link>
      </div>
    </main>
  );
}