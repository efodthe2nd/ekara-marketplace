"use client";

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const PlasmaShaderHero = ({ className, height = "100vh" }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const requestRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Initialize THREE.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    // Create renderer with proper size
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x000000, 1); // Pure black background
    
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Prevent performance issues
    
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Create a full-screen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    
    // Create shader material with improved plasma effect
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
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
        
        // Center-adjusting utility
        vec2 centerUV(vec2 uv, vec2 resolution) {
          return (2.0 * uv - resolution) / min(resolution.x, resolution.y);
        }
        
        void main() {
          // Get centered coordinates for perfect centering
          vec2 p = centerUV(gl_FragCoord.xy, uResolution);
          
          // Animation parameters
          float time = uTime * 0.5;
          
          // Z depth calculation for plasma shape
          float z = 0.0;
          z += 4.0 - 4.0 * abs(0.7 - dot(p, p));
          
          // Initialize fluid coordinates
          vec2 f = p * z;
          
          // Initialize output color
          vec4 color = vec4(0.0);
          
          // Iterative plasma calculation - 8 iterations
          for (float i = 1.0; i <= 8.0; i++) {
            // Calculate fluid waves
            f += cos(f.yx * i + vec2(0.0, i) + time) / i * 0.7;
            
            // Add color waves - creates the plasma effect
            color += (sin(f) + 1.0).xyyx * abs(f.x - f.y) / i;
          }
          
          // Apply color transformation
          color = tanh(7.0 * exp(z - 4.0 - p.y * vec4(-1.0, 1.0, 2.0, 0.0)) / color);
          
          gl_FragColor = color;
        }
      `
    });
    
    // Create and add mesh to scene
    const quad = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(quad);
    
    // Animation loop with RAF
    const animate = () => {
      shaderMaterial.uniforms.uTime.value += 0.01; // Consistent animation speed
      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Handle window resizing
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      renderer.setSize(width, height);
      shaderMaterial.uniforms.uResolution.value.set(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      
      window.removeEventListener('resize', handleResize);
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // Clean up THREE.js resources
      geometry.dispose();
      shaderMaterial.dispose();
      renderer.dispose();
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className={className} 
      style={{ 
        width: '100%', 
        height: height, 
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000000'
      }} 
    />
  );
};

export default PlasmaShaderHero;