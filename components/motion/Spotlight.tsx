'use client';

import React, { useRef, useEffect } from 'react';
import { isMotionLite } from '@/lib/motion';

interface SpotlightProps {
  children: React.ReactNode;
  className?: string;
  radius?: number;
  color?: string;
}

export default function Spotlight({
  children,
  className = '',
  radius = 350,
  color = 'rgba(225, 29, 72, 0.06)',
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    if (isTouch || isMotionLite()) return;

    const container = containerRef.current;
    if (!container) return;

    let rafId: number | null = null;
    let clientX = 0;
    let clientY = 0;

    const updatePosition = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      container.style.setProperty('--spotlight-x', `${x.toFixed(1)}px`);
      container.style.setProperty('--spotlight-y', `${y.toFixed(1)}px`);
      rafId = null;
    };

    const handlePointerMove = (e: PointerEvent) => {
      clientX = e.clientX;
      clientY = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(updatePosition);
      }
    };

    container.addEventListener('pointermove', handlePointerMove);
    return () => {
      container.removeEventListener('pointermove', handlePointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={
        {
          '--spotlight-radius': `${radius}px`,
          '--spotlight-color': color,
        } as React.CSSProperties
      }
    >
      {/* Hardware-accelerated radial spotlight overlay */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 motion-reduce:hidden"
        style={{
          background: `radial-gradient(var(--spotlight-radius) circle at var(--spotlight-x, -999px) var(--spotlight-y, -999px), var(--spotlight-color), transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
}
