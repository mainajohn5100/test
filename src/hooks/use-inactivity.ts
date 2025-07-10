
'use client';

import { useEffect, useRef } from 'react';
import { useSettings } from '@/contexts/settings-context';

export function useInactivity(onInactive: () => void) {
  const { inactivityTimeout } = useSettings();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const events = ['mousemove', 'keydown', 'click', 'scroll'];

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(onInactive, inactivityTimeout * 60 * 1000);
  };

  useEffect(() => {
    resetTimer();

    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [inactivityTimeout, onInactive]);

  return null;
}
