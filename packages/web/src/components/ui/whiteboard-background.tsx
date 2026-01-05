/**
 * WhiteboardBackground
 *
 * A subtle dot-grid background pattern similar to Excalidraw/ReactFlow,
 * with an optional gradient overlay. Creates a canvas-like aesthetic.
 */

interface WhiteboardBackgroundProps {
  children: React.ReactNode;
  /** Dot color - defaults to a subtle gray */
  dotColor?: string;
  /** Dot size in pixels - defaults to 1 */
  dotSize?: number;
  /** Gap between dots in pixels - defaults to 20 */
  dotGap?: number;
  /** Whether to show the gradient overlay - defaults to true */
  showGradient?: boolean;
  /** Additional className for the container */
  className?: string;
}

export function WhiteboardBackground({
  children,
  dotColor = 'rgba(0, 0, 0, 0.08)',
  dotSize = 1,
  dotGap = 20,
  showGradient = true,
  className = '',
}: WhiteboardBackgroundProps) {
  // Create the dot pattern using radial-gradient
  const dotPattern = `radial-gradient(circle, ${dotColor} ${dotSize}px, transparent ${dotSize}px)`;

  return (
    <div className={`relative ${className}`}>
      {/* Dot grid layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: dotPattern,
          backgroundSize: `${dotGap}px ${dotGap}px`,
          backgroundPosition: `${dotGap / 2}px ${dotGap / 2}px`,
        }}
        aria-hidden="true"
      />

      {/* Gradient overlay layer */}
      {showGradient && (
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/80 via-white/40 to-primary/20"
          aria-hidden="true"
        />
      )}

      {/* Content layer - uses same flex alignment as parent */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
