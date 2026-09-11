import { useCallback, useEffect, useRef, useState } from 'react';

type UseGameTimerOptions = {
  active: boolean;
  finished: boolean;
  penaltyMs?: number;
};

export const useGameTimer = ({
  active,
  finished,
  penaltyMs = 0,
}: UseGameTimerOptions) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const startedAtRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now();
      setElapsedTime(0);
    }
  }, []);

  const reset = useCallback(() => {
    startedAtRef.current = null;
    setElapsedTime(0);
  }, []);

  const getElapsedTime = useCallback(
    () => (startedAtRef.current === null ? penaltyMs : Date.now() - startedAtRef.current + penaltyMs),
    [penaltyMs],
  );

  useEffect(() => {
    if (!active || finished || startedAtRef.current === null) return;

    const timer = window.setInterval(() => {
      setElapsedTime(getElapsedTime());
    }, 100);

    return () => window.clearInterval(timer);
  }, [active, finished, getElapsedTime]);

  return {
    elapsedTime,
    startedAt: startedAtRef.current,
    start,
    reset,
    getElapsedTime,
  };
};
