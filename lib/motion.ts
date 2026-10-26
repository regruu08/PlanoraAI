/**
 * Motion System Design Tokens
 * 
 * Strict Performance Rules:
 * - Animate only transform and opacity.
 * - Single shared cubic-bezier easing.
 * - Max duration 500ms. Max translate 16px-24px.
 * - Respects 'motion-lite' and prefers-reduced-motion.
 */

export const MOTION_TOKENS = {
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  duration: {
    fast: 160,
    normal: 240,
    slow: 400,
    hero: 600,
  },
  distance: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  stagger: 60, // ms between staggered items
} as const;

/**
 * Returns true if client prefers reduced motion or motion-lite is active
 */
export function isMotionLite(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    document.documentElement.classList.contains('motion-lite') ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
