import { useState, useCallback } from 'react';

// ✅ Context7 패턴: 안전한 로컬스토리지 접근
function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// ✅ Context7 패턴: 제네릭 타입으로 타입 안전성 보장
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // ✅ 초기값 계산 함수로 지연 평가
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isStorageAvailable()) {
      return initialValue;
    }

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // ✅ useCallback으로 함수 레퍼런스 안정화
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // ✅ 함수형 업데이트 지원
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (isStorageAvailable()) {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
} 