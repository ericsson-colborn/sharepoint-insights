import { memo } from 'react';

/**
 * A reusable component for rendering text with gradient colors.
 * Uses Tailwind's gradient utilities with bg-clip-text for the gradient effect.
 *
 * @example
 * ```tsx
 * <GradientText from="blue-400" via="primary" to="cyan-400">
 *   Amazing Text
 * </GradientText>
 * ```
 */
interface GradientTextProps {
  /** The content to render with gradient styling */
  children: React.ReactNode;
  /** Starting gradient color (Tailwind color name) */
  from: string;
  /** Optional middle gradient color (Tailwind color name) */
  via?: string;
  /** Ending gradient color (Tailwind color name) */
  to: string;
  /** Additional CSS classes to apply */
  className?: string;
}

export const GradientText = memo(function GradientText({
  children,
  from,
  via,
  to,
  className = ''
}: GradientTextProps) {
  const gradientClass = via
    ? `bg-gradient-to-r from-${from} via-${via} to-${to}`
    : `bg-gradient-to-r from-${from} to-${to}`;

  return (
    <span className={`${gradientClass} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
});
