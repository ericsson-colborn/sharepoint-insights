import { memo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Comparison data for a single competitor.
 */
interface Comparison {
  /** Name of the competing product */
  name: string;
  /** Logo image URL */
  logo: string;
  /** Features that are similar to our product */
  similar: string[];
  /** Features that differentiate our product */
  different: string[];
}

/**
 * Carousel component for displaying competitor comparisons.
 * Shows multiple comparison cards at once with navigation controls and
 * dot indicators. Cards display similarities and differences for each competitor.
 *
 * @example
 * ```tsx
 * <ComparisonCarousel
 *   comparisons={[
 *     { name: 'Dovetail', logo: dovetailLogo, similar: [...], different: [...] }
 *   ]}
 *   cardsPerPage={3}
 * />
 * ```
 */
interface ComparisonCarouselProps {
  /** Array of competitor comparison data */
  comparisons: Comparison[];
  /** Number of cards to display at once (default: 3) */
  cardsPerPage?: number;
}

export const ComparisonCarousel = memo(function ComparisonCarousel({ comparisons, cardsPerPage = 3 }: ComparisonCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? comparisons.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === comparisons.length - 1 ? 0 : prev + 1));
  };

  // Get 3 visible cards
  const getVisibleComparisons = () => {
    const visible: Comparison[] = [];
    for (let i = 0; i < cardsPerPage; i++) {
      const index = (currentIndex + i) % comparisons.length;
      const comparison = comparisons[index];
      if (comparison) {
        visible.push(comparison);
      }
    }
    return visible;
  };

  const visibleComparisons = getVisibleComparisons();

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Viewport */}
      <div className="overflow-hidden">
        {/* Cards grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {visibleComparisons.map((comparison, index) => (
            <Card
              key={`${comparison.name}-${currentIndex}-${index}`}
              className="border-2 border-white/20 hover:border-primary hover:shadow-xl transition-colors bg-white/10 backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl mb-2 text-white">
                  <span>vs. {comparison.name}</span>
                  <img src={comparison.logo} alt={comparison.name} className="h-8 w-8 object-contain" />
                </CardTitle>
                <CardDescription className="text-base">
                  <div className="space-y-2 text-left">
                    <p className="font-semibold text-white">What's similar:</p>
                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-300">
                      {comparison.similar.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                    <p className="font-semibold text-white mt-4">What's different:</p>
                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-300">
                      {comparison.different.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={handleNext}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all shadow-lg"
        aria-label="Previous comparison"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
      <button
        onClick={handlePrev}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all shadow-lg"
        aria-label="Next comparison"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-8">
        {comparisons.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-primary w-8'
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to comparison ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
});
