import { memo, ReactNode, useEffect, useRef, useState } from 'react';

/**
 * Video background section with parallax scrolling effect.
 * Wraps children with a looping background video and gradient overlay.
 * Optionally applies parallax scroll effect to create depth. Used to create
 * immersive background sections on the landing page.
 *
 * @example
 * ```tsx
 * <VideoBackground
 *   videoSrc={backgroundVideo}
 *   overlayOpacity={0.9}
 *   enableParallax={true}
 * >
 *   <YourContent />
 * </VideoBackground>
 * ```
 */
interface VideoBackgroundProps {
  /** URL or import path to the video file (MP4) */
  videoSrc: string;
  /** Content to render on top of the video background */
  children: ReactNode;
  /** Opacity of the dark gradient overlay (0-1, default: 0.85) */
  overlayOpacity?: number;
  /** Enable parallax scrolling effect on video (default: true) */
  enableParallax?: boolean;
  /** Additional CSS classes to apply to the section */
  className?: string;
}

export const VideoBackground = memo(function VideoBackground({
  videoSrc,
  children,
  overlayOpacity = 0.85,
  enableParallax = true,
  className = '',
}: VideoBackgroundProps) {
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enableParallax) return;

    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const scrollProgress = -rect.top / (rect.height + window.innerHeight);
        setScrollY(scrollProgress * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, [enableParallax]);

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={
            enableParallax
              ? {
                  transform: `translateY(${scrollY * 0.5}px)`,
                  transition: 'transform 0.1s ease-out',
                }
              : undefined
          }
        >
          <source src={videoSrc} type="video/mp4" />
        </video>

        {/* Gradient Overlay - Dark and dramatic */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-800/90 to-gray-900/95"
          style={{ opacity: overlayOpacity }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </section>
  );
});
