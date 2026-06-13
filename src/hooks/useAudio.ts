import { useEffect, useRef } from 'react';

/**
 * Custom hook to load and play audio in the browser.
 * Safe for SSR and optimized for overlapping/rapid playbacks.
 */
export function useAudio(url: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio instance only in the browser (client-side)
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(url);
    }
  }, [url]);

  const play = () => {
    if (audioRef.current) {
      // Reset playback time to start, allowing overlap/spam playing
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        // Prevent console spam if autoplay is blocked by browser policies
        console.warn("Audio playback blocked or failed:", err.message);
      });
    }
  };

  return { play };
}
