import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  /** Icon component to display */
  icon?: LucideIcon;
  /** Custom icon element (alternative to icon prop) */
  iconElement?: ReactNode;
  /** Primary message */
  title: string;
  /** Secondary description */
  description?: string;
  /** Optional action button or content */
  action?: ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const sizeStyles = {
  sm: {
    container: 'py-6',
    icon: 'h-8 w-8',
    title: 'text-sm',
    description: 'text-xs',
  },
  md: {
    container: 'py-8',
    icon: 'h-12 w-12',
    title: 'text-sm',
    description: 'text-xs',
  },
  lg: {
    container: 'py-12',
    icon: 'h-16 w-16',
    title: 'text-sm font-medium',
    description: 'text-xs',
  },
};

/**
 * A reusable empty state component for displaying placeholder content
 * when no data is available.
 */
export function EmptyState({
  icon: Icon,
  iconElement,
  title,
  description,
  action,
  size = 'md',
  className = '',
}: EmptyStateProps) {
  const styles = sizeStyles[size];

  return (
    <div className={`text-center ${styles.container} text-muted-foreground ${className}`}>
      {iconElement ? (
        <div className="mx-auto mb-4">{iconElement}</div>
      ) : Icon ? (
        <Icon className={`mx-auto ${styles.icon} mb-4 opacity-50`} aria-hidden="true" />
      ) : null}
      <p className={styles.title}>{title}</p>
      {description && (
        <p className={`${styles.description} mt-1`}>{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
