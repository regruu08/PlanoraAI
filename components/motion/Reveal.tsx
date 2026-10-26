'use client';

import React, { useEffect, useRef, useState } from 'react';
import { isMotionLite, MOTION_TOKENS } from '@/lib/motion';

interface RevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'left' | 'right' | 'none';
  delay?: number;
  className?: string;
  as?: React.ElementType;
}

// Single module-level shared IntersectionObserver for all Reveal instances
let sharedObserver: IntersectionObserver | null = null;
const observerCallbacks = new Map<Element, () => void>();

function getSharedObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined') return null;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const callback = observerCallbacks.get(entry.target);
            if (callback) {
              callback();
              observerCallbacks.delete(entry.target);
              sharedObserver?.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    );
  }
  return sharedObserver;
}

export default function Reveal({
  children,
  direction = 'up',
  delay = 0,
  className = '',
  as: Component = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isMotionLite()) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = getSharedObserver();
    if (!observer) {
      setIsVisible(true);
      return;
    }

    observerCallbacks.set(element, () => {
      setIsVisible(true);
    });
    observer.observe(element);

    return () => {
      observerCallbacks.delete(element);
      observer.unobserve(element);
    };
  }, []);

  const getTransform = () => {
    if (isVisible) return 'none';
    switch (direction) {
      case 'up':
        return `translateY(${MOTION_TOKENS.distance.md}px)`;
      case 'left':
        return `translateX(${MOTION_TOKENS.distance.md}px)`;
      case 'right':
        return `translateX(-${MOTION_TOKENS.distance.md}px)`;
      case 'none':
      default:
        return 'none';
    }
  };

  return (
    <Component
      ref={ref}
      className={`motion-reveal ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionProperty: 'opacity, transform',
        transitionDuration: `${MOTION_TOKENS.duration.slow}ms`,
        transitionTimingFunction: MOTION_TOKENS.easing,
        transitionDelay: `${delay}ms`,
        willChange: isVisible ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </Component>
  );
}
