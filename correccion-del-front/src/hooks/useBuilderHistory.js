import { useState, useCallback } from 'react';

const useBuilderHistory = (initialState) => {
  // Ensure initialState is always an array if not provided
  const [history, setHistory] = useState([initialState || []]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentState = history[currentIndex] || [];

  const pushState = useCallback((newState) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, currentIndex + 1);
      return [...newHistory, newState];
    });
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    state: currentState,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    history
  };
};

export default useBuilderHistory;