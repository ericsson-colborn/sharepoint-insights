interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  color?: 'primary' | 'muted';
  /** Whether to center the spinner in its container */
  centered?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label for screen readers */
  label?: string;
}

const sizeStyles = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-3',
};

const colorStyles = {
  primary: 'border-primary border-r-transparent',
  muted: 'border-blue-400 border-r-transparent',
};

/**
 * A reusable loading spinner component with customizable size and color.
 */
export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  centered = false,
  className = '',
  label = 'Loading',
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={`inline-block animate-spin rounded-full border-solid ${sizeStyles[size]} ${colorStyles[color]} ${className}`}
      role="status"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
    </div>
  );

  if (centered) {
    return (
      <div className="text-center py-8">
        {spinner}
      </div>
    );
  }

  return spinner;
}
