/**
 * Centralized motion helpers.
 *
 * useReducedMotion() returns null on the server (SSR) and a boolean
 * on the client. We treat null as false so SSR and first client render
 * always produce the same output, avoiding hydration mismatches.
 */

import { useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";

export interface MotionVariants {
  fade: Variants;
  slideUp: Variants;
  slideDown: Variants;
  slideLeft: Variants;
  slideRight: Variants;
  scale: Variants;
  stagger: (delayPerChild?: number) => Variants;
}

/**
 * Returns motion variants that respect prefers-reduced-motion.
 * Hydration-safe: server always returns reduced=false (no motion removed),
 * client picks up the real preference after hydration.
 */
export function useMotion(): MotionVariants {
  // useReducedMotion() returns null on server → treat as false
  const reduced = useReducedMotion() === true;

  const fade: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: reduced ? 0.15 : 0.5 } },
  };

  const slideUp: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0.15 : 0.55 },
    },
  };

  const slideDown: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0.15 : 0.5 },
    },
  };

  const slideLeft: Variants = {
    hidden: { opacity: 0, x: reduced ? 0 : 28 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: reduced ? 0.15 : 0.55 },
    },
  };

  const slideRight: Variants = {
    hidden: { opacity: 0, x: reduced ? 0 : -28 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: reduced ? 0.15 : 0.55 },
    },
  };

  const scale: Variants = {
    hidden: { opacity: 0, scale: reduced ? 1 : 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: reduced ? 0.15 : 0.6 },
    },
  };

  const stagger = (delayPerChild = 0.07): Variants => ({
    hidden: {},
    visible: {
      transition: { staggerChildren: reduced ? 0 : delayPerChild },
    },
  });

  return { fade, slideUp, slideDown, slideLeft, slideRight, scale, stagger };
}
