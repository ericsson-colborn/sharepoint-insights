import { memo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * A scroll indicator button with up/down chevron icon.
 * Provides visual feedback for scrolling navigation between sections.
 *
 * @example
 * ```tsx
 * <ScrollButton
 *   direction="down"
 *   onClick={() => smoothScrollTo('#next-section')}
 *   label="Scroll to next section"
 * />
 * ```
 */
interface ScrollButtonProps {
  /** Direction of the chevron icon */
  direction: 'up' | 'down';
  /** Callback fired when button is clicked */
  onClick: () => void;
  /** Accessible label for screen readers */
  label: string;
  /** Additional CSS classes to apply */
  className?: string;
}

export const ScrollButton = memo(function ScrollButton({
  direction,
  onClick,
  label,
  className = ''
}: ScrollButtonProps) {
  const Icon = direction === 'up' ? ChevronUp : ChevronDown;

  return (
    <button
      onClick={onClick}
      className={`hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent rounded ${className}`}
      aria-label={label}
    >
      <Icon className="h-5 w-5 text-white/70 hover:text-white" />
    </button>
  );
});
