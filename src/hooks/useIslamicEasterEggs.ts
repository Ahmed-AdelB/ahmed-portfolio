import { useState, useEffect, useCallback } from 'react';

// Simplified 99 Names subset for demo
const NAMES_OF_ALLAH = [
  { ar: "Ar-Rahman", en: "The Beneficent", meaning: "He who wills goodness and mercy for all His creatures" },
  { ar: "Ar-Raheem", en: "The Merciful", meaning: "He who acts with extreme kindness" },
  { ar: "Al-Malik", en: "The King", meaning: "The Sovereign Lord, The One with the complete Dominion" },
  { ar: "Al-Quddus", en: "The Most Holy", meaning: "The One who is pure from any imperfection" },
  { ar: "As-Salam", en: "The Source of Peace", meaning: "The One who is free from every imperfection and safety from every defect" }
];

export interface UseIslamicEasterEggsReturn {
  activeEgg: 'bismillah' | 'salaam' | '99' | null;
  eggData?: any;
  dismissEgg: () => void;
}

export function useIslamicEasterEggs(): UseIslamicEasterEggsReturn {
  const [activeEgg, setActiveEgg] = useState<'bismillah' | 'salaam' | '99' | null>(null);
  const [eggData, setEggData] = useState<any>(null);
  const [inputBuffer, setInputBuffer] = useState('');

  const resetEgg = useCallback(() => {
    setActiveEgg(null);
    setEggData(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = document.activeElement as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' || 
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      
      // Update buffer (keep last 20 chars max)
      setInputBuffer(prev => (prev + key).slice(-20));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // Check buffer for patterns
    if (inputBuffer.endsWith('bismillah')) {
      setActiveEgg('bismillah');
      setInputBuffer(''); // clear buffer
      setTimeout(resetEgg, 4000); // Auto dismiss bismillah after animation
    } else if (inputBuffer.endsWith('salaam')) {
      setActiveEgg('salaam');
      setInputBuffer('');
      setTimeout(resetEgg, 3000);
    } else if (inputBuffer.endsWith('99')) {
      setActiveEgg('99');
      const randomName = NAMES_OF_ALLAH[Math.floor(Math.random() * NAMES_OF_ALLAH.length)];
      setEggData(randomName);
      setInputBuffer('');
      setTimeout(resetEgg, 5000);
    }
  }, [inputBuffer, resetEgg]);

  return {
    activeEgg,
    eggData,
    dismissEgg: resetEgg
  };
}
