'use client';

import React, { useRef, useEffect } from 'react';
import { isMotionLite } from '@/lib/motion';

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  maxDistance?: number;
}

export default function Magnetic({
  children,
  className = '',
  maxDistance = 6,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on non-touch devices and when motion-lite is not active
    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    if (isTouch || isMotionLite()) return;

    const el = ref.current;
    if (!el) return;

    let rafId: number | null = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const animate = () => {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;

      if (el) {
        el.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      }

      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = null;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      targetX = (deltaX / (rect.width / 2)) * maxDistance;
      targetY = (deltaY / (rect.height / 2)) * maxDistance;

      if (!rafId) {
        rafId = requestAnimationFrame(animate);
      }
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;
      if (!rafId) {
        rafId = requestAnimationFrame(animate);
      }
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [maxDistance]);

  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>
  );
}
