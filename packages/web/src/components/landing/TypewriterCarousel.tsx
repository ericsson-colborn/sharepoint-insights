import { memo, useEffect, useState } from 'react';

/**
 * Typewriter carousel component that cycles through phrases with typing effect.
 * Types out each phrase character by character, pauses, then deletes and moves
 * to the next phrase in a continuous loop. Includes a blinking cursor indicator.
 *
 * @example
 * ```tsx
 * <TypewriterCarousel
 *   phrases={['Better insights.', 'Clearer patterns.', 'Faster synthesis.']}
 *   typingSpeed={50}
 *   pauseDuration={3000}
 *   deletingSpeed={30}
 * />
 * ```
 */
interface TypewriterCarouselProps {
  /** Array of phrases to cycle through */
  phrases: string[];
  /** Additional CSS classes to apply */
  className?: string;
  /** Milliseconds per character when typing (default: 100) */
  typingSpeed?: number;
  /** Milliseconds to pause after typing complete phrase (default: 3000) */
  pauseDuration?: number;
  /** Milliseconds per character when deleting (default: 50) */
  deletingSpeed?: number;
}

export const TypewriterCarousel = memo(function TypewriterCarousel({
  phrases,
  className = '',
  typingSpeed = 100,
  pauseDuration = 3000,
  deletingSpeed = 50,
}: TypewriterCarouselProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) {
      const timeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(timeout);
    }

    const currentPhrase = phrases[currentPhraseIndex];
    if (!currentPhrase) return;

    if (!isDeleting) {
      // Typing
      if (displayedText.length < currentPhrase.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentPhrase.slice(0, displayedText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, pause before deleting
        setIsPaused(true);
      }
    } else {
      // Deleting
      if (displayedText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, deletingSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Finished deleting, move to next phrase
        setIsDeleting(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }
  }, [
    displayedText,
    isDeleting,
    isPaused,
    currentPhraseIndex,
    phrases,
    typingSpeed,
    pauseDuration,
    deletingSpeed,
  ]);

  return (
    <span className={className}>
      {displayedText}
      <span className="cursor-blink">|</span>
    </span>
  );
});
