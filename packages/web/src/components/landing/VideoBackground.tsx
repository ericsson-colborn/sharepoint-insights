import { ReactNode, useEffect, useRef, useState } from 'react';

interface VideoBackgroundProps {
  videoSrc: string;
  children: ReactNode;
  overlayOpacity?: number; // 0-1, default 0.85
  enableParallax?: boolean;
  className?: string;
}

export function VideoBackground({
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
}
