/**
 * Shared animation styles and constants for landing page components.
 * Centralizes all animation timing values for consistency across the landing page.
 *
 * @example
 * ```tsx
 * import { ANIMATION_DURATIONS, cursorBlinkKeyframes } from './animations';
 *
 * // Use in inline styles
 * <style>{`
 *   .cursor {
 *     animation: cursorBlink ${ANIMATION_DURATIONS.cursorBlink}ms step-end infinite;
 *   }
 *   ${cursorBlinkKeyframes}
 * `}</style>
 * ```
 */

/**
 * Animation duration constants in milliseconds.
 * All timing values are centralized here for easy adjustment.
 */
export const ANIMATION_DURATIONS = {
  /** Duration per character for typewriter effect */
  typewriter: 50,
  /** Pause duration between typewriter phrases */
  typewriterPause: 3000,
  /** Duration for shimmer text effect */
  shimmer: 6000,
  /** Duration for logo pulse animation */
  logoPulse: 3000,
  /** Duration for logo spin animation */
  logoSpin: 2500,
  /** Duration for icon flip on hover */
  iconFlip: 600,
  /** Duration for cursor blink cycle */
  cursorBlink: 1060,
} as const;

/** CSS keyframes for cursor blink animation */
export const cursorBlinkKeyframes = `
  @keyframes cursorBlink {
    0%, 49% {
      opacity: 1;
    }
    50%, 100% {
      opacity: 0;
    }
  }
`;

/** CSS keyframes for text shimmer effect */
export const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      background-position: -200% center;
    }
    100% {
      background-position: 200% center;
    }
  }
`;

/** CSS keyframes for logo 3D spin animation */
export const logoSpinKeyframes = `
  @keyframes logo-spin {
    from { transform: rotateY(0deg); }
    to { transform: rotateY(360deg); }
  }
`;

/** CSS keyframes for logo pulse (scale) animation */
export const logoPulseKeyframes = `
  @keyframes logoPulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
`;

/** CSS keyframes for icon horizontal flip animation */
export const iconFlipKeyframes = `
  @keyframes flipHorizontal {
    from {
      transform: rotateY(0deg);
    }
    to {
      transform: rotateY(360deg);
    }
  }
`;

/** CSS keyframes for wiggle rotation animation */
export const wiggleKeyframes = `
  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-5deg); }
    75% { transform: rotate(5deg); }
  }
`;

/**
 * Pre-configured cursor blink animation class.
 * Can be used directly in style objects.
 */
export const cursorBlinkClass = {
  animation: `cursorBlink ${ANIMATION_DURATIONS.cursorBlink}ms step-end infinite`,
};
