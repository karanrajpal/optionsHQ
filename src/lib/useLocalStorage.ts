/**
 * Wrapper for localStorage to use in React components.
 * This hook provides a way to store and retrieve values from localStorage
 * while also handling JSON serialization and deserialization.
 * It also ensures that the value is only set in localStorage when the component is mounted.
 */
import { useState, useEffect, Dispatch, SetStateAction } from 'react';

export function useLocalStorage<T = any>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValueState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T : defaultValue;
  });

  const setValue: Dispatch<SetStateAction<T>> = (newValue) => {
    setValueState(prev => {
      const valueToStore = typeof newValue === 'function' ? (newValue as Function)(prev) : newValue;
      localStorage.setItem(key, JSON.stringify(valueToStore));
      return valueToStore;
    });
  };

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
