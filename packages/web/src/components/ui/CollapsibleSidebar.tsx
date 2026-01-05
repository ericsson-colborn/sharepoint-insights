import { ReactNode } from 'react';
import { X, Menu, ChevronLeft } from 'lucide-react';
import { Button } from './button';
import { ScrollArea } from './scroll-area';

type SidebarPosition = 'left' | 'right';

interface CollapsibleSidebarProps {
  /** Whether the sidebar is currently open */
  isOpen: boolean;
  /** Callback to toggle the sidebar open/closed */
  onToggle: (open: boolean) => void;
  /** Title displayed in the sidebar header */
  title: string;
  /** Position of the sidebar */
  position: SidebarPosition;
  /** Content to render inside the sidebar */
  children: ReactNode;
  /** Optional header content (rendered next to title) */
  headerContent?: ReactNode;
  /** Width of the sidebar when open (default: 'w-80') */
  width?: string;
  /** ARIA label for the sidebar */
  ariaLabel: string;
  /** Custom class for the sidebar container */
  className?: string;
  /** Whether to use dark theme (default: false for right, true for left) */
  darkTheme?: boolean;
}

/**
 * A collapsible sidebar component with header, toggle button, and scrollable content.
 * Supports both left and right positioning with appropriate styling.
 */
export function CollapsibleSidebar({
  isOpen,
  onToggle,
  title,
  position,
  children,
  headerContent,
  width = 'w-80',
  ariaLabel,
  className = '',
  darkTheme,
}: CollapsibleSidebarProps) {
  // Default dark theme for left sidebar, light for right
  const isDark = darkTheme ?? position === 'left';

  const sidebarClasses = isDark
    ? 'bg-gray-900 border-gray-700'
    : 'bg-card border-border';

  const headerClasses = isDark
    ? 'border-gray-700 text-gray-400'
    : 'border-border text-foreground';

  const closeButtonClasses = isDark
    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
    : 'text-muted-foreground hover:text-foreground';

  const borderSide = position === 'left' ? 'border-r' : 'border-l';

  const togglePosition = position === 'left'
    ? 'left-3'
    : 'right-3 rounded-l-md rounded-r-none';

  const ToggleIcon = position === 'left' ? Menu : ChevronLeft;
  const toggleAriaLabel = isOpen
    ? `Close ${ariaLabel}`
    : position === 'left'
      ? `Open ${ariaLabel}`
      : `Show ${ariaLabel}`;

  return (
    <>
      <aside
        aria-label={ariaLabel}
        className={`${sidebarClasses} ${borderSide} transition-all duration-300 ease-in-out ${
          isOpen ? width : 'w-0'
        } overflow-hidden h-full ${className}`}
      >
        <div className={`h-full ${width} flex flex-col`}>
          <div className={`p-3 border-b ${headerClasses} flex items-center justify-between flex-shrink-0`}>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide">{title}</h2>
              {headerContent}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggle(false)}
              className={`h-8 w-8 ${closeButtonClasses} relative z-50`}
              aria-label={`Close ${ariaLabel}`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            {children}
          </ScrollArea>
        </div>
      </aside>

      {/* Toggle button when collapsed */}
      {!isOpen && (
        <Button
          variant={position === 'left' ? 'ghost' : 'outline'}
          size="icon"
          onClick={() => onToggle(true)}
          className={`absolute top-3 ${togglePosition} z-10`}
          aria-label={toggleAriaLabel}
        >
          <ToggleIcon className="h-5 w-5" aria-hidden="true" />
        </Button>
      )}
    </>
  );
}
