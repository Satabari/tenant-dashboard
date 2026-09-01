import { useEffect, useState } from "react";

/**
 * Custom hook for syncing state with localStorage
 * @param key - localStorage key
 * @param initialValue - initial value if localStorage is empty
 * @returns [storedValue, setValue, clearValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading from localStorage [${key}]:`, error);
    }
    setIsLoaded(true);
  }, [key]);

  // Persist to localStorage whenever value changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error writing to localStorage [${key}]:`, error);
    }
  }, [storedValue, key, isLoaded]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      setStoredValue((prevValue) =>
        typeof value === "function" ? (value as (val: T) => T)(prevValue) : value
      );
    } catch (error) {
      console.error(`Error setting value for localStorage [${key}]:`, error);
    }
  };

  const clearValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error clearing localStorage [${key}]:`, error);
    }
  };

  return [storedValue, setValue, clearValue];
}
