'use client';

import { useCallback, useState } from 'react';

type HistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};

const MAX_HISTORY = 50;

export function useProjectHistory<T>(initialValue: T) {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialValue,
    future: [],
  });

  const commit = useCallback((next: T | ((current: T) => T)) => {
    setHistory((current) => {
      const nextValue = typeof next === 'function'
        ? (next as (current: T) => T)(current.present)
        : next;
      if (Object.is(nextValue, current.present)) return current;
      return {
        past: [...current.past, current.present].slice(-MAX_HISTORY),
        present: nextValue,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((current) => {
      const previous = current.past.at(-1);
      if (!previous) return current;
      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future].slice(0, MAX_HISTORY),
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((current) => {
      const next = current.future[0];
      if (!next) return current;
      return {
        past: [...current.past, current.present].slice(-MAX_HISTORY),
        present: next,
        future: current.future.slice(1),
      };
    });
  }, []);

  const reset = useCallback((nextValue: T) => {
    setHistory({ past: [], present: nextValue, future: [] });
  }, []);

  return {
    value: history.present,
    commit,
    undo,
    redo,
    reset,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
